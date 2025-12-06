import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import config from './config.mjs';
import logger from './logger.mjs';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/node';

function loadAbi() {
  // Prefer local ABI JSON if present
  const candidates = [
    path.resolve(process.cwd(), 'abi', 'ZamaHealthABI.json'),
    path.resolve(process.cwd(), 'abi', 'ZamaHealth.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const json = JSON.parse(raw);
        return json.abi ? json.abi : json; // support truffle/ethers formats
      } catch (e) {
        logger.error(`Failed to parse ABI at ${p}: ${e}`);
      }
    }
  }
  throw new Error('ABI not found. Please add ABI at ./abi/ZamaHealthABI.json');
}

export async function startListener() {
  logger.info('Starting event listener...');

  const rpcUrl = config.rpc;
  const contractAddress = config.contractAddress;
  if (!rpcUrl) throw new Error('Missing RPC URL (SEPOLIA_RPC)');
  if (!contractAddress) throw new Error('Missing CONTRACT_ADDRESS');

  const abi = loadAbi();

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(config.privateKey, provider);
  const contract = new Contract(contractAddress, abi, wallet);

  async function retryWithBackoff(fn, { retries = 4, baseMs = 500, factor = 2, label = 'op' } = {}) {
    let attempt = 0;
    let delay = baseMs;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (e) {
        attempt += 1;
        if (attempt > retries) throw e;
        logger.warn(`Retry ${label} attempt ${attempt}/${retries} after error: ${e}`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= factor;
      }
    }
  }

  // SessionInputSubmitted(uint256 sessionId)
  contract.on('SessionInputSubmitted', async (...args) => {
    try {
      const event = args[args.length - 1];
      const sessionId = args[0]?.toString?.() ?? String(args[0]);
      logger.info(`SessionInputSubmitted detected | sessionId=${sessionId} | tx=${event?.transactionHash}`);

      // 1) Fetch encrypted inputs from contract
      if (typeof contract.getEncryptedInputs !== 'function') {
        logger.error('getEncryptedInputs(sessionId) is not available on contract ABI');
        return;
      }
      const enc = await contract.getEncryptedInputs(sessionId);

      // Support both tuple object and array return shapes
      const encWeight = enc?.weight ?? enc?.[0];
      const encHeight = enc?.height ?? enc?.[1];
      const encExercise = enc?.exercise ?? enc?.[2];
      const encDiet = enc?.diet ?? enc?.[3];

      if (!encWeight || !encHeight || !encExercise || !encDiet) {
        logger.error('Encrypted inputs missing or malformed');
        return;
      }

      logger.info('Encrypted inputs fetched', {
        weight: String(encWeight),
        height: String(encHeight),
        exercise: String(encExercise),
        diet: String(encDiet),
      });

      // Decrypt handles (userDecrypt with backend oracle)
      // Override RPC từ SepoliaConfig với custom RPC
      const sdk = await createInstance({ ...SepoliaConfig, network: config.rpc });
      const handlePairs = [
        { handle: encWeight, contractAddress },
        { handle: encHeight, contractAddress },
        { handle: encExercise, contractAddress },
        { handle: encDiet, contractAddress },
      ];
      try {
        // 1) Create a temporary keypair for the decrypt request
        const { privateKey: userPriv, publicKey: userPub } = sdk.generateKeypair();
        // 2) Create EIP-712 typed data and sign with backend oracle
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = '10';
        const eip712 = sdk.createEIP712(userPub, [contractAddress], startTimestamp, durationDays);
        const signature = await wallet.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );
        // 3) userDecrypt (with retry/backoff)
        const out = await retryWithBackoff(
          () => sdk.userDecrypt(
            handlePairs,
            userPriv,
            userPub,
            signature.replace(/^0x/, ''),
            [contractAddress],
            wallet.address,
            startTimestamp,
            durationDays
          ),
          { label: 'userDecrypt' }
        );
        const toLogValue = (v) => (typeof v === 'bigint' ? v.toString() : v);
        logger.info('Decoded values', {
          weight: toLogValue(out[encWeight]),
          height: toLogValue(out[encHeight]),
          exercise: toLogValue(out[encExercise]),
          diet: toLogValue(out[encDiet]),
        });

        // Convert units for weight and height
        const weightNum = Number(out[encWeight]) / 100;
        const heightNum = Number(out[encHeight]) / 100;
        const exerciseNum = Number(out[encExercise]);
        const dietNum = Number(out[encDiet]);

        logger.info('ML inputs', { weight: weightNum, height: heightNum, exercise: exerciseNum, diet: dietNum });

        // Call Python ML inference
        const { execFile } = await import('child_process');
        const defaultPyPath = path.resolve(process.cwd(), '.venv', 'bin', 'python3');
        const pyPath = process.env.PYTHON_PATH || defaultPyPath;
        const scriptPath = path.resolve(process.cwd(), 'src', 'ml_inference.py');
        const args = [weightNum.toString(), heightNum.toString(), exerciseNum.toString(), dietNum.toString()];
      execFile(pyPath, [scriptPath, ...args], { cwd: process.cwd() }, async (err, stdout, stderr) => {
          if (err) {
            logger.error('ML inference error: ' + err);
            if (stderr) logger.error(stderr);
            return;
          }
          // Parse output
          logger.info('ML output:', stdout);
          const match = stdout.match(/RISK_LEVEL=(\d+)/);
          if (!match) {
            logger.error('Failed to parse risk level from stdout');
            return;
          }
          const riskLevel = Number(match[1]);
          logger.info('✅ ML Risk Level', { risk: riskLevel });
        // Next step: encrypt + submit to contract
        try {
          const resultInput = sdk.createEncryptedInput(contractAddress, wallet.address);
          resultInput.add64(BigInt(riskLevel));
          const encrypted = await retryWithBackoff(() => resultInput.encrypt(), { label: 'input-proof' });

          const extResult = encrypted.handles[0];
          const att = encrypted.inputProof;

          const tx = await retryWithBackoff(() => contract.submitEncryptedResult(sessionId, extResult, att), { label: 'submit' });
          await retryWithBackoff(() => tx.wait(), { label: 'tx.wait' });
          logger.info('✅ Result submitted', { tx: tx.hash, sessionId });
        } catch (e) {
          logger.error('Failed to submit encrypted result: ' + e);
        }
        });
      } catch (err) {
        logger.error('Failed userDecrypt: ' + err);
        return;
      }

      // Next step: decrypt via Relayer SDK (pending)
    } catch (err) {
      logger.error(`Error handling SessionInputSubmitted: ${err}`);
    }
  });

  logger.info('Listener active. Waiting for events...');
}


