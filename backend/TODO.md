# 📝 ZamaHealth Backend - TODO List

**Last Updated:** October 29, 2024

---

## ✅ COMPLETED (Day 1)

- [x] Tách backend thành repo riêng
- [x] Setup project structure
- [x] Dockerfile cho production
- [x] Python 3.11 + virtual environment
- [x] Copy trained ML model
- [x] Test ML inference (Low & High risk)
- [x] Config management
- [x] Logger setup
- [x] Health check endpoint
- [x] Docker compose cho local
- [x] Railway deployment config
- [x] Documentation (README, SETUP_COMPLETE)
- [x] Verify hoàn toàn độc lập

---

## 🔄 IN PROGRESS / BLOCKED

### ⚠️ Chờ Relayer UP

Các tasks này cần relayer hoạt động:

- [ ] **Event Listener** (`src/listener.mjs`)
  - Auto-detect `SessionInputSubmitted` events
  - Queue management
  - Retry logic
  
- [ ] **Decryption Module** (`src/decrypt.mjs`)
  - Generate backend keypair
  - Sign EIP-712 for Gateway
  - Decrypt encrypted health data with ACL
  
- [ ] **Auto Submit** (`src/submit.mjs`)
  - Gas estimation
  - Nonce management
  - Transaction retry

---

## 📋 TODO (Day 2 - Khi Relayer UP)

### Phase 1: Contract Update

- [ ] Sửa `ZamaHealth.sol`
  - Add `backend` address variable
  - Grant ACL trong `submitEncryptedInput()`
  - Update constructor: `constructor(address _usdc, address _backend)`

- [ ] Redeploy contract lên Sepolia
  ```bash
  cd zama-health/packages/fhevm-hardhat-template
  npx hardhat deploy --network sepolia --reset
  ```

- [ ] Update contract address trong `.env`

- [ ] Regen ABI
  ```bash
  cd ../site
  npm run genabi
  ```

### Phase 2: Backend Implementation

#### 2.1 Event Listener

```javascript
// src/listener.mjs
- [ ] Setup ethers provider
- [ ] Create contract instance
- [ ] Listen for SessionInputSubmitted events
- [ ] Queue processing (avoid duplicate)
- [ ] Error handling & logging
- [ ] Restart on failure
```

#### 2.2 Decryption Module

```javascript
// src/decrypt.mjs
- [ ] Generate & save backend keypair
- [ ] Create EIP-712 signature
- [ ] Request decrypt from Gateway
- [ ] Handle ACL permissions
- [ ] Cache keys securely
```

#### 2.3 ML Integration

```javascript
// src/ml.mjs (wrapper)
- [ ] Spawn Python process
- [ ] Pass decrypted data
- [ ] Parse ML output (RISK_LEVEL=X)
- [ ] Timeout handling
- [ ] Error logging
```

#### 2.4 Result Submitter

```javascript
// src/submit.mjs
- [ ] Encrypt risk level with relayer SDK
- [ ] Call submitEncryptedResult()
- [ ] Gas estimation
- [ ] Nonce management
- [ ] Transaction confirmation
- [ ] Retry on failure
```

### Phase 3: Integration & Testing

- [ ] Test event detection
- [ ] Test decryption flow
- [ ] Test ML with decrypted data
- [ ] Test encryption + submit
- [ ] Test full end-to-end workflow
- [ ] Test error scenarios
- [ ] Load testing (multiple sessions)

### Phase 4: Production Deploy

- [ ] Environment variables setup
- [ ] Deploy to Railway/Render
- [ ] Monitor logs
- [ ] Test production workflow
- [ ] Setup alerts (if service down)

---

## 🎯 Priority Tasks

**High Priority:**
1. Contract update (grant ACL)
2. Event listener
3. Decryption module

**Medium Priority:**
4. Auto submit
5. Error handling
6. Monitoring

**Low Priority:**
7. Performance optimization
8. Additional logging
9. Metrics dashboard

---

## 📊 Progress Tracker

```
Day 1: ████████████████████ 100% ✅
  - Backend setup complete
  - ML tested
  - Fully independent

Day 2: ░░░░░░░░░░░░░░░░░░░░ 0% (Waiting for relayer)
  - Contract update
  - Event listener
  - Decryption
  - Auto submit
  - Production deploy
```

---

## 🐛 Known Issues

1. **Python Version:** Model requires 3.11 (solved ✅)
2. **Relayer Down:** Cannot test FHE operations (blocking ⚠️)
3. **ACL Permission:** Contract chưa grant cho backend (TODO)

---

## 💡 Future Enhancements

- [ ] Multiple backend instances (load balancing)
- [ ] Redis queue cho sessions
- [ ] Metrics dashboard (Grafana)
- [ ] Alert system (Telegram/Discord bot)
- [ ] Backup ML model (fallback)
- [ ] ML model update mechanism
- [ ] Session priority queue
- [ ] Batch processing

---

## 📝 Notes

### Local Testing (Current)

Manual workflow:
```bash
node process_with_ml.mjs <sessionId> <weight> <height> <exercise> <diet>
```

### Production (Target)

Automatic workflow:
```bash
npm start
# Service runs 24/7
# Auto-processes all new sessions
```

---

## ✅ Success Criteria

Backend hoàn thành khi:

- [x] Setup & dependencies OK
- [x] ML inference working
- [x] Fully independent
- [ ] Auto-detect events
- [ ] Auto-decrypt data
- [ ] Auto-submit results
- [ ] Deployed to production
- [ ] Monitoring & alerts

**Current:** 3/8 ✅  
**Target:** 8/8 ✅

---

**Timeline:** 2 days total  
**Day 1 Status:** ✅ Complete  
**Day 2 Status:** ⏸️ Waiting for relayer

