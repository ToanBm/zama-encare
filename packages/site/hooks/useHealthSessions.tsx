import { useCallback } from "react";
import { Contract, ethers } from "ethers";
import { ZamaHealthABI } from "@/abi/ZamaHealthABI";
import { ZamaHealthAddresses } from "@/abi/ZamaHealthAddresses";
import { USDCoinABI } from "@/abi/USDCoinABI";
import { USDCoinAddresses } from "@/abi/USDCoinAddresses";

export type UseHealthSessionsArgs = {
  fhevmInstance: any;
  ethersSigner: ethers.Signer | null;
  ethersReadonlyProvider: ethers.Provider | null;
  chainId: number | null;
};

export type HealthSessionItem = {
  sessionId: number;
  resultReady: boolean;
  createdAt?: string;
};

function getContracts(
  ethersSigner: ethers.Signer | null,
  ethersReadonlyProvider: ethers.Provider | null,
  chainId: number | null
) {
  if ((!ethersSigner && !ethersReadonlyProvider) || !chainId) return null;
  const contractAddress = ZamaHealthAddresses[chainId.toString() as keyof typeof ZamaHealthAddresses]?.address;
  if (!contractAddress) return null;
  const signerOrProvider = ethersSigner || ethersReadonlyProvider!;
  const health = new Contract(contractAddress, ZamaHealthABI.abi, signerOrProvider);
  const usdcAddr = USDCoinAddresses[chainId.toString() as keyof typeof USDCoinAddresses]?.address;
  const usdc = usdcAddr ? new Contract(usdcAddr, USDCoinABI.abi, signerOrProvider) : null;
  return { health, healthAddress: contractAddress, usdc, usdcAddress: usdcAddr };
}

export function useHealthSessions({ fhevmInstance, ethersSigner, ethersReadonlyProvider, chainId }: UseHealthSessionsArgs) {
  const createSessionAndSubmit = useCallback(
    async (input: { weight: number; height: number; exercise: number; diet: number }) => {
      if (!fhevmInstance || !ethersSigner || !chainId) throw new Error("FHEVM or signer not ready");
      const c = getContracts(ethersSigner, ethersReadonlyProvider, chainId);
      if (!c || !c.usdc || !c.usdcAddress) throw new Error("Contracts not available");

      const userAddress = await ethersSigner.getAddress();
      const VISIT_FEE = ethers.parseUnits("10", 6);

      // Ensure balance and approval
      const balance = await c.usdc.balanceOf(userAddress);
      if (balance < VISIT_FEE) throw new Error("Insufficient USDC balance (need 10 USDC)");
      const allowance = await c.usdc.allowance(userAddress, c.healthAddress);
      if (allowance < VISIT_FEE) {
        const approveTx = await c.usdc.approve(c.healthAddress, VISIT_FEE);
        await approveTx.wait();
      }

      // Create session
      const txCreate = await c.health.createSession();
      const receiptCreate = await txCreate.wait();

      // Extract sessionId from logs
      let sessionId: number | null = null;
      if (receiptCreate.logs) {
        for (const log of receiptCreate.logs) {
          try {
            const parsed = c.health.interface.parseLog(log);
            if (parsed && parsed.name === "SessionCreated") {
              sessionId = Number(parsed.args[0]);
              break;
            }
          } catch {}
        }
      }
      if (sessionId === null) throw new Error("Unable to get session ID");

      // Created at from block
      let createdAt: string | undefined = undefined;
      const provider = ethersSigner.provider || ethersReadonlyProvider;
      if (provider) {
        const block = await provider.getBlock(receiptCreate.blockNumber);
        if (block?.timestamp) createdAt = new Date(Number(block.timestamp) * 1000).toLocaleString();
      }

      // Encrypt input and submit
      const normalizedContract = ethers.getAddress(c.healthAddress);
      const normalizedUser = ethers.getAddress(userAddress);
      const encInput = fhevmInstance.createEncryptedInput(normalizedContract, normalizedUser);
      encInput.add64(BigInt(Math.floor(input.weight * 100)));
      encInput.add64(BigInt(Math.floor(input.height * 100)));
      encInput.add8(input.exercise);
      encInput.add8(input.diet);
      const encrypted = await encInput.encrypt();

      const hexWeight = ethers.hexlify(encrypted.handles[0]);
      const hexHeight = ethers.hexlify(encrypted.handles[1]);
      const hexExercise = ethers.hexlify(encrypted.handles[2]);
      const hexDiet = ethers.hexlify(encrypted.handles[3]);
      const hexProof = ethers.hexlify(encrypted.inputProof);

      await c.health.submitEncryptedInput(sessionId, hexWeight, hexHeight, hexExercise, hexDiet, hexProof);

      return { sessionId, createdAt };
    },
    [fhevmInstance, ethersSigner, ethersReadonlyProvider, chainId]
  );

  const fetchMySessions = useCallback(async (): Promise<HealthSessionItem[]> => {
    if (!ethersSigner || !ethersReadonlyProvider) return [];
    const c = getContracts(ethersSigner, ethersReadonlyProvider, chainId);
    if (!c) return [];

    const userAddress = await ethersSigner.getAddress();
    const nextId = await c.health.nextSessionId();
    const items: HealthSessionItem[] = [];

    for (let i = 0; i < Number(nextId); i++) {
      try {
        const s = await c.health.sessions(i);
        const sUser = s.user ? String(s.user) : "";
        let isOwner = false;
        try { isOwner = ethers.getAddress(sUser) === ethers.getAddress(userAddress); } catch {}
        if (isOwner && s.exists) {
          let createdAt: string | undefined;
          try {
            const filter = c.health.filters.SessionCreated(i);
            const logs = await c.health.queryFilter(filter, 0, "latest");
            if (logs.length > 0) {
              const block = await (ethersReadonlyProvider || ethersSigner.provider)!.getBlock(logs[0].blockNumber);
              if (block?.timestamp) createdAt = new Date(Number(block.timestamp) * 1000).toLocaleString();
            }
          } catch {}
          items.push({ sessionId: i, resultReady: s.resultReady, createdAt });
        }
      } catch {}
    }

    return items.sort((a, b) => b.sessionId - a.sessionId);
  }, [ethersSigner, ethersReadonlyProvider, chainId]);

  const decryptResult = useCallback(
    async (sessionId: number): Promise<bigint | null> => {
      if (!fhevmInstance || !ethersSigner || !chainId) return null;
      const c = getContracts(ethersSigner, ethersReadonlyProvider, chainId);
      if (!c) return null;

      // Check status first
      const s = await c.health.sessions(sessionId);
      if (!s.resultReady) return null;

      // 1) get ciphertext handle
      const resultEnc = await c.health.getEncryptedResult(sessionId);
      const handle = (resultEnc as any)?.handle ?? (resultEnc as unknown as string);
      if (!handle) throw new Error("Invalid ciphertext handle");

      // 2) generate temp keypair and sign EIP-712
      const { privateKey, publicKey } = fhevmInstance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [c.healthAddress];
      const eip712 = fhevmInstance.createEIP712(publicKey, contractAddresses, startTimeStamp, durationDays);
      const signature = await (ethersSigner as any).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // 3) userDecrypt
      const userAddr = await ethersSigner.getAddress();
      const out = await fhevmInstance.userDecrypt(
        [{ handle, contractAddress: c.healthAddress }],
        privateKey,
        publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        userAddr,
        startTimeStamp,
        durationDays
      );

      const value = out[handle];
      if (typeof value === "boolean" || value == null) return null;
      return BigInt(value.toString());
    },
    [fhevmInstance, ethersSigner, ethersReadonlyProvider, chainId]
  );

  return {
    createSessionAndSubmit,
    fetchMySessions,
    decryptResult,
  };
}
