# 🚀 Quick Start Guide

## Setup trong 5 phút

### 1. Clone & Setup

```bash
cd zama-health-backend
chmod +x setup.sh
./setup.sh
```

### 2. Copy ML Model

```bash
# Copy trained model từ zama_healthshield
cp -r ../zama_healthshield/server ml/
```

### 3. Configure

Edit `.env`:
```bash
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_backend_wallet_key
CONTRACT_ADDRESS=0x882dCd823847E2FE07BAFaF7E9FA5BfBA047d642
```

### 4. Test ML

```bash
npm run ml:test
```

Expect:
```
✅ Model loaded
📊 BMI: 23.0
🧠 Running FHE inference...
📈 Risk Level: 0 (Low)
```

### 5. Run Service

```bash
npm start
```

Service running on: http://localhost:3001

### 6. Health Check

```bash
curl http://localhost:3001/health
```

---

## 🐳 Docker Quickstart

```bash
# Build
docker-compose build

# Run
docker-compose up
```

---

## ☁️ Deploy to Railway

```bash
railway login
railway init
railway up
```

Thêm environment variables trên Railway dashboard.

---

## ✅ Verify

Check logs:
```
✅ Backend service started
✅ Connected to Sepolia
✅ Contract: 0x882d...
✅ Listening for events...
```

**Done!** Backend sẵn sàng xử lý sessions.

