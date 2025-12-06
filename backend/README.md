# 🏥 ZamaHealth Backend Service

Backend service xử lý encrypted health data với Concrete ML và submit encrypted results lên blockchain.

## 🎯 Features

- ✅ **Auto Event Listener**: Tự động detect sessions mới
- 🔐 **FHE Decryption**: Decrypt encrypted health data từ blockchain
- 🧠 **ML Inference**: Run trained Concrete ML model
- 🔒 **FHE Encryption**: Encrypt prediction results
- 📤 **Auto Submit**: Submit encrypted results lên smart contract
- 📊 **Monitoring**: Health check và logging

## 📋 Prerequisites

- Node.js >= 18
- Python >= 3.9
- Docker (optional, cho local testing)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
pip install -r requirements.txt
```

### 2. Setup ML Model

Copy trained model từ `zama_healthshield/`:

```bash
mkdir -p ml
cp -r ../zama_healthshield/server ml/
```

### 3. Configure Environment

Copy `.env.example` to `.env` và điền thông tin:

```bash
cp .env.example .env
```

Edit `.env`:
```
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_backend_wallet_private_key
CONTRACT_ADDRESS=0x882dCd823847E2FE07BAFaF7E9FA5BfBA047d642
```

### 4. Run Service

```bash
npm start
```

## 🐳 Docker

### Local Development

```bash
docker-compose up
```

### Production Build

```bash
docker build -t zama-health-backend .
docker run -p 3001:3001 --env-file .env zama-health-backend
```

## 📡 Deployment

### Railway

```bash
railway init
railway up
```

### Render

Kết nối repo và Render tự động deploy từ `Dockerfile`.

## 🔧 Architecture

```
User (Frontend)
    ↓ Create Session & Submit Encrypted Data
Blockchain (Smart Contract)
    ↓ Emit SessionInputSubmitted Event
Backend Listener
    ↓ Detect Event
Decrypt Module
    ↓ Decrypt with ACL Permission
ML Module (Concrete ML)
    ↓ Run Inference
    ↓ Predict Risk Level (0/1/2)
Encryption Module
    ↓ Encrypt Result
Submit Module
    ↓ Submit to Contract
Blockchain
    ↓ Store Encrypted Result
User
    ↓ Decrypt & View Result
```

## 📂 Project Structure

```
zama-health-backend/
├── src/
│   ├── index.mjs           # Main service entry
│   ├── config.mjs          # Configuration
│   ├── logger.mjs          # Winston logger
│   ├── listener.mjs        # Event listener
│   ├── decrypt.mjs         # Decryption module
│   ├── ml_inference.py     # ML inference
│   └── submit.mjs          # Submit results
├── ml/
│   └── server/             # Trained Concrete ML model
│       ├── server.zip
│       └── client.zip
├── abi/
│   └── ZamaHealthABI.json  # Contract ABI
├── Dockerfile
├── docker-compose.yml
├── package.json
├── requirements.txt
└── README.md
```

## 🔐 Security

- Backend wallet chỉ dùng để submit results
- Không store user data
- ACL permissions được quản lý bởi smart contract
- Keys được encrypt và store an toàn

## 📊 Monitoring

Health check endpoint:
```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 12345,
  "processedSessions": 42
}
```

## 🐛 Troubleshooting

**Error: "Cannot connect to blockchain"**
→ Check SEPOLIA_RPC in .env

**Error: "ML model not found"**
→ Ensure `ml/server/` contains model files

**Error: "Decryption failed"**
→ Backend wallet needs ACL permission from contract

## 📚 Documentation

- [Contract Integration](./docs/contract.md)
- [ML Model](./docs/ml.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 License

MIT

