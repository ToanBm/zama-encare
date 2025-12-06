import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Blockchain
  rpc: process.env.SEPOLIA_RPC,
  privateKey: process.env.BACKEND_PRIVATE_KEY,
  chainId: parseInt(process.env.CHAIN_ID || '11155111'),
  
  // Contracts
  contractAddress: process.env.CONTRACT_ADDRESS,
  usdcAddress: process.env.USDC_ADDRESS,
  backendOracleAddress: process.env.BACKEND_ORACLE_ADDRESS || '0x0A4e5eC7600829002cb4564bBaf5E21027E64E2E',
  
  // FHEVM
  gatewayUrl: process.env.GATEWAY_URL || 'https://gateway.sepolia.zama.ai',
  
  // Service
  pollingInterval: parseInt(process.env.POLLING_INTERVAL || '60000'),
  logLevel: process.env.LOG_LEVEL || 'info',
  port: parseInt(process.env.PORT || '3001'),
  
  // ML
  pythonPath: process.env.PYTHON_PATH || 'python3',
  mlModelPath: process.env.ML_MODEL_PATH || './ml/server',
};

// Validate required config
const required = ['rpc', 'privateKey', 'contractAddress'];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required config: ${key}`);
  }
}

export default config;

