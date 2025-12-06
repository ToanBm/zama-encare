/**
 * ✅ Register Backend Oracle key with Zama Gateway (Sepolia)
 * Run ONCE per backend wallet
 */

import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { createInstance, SepoliaConfig } = require("@zama-fhe/relayer-sdk/node");

// Import config to get custom RPC
import config from './config.mjs';

async function main() {
  console.log("🔑 Registering Backend Oracle key with Zama Gateway...");

  const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
  const BACKEND_ORACLE_ADDRESS = process.env.BACKEND_ORACLE_ADDRESS;

  if (!BACKEND_PRIVATE_KEY || !BACKEND_ORACLE_ADDRESS) {
    throw new Error("❌ Missing BACKEND_PRIVATE_KEY or BACKEND_ORACLE_ADDRESS in .env");
  }

  console.log("📍 Backend Oracle Address:", BACKEND_ORACLE_ADDRESS);

  // 1️⃣ Kết nối đến Gateway SDK với private key backend
  // Override RPC from SepoliaConfig (which uses blastapi) with our custom RPC
  const sdk = await createInstance({
    ...SepoliaConfig,
    network: config.rpc, // Use RPC from .env instead of blastapi
    privateKey: BACKEND_PRIVATE_KEY,
  });

  // 2️⃣ SDK hiện không có hàm registerKey. Thay vào đó, đọc public key hiện tại của relayer
  const relayerPk = sdk.getPublicKey();
  console.log("🔑 Relayer Public Key:", relayerPk);
  console.log("📡 Backend có thể dùng publicDecrypt/userDecrypt tùy theo ACL.");
}

main().catch((err) => {
  console.error("❌ Error registering backend key:", err);
  process.exit(1);
});
