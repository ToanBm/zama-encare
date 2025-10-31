# Encare - Privacy-Preserving Health Risk Assessment

A secure health analysis platform built with Zama's FHEVM protocol, enabling private health risk assessment where your personal health data remains fully encrypted throughout the entire analysis process.

## 🎯 Features

### 🔒 Private Health Analysis
- **Encrypt Health Data**: Submit weight, height, exercise level, and diet score with full encryption
- **ML-Powered Analysis**: Backend processes encrypted data using Concrete ML
- **Private Results**: Only you can decrypt and view your health risk assessment
- **Session Management**: Track all your health reports with timestamps

### 🛡️ Security Features
- **FHE Encryption**: All health data encrypted using Fully Homomorphic Encryption
- **ACL Control**: Backend oracle has permission to decrypt only for ML processing
- **User Consent**: Wallet signature required for result decryption
- **Encrypted Storage**: Data remains encrypted on blockchain

## 🏗️ Architecture

### App Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SETUP (One-time)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Deploy contracts                                      │  │
│  │  • Set backend oracle address in contract                │  │
│  │  • Backend oracle-only ACL (no public decrypt)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ 1. Enter Health Data (weight, height, etc.)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Encryption)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • FHE Encrypt health data                               │  │
│  │  • Create session & pay 10 USDC fee                      │  │
│  │  • Submit encrypted data to contract                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ 2. submitEncryptedInput() + ACL
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              SMART CONTRACT (Blockchain)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Store encrypted health data                           │  │
│  │  • Grant ACL to backend oracle                           │  │
│  │  • Emit SessionInputSubmitted event                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ 3. Event detection
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ML Processing)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Listen for SessionInputSubmitted events              │  │
│  │  2. getEncryptedInputs() from contract                   │  │
│  │  3. Decrypt data with ACL permission                     │  │
│  │  4. Run ML inference (Concrete ML) → Risk Level 0/1/2    │  │
│  │  5. Encrypt result                                       │  │
│  │  6. submitEncryptedResult() to contract                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ 4. Store encrypted result
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              SMART CONTRACT (Blockchain)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Store encrypted result                                │  │
│  │  • Grant ACL to user                                     │  │
│  │  • Set resultReady = true                                │  │
│  │  • Emit SessionResultSubmitted event                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ 5. Check status & decrypt
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Decryption)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • User clicks "Check" button                            │  │
│  │  • getEncryptedResult() from contract                    │  │
│  │  • Sign EIP-712 (user consent)                           │  │
│  │  • Decrypt result using FHEVM                            │  │
│  │  • Display health risk level                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contracts

#### `USDCoin.sol`
- Mock USDC token (6 decimals)
- Used for session fees (10 USDC per analysis)

#### `ZamaHealth.sol` (FHEVM 0.8.0 Compliant)
- Session creation with fee payment
- Encrypted input submission (weight, height, exercise, diet)
- ACL permission management for backend oracle
- Encrypted result submission
- Owner functions: withdraw fees, update backend oracle, view contract balance

### Frontend

#### Components
- `WalletButton.tsx` - Wallet connection with Wagmi
- `TabNavigation.tsx` - Navigation between Health Check, Admin, Faucet
- `Create.tsx` - Create health sessions and view results
- `Admin.tsx` - Owner panel for session management, fees, and backend oracle
- `FaucetButton.tsx` - Get test USDC tokens

#### Hooks
- `useHealthSessions.tsx` - Session operations (create, fetch, decrypt)
- `useFhevm.tsx` - FHEVM instance management

### Backend (zama-health-backend)

- **Event Listener (Auto)**: Lắng nghe `SessionInputSubmitted`, tự động xử lý
- **Decryption (userDecrypt)**: Backend oracle giải mã bằng ACL (không publicDecrypt)
- **ML Inference**: Gọi `ml_inference.py` (Concrete ML, Python 3.11)
- **Encrypt & Submit**: Mã hóa risk level và `submitEncryptedResult`
- **Operational**: Retry/backoff relayer, `/health` để giám sát; không cần REST API cho FE

## 🚀 Setup

### Prerequisites
- Node.js 20+
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

1. **Clone and install dependencies:**
```bash
cd zama-health
node ./scripts/install.mjs
```

2. **Set up environment variables:**
```bash
cd packages/fhevm-hardhat-template
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
```

3. **Deploy contracts to Sepolia:**
```bash
# Deploy all contracts
npx hardhat deploy --network sepolia
```

4. **Generate ABIs for frontend:**
```bash
cd ../site
npm run genabi
```

5. **Run frontend:**
```bash
npm run dev
```

## 📝 Usage Guide

### Creating a Health Session

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Get USDC Tokens**: Click "Faucet" to receive test USDC
3. **Create Session**: 
   - Go to "Health Check" tab
   - Click "+ Create New"
   - Enter your health information:
     - Weight (kg)
     - Height (cm)
     - Exercise Level (1-5)
     - Diet Score (1-10)
   - Click "Create Session & Encrypt Data"
   - Approve USDC and confirm transactions
4. **View Status**: Click "Check" on session card to view status

### Viewing Results

1. **Check Status**: Click "Check" on session card
2. **Decrypt Result**:
   - If result is ready, click to sign with wallet
   - View your health risk level (0=Low, 1=Medium, 2=High)

### Admin Panel (Owner Only)

1. **Access Admin**: Click "Admin" tab (only visible to contract owner)
2. **Session Dashboard**: View total, completed, and pending sessions
3. **Revenue & Fees**: 
   - View available contract balance
   - Withdraw fees to recipient address
4. **Backend Oracle**: 
   - View current backend oracle address
   - Update backend oracle address

## ⚙️ Technical Details

### Encrypted Data Flow

```solidity
// 1. User creates session and pays fee
function createSession() external returns (uint256) {
    usdc.transferFrom(msg.sender, address(this), VISIT_FEE);
    // Create session and emit SessionCreated event
}

// 2. User submits encrypted health data
function submitEncryptedInput(sessionId, encryptedData) external {
    // Grant ACL permission to backend oracle
    FHE.allow(weight, backendOracle);
    FHE.allow(height, backendOracle);
    FHE.allow(exercise, backendOracle);
    FHE.allow(diet, backendOracle);
    // Store encrypted data
}

// 3. Backend decrypts, processes, and submits encrypted result
function submitEncryptedResult(sessionId, encryptedResult) external {
    // Grant ACL permission to user
    FHE.allow(result, s.user);
    // Store encrypted result
}
```

### Decryption Flow

```typescript
// 1. Get encrypted result from contract
const result = await contract.getEncryptedResult(sessionId);

// 2. Generate keypair and sign EIP-712
const { privateKey, publicKey } = fhevmInstance.generateKeypair();
const eip712 = fhevmInstance.createEIP712(...);
const signature = await signer.signTypedData(...);

// 3. Decrypt result
const decrypted = await fhevmInstance.userDecrypt(...);
```

## 🔐 Security

### Privacy Protection
- **Encrypted Health Data**: All inputs remain encrypted on blockchain
- **ACL Control**: Only backend oracle can decrypt for ML processing
- **User Consent**: Signature required for result decryption
- **Private Results**: Only user can decrypt their own results

### Access Control
- **Owner Functions**: Only contract owner can withdraw fees and update oracle
- **Session Ownership**: Users can only view their own sessions
- **Backend ACL**: Backend oracle has decryption permission for inputs only

## 📊 Current Status

✅ **Completed Features**:
- Create health sessions with encrypted data
- View session history with timestamps
- Decrypt and view health risk results
- Owner admin panel for management
- Session status tracking
- Backend Oracle ACL configuration
- Fee collection and withdrawal
- Backend auto-processing (listener → decrypt → ML → encrypt → submit)

⏳ **In Progress**:
- N/A

## 🐛 Known Limitations

1. Backend auto-processing requires FHEVM relayer to be running
2. Users must manually check session status
3. Results decryption requires wallet signature

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [Zama Oracle Guide](https://docs.zama.ai/protocol/solidity-guides/smart-contract/oracle)
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [Concrete ML Documentation](https://docs.zama.ai/concrete-ml)

## 🆘 Support

- GitHub Issues: Report bugs or request features
- Zama Discord: Community support and discussions
- FHEVM Docs: Official protocol documentation

---

**Encare** - Privacy-preserving health analysis powered by Zama's FHE technology. 🔒🏥