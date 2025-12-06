# 🚀 Hướng dẫn Deploy ZamaHealth Backend lên VPS với PM2

## 📋 Yêu cầu

- VPS với Ubuntu/Debian
- Node.js >= 18
- Python 3.11 (bắt buộc cho Concrete ML)
- PM2 đã cài đặt
- Ngrok (nếu cần expose public)

## 🔧 Bước 1: Chuẩn bị trên VPS

### 1.1. Clone/Copy project lên VPS

```bash
# Nếu dùng git
git clone <your-repo> zama-health
cd zama-health/backend

# Hoặc upload qua SCP/SFTP
```

### 1.2. Cài đặt Python 3.11

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# Verify
python3.11 --version  # Phải hiển thị Python 3.11.x
```

### 1.3. Tạo Python Virtual Environment

```bash
cd zama-health/backend

# Tạo venv với Python 3.11
python3.11 -m venv .venv

# Activate và cài dependencies
source .venv/bin/activate
pip install -r requirements.txt

# Verify
.venv/bin/python3 --version  # Phải là Python 3.11.x
.venv/bin/pip list | grep concrete-ml  # Kiểm tra concrete-ml đã cài
```

### 1.4. Cài đặt Node.js Dependencies

```bash
npm install
```

### 1.5. Cấu hình Environment Variables

Tạo file `.env`:

```bash
nano .env
```

Nội dung `.env`:

```env
# Blockchain Configuration
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BACKEND_PRIVATE_KEY=your_backend_wallet_private_key_without_0x
CHAIN_ID=11155111

# Contract Addresses
CONTRACT_ADDRESS=0x0e4DF67c27f0dd13da9333221E52E2c9590F9678
USDC_ADDRESS=your_usdc_address
BACKEND_ORACLE_ADDRESS=0x0A4e5eC7600829002cb4564bBaf5E21027E64E2E

# FHEVM Configuration
GATEWAY_URL=https://gateway.sepolia.zama.ai

# Service Configuration
POLLING_INTERVAL=60000
LOG_LEVEL=info
PORT=3001

# Python Configuration (quan trọng!)
PYTHON_PATH=/path/to/zama-health/backend/.venv/bin/python3
ML_MODEL_PATH=./ml/server
```

**Lưu ý:** Đổi `PYTHON_PATH` theo đường dẫn thực tế trên VPS của bạn!

## 🎯 Bước 2: Cấu hình PM2

### 2.1. Sửa ecosystem.config.js

Mở file `ecosystem.config.js` và sửa `cwd` theo path thực tế trên VPS:

```javascript
cwd: '/path/to/zama-health/backend', // Đổi path này (ví dụ: /home/user/zama-health/backend)
```

### 2.2. Tạo thư mục logs

```bash
mkdir -p logs
```

### 2.3. Start với PM2

```bash
# Start service
pm2 start ecosystem.config.js

# Hoặc start trực tiếp
pm2 start src/index.mjs --name zama-health-backend --env production

# Lưu PM2 config để auto-start khi reboot
pm2 save
pm2 startup  # Chạy lệnh này và follow instructions
```

### 2.4. Kiểm tra status

```bash
pm2 status
pm2 logs zama-health-backend
pm2 monit  # Monitor real-time
```

## 🌐 Bước 3: Setup Ngrok (nếu cần expose public)

### 3.1. Cài đặt Ngrok

```bash
# Download và cài ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### 3.2. Cấu hình Ngrok

```bash
# Authenticate (cần token từ ngrok.com)
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### 3.3. Chạy Ngrok cho port 3001

```bash
# Chạy ngrok (có thể chạy với PM2 hoặc screen/tmux)
ngrok http 3001

# Hoặc chạy với PM2
pm2 start ngrok --name ngrok-zama -- http 3001
```

### 3.4. Lấy public URL

Sau khi start ngrok, bạn sẽ có URL dạng:
```
https://xxxx-xx-xx-xx-xx.ngrok-free.app
```

## ✅ Bước 4: Kiểm tra

### 4.1. Health Check

```bash
# Local
curl http://localhost:3001/health

# Hoặc qua ngrok
curl https://your-ngrok-url.ngrok-free.app/health
```

### 4.2. Kiểm tra logs

```bash
# PM2 logs
pm2 logs zama-health-backend

# Hoặc xem file logs
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

### 4.3. Test ML Inference

```bash
# Test trực tiếp Python script
.venv/bin/python3 src/ml_inference.py 100 185 2 2
```

## 🔄 Bước 5: Quản lý Service

### Restart

```bash
pm2 restart zama-health-backend
```

### Stop

```bash
pm2 stop zama-health-backend
```

### Delete

```bash
pm2 delete zama-health-backend
```

### Update code

```bash
# Pull latest code
cd zama-health
git pull  # hoặc upload code mới
cd backend

# Restart service
pm2 restart zama-health-backend
```

## 🐛 Troubleshooting

### Lỗi: ModuleNotFoundError: No module named 'numpy'

→ Kiểm tra `.venv` đã được tạo với Python 3.11 và đã cài dependencies:
```bash
.venv/bin/python3 --version  # Phải là 3.11.x
.venv/bin/pip list | grep numpy
```

### Lỗi: Python version mismatch

→ Model yêu cầu Python 3.11, không phải 3.12:
```bash
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Lỗi: Cannot connect to blockchain

→ Kiểm tra `SEPOLIA_RPC` trong `.env` và network connection

### Service không start

→ Kiểm tra logs:
```bash
pm2 logs zama-health-backend --lines 50
```

### Port đã được sử dụng

→ Backend mặc định dùng port 3001 (khác port 3000 của service khác). Nếu cần đổi:
```bash
# Trong .env
PORT=3002  # Đổi port khác

# Restart
pm2 restart zama-health-backend
```

## 📝 Notes

- Backend chạy trên **port 3001** (khác port 3000 của service khác)
- Python phải là **3.11** (không phải 3.12)
- `.venv` phải được tạo với `python3.11`
- `PYTHON_PATH` trong `.env` phải là absolute path đến `.venv/bin/python3`
- PM2 sẽ tự động restart nếu service crash
- Ngrok URL sẽ thay đổi mỗi lần restart (trừ khi dùng ngrok paid plan)

## 🔐 Security

- Không commit file `.env` lên git
- Bảo vệ `BACKEND_PRIVATE_KEY` cẩn thận
- Sử dụng firewall để chỉ expose port cần thiết
- Cân nhắc dùng reverse proxy (nginx) thay vì expose trực tiếp

