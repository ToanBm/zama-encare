# 📅 Day 2 Plan - ZamaHealth Backend

**Date:** October 30, 2024  
**Goal:** Complete automation & deploy to production

---

## ✅ Day 1 Recap (Completed)

```
✅ Backend tách riêng → zama-health-backend/
✅ Python 3.11 + Concrete ML
✅ ML model working (Low/High risk tested)
✅ Hoàn toàn độc lập
✅ Docker ready
✅ Documentation complete
```

---

## 🎯 Day 2 Goals

### Morning (4 hours)

#### 1. Contract Update (1 hour)
```solidity
// Add backend address & grant ACL
address public backend;
FHE.allow(weight, backend);
FHE.allow(height, backend);
FHE.allow(exercise, backend);
FHE.allow(diet, backend);
```

#### 2. Event Listener (1.5 hours)
```javascript
// src/listener.mjs
- Listen SessionInputSubmitted events
- Queue sessions
- Trigger processing
```

#### 3. Decryption Module (1.5 hours)
```javascript
// src/decrypt.mjs
- Generate keypair
- Sign EIP-712
- Decrypt with Gateway
```

### Afternoon (4 hours)

#### 4. Integration (2 hours)
```javascript
// Connect: Listener → Decrypt → ML → Submit
- Test end-to-end
- Error handling
```

#### 5. Deploy (1 hour)
```bash
# Railway/Render
- Setup environment
- Deploy
- Verify
```

#### 6. Testing (1 hour)
```
- Create test session on frontend
- Verify auto-processing
- Check result submission
```

---

## 📋 Checklist

### Pre-Work (Check Relayer Status)

- [ ] Check: https://gateway.sepolia.zama.ai/health
- [ ] If DOWN → Wait or use mock
- [ ] If UP → Proceed with plan

### Contract

- [ ] Sửa `ZamaHealth.sol`
- [ ] Deploy lên Sepolia
- [ ] Update addresses trong frontend & backend
- [ ] Verify contract on Etherscan

### Backend

- [ ] Implement `listener.mjs`
- [ ] Implement `decrypt.mjs`
- [ ] Update `index.mjs` (integrate all modules)
- [ ] Test local
- [ ] Deploy production

### Testing

- [ ] Frontend: Create session
- [ ] Backend: Auto-detect event
- [ ] Backend: Decrypt data
- [ ] Backend: ML prediction
- [ ] Backend: Submit result
- [ ] Frontend: Decrypt & view result

---

## 🚨 Blockers

### If Relayer DOWN:

**Option A:** Mock decryption
```javascript
// Use plaintext for testing
const mockDecrypt = (encrypted) => {
  // Return test values
  return { weight: 70, height: 175, exercise: 3, diet: 7 };
};
```

**Option B:** User provides plaintext
```javascript
// API endpoint: POST /process-session
{
  sessionId: 0,
  weight: 70,  // plaintext
  height: 175,
  exercise: 3,
  diet: 7
}
```

**Option C:** Wait for relayer
- Focus on documentation
- Prepare frontend
- Test other components

---

## 📁 Files to Create/Edit

### Create:
```
src/listener.mjs       - Event listener
src/decrypt.mjs        - Decryption module
src/ml.mjs             - ML wrapper
src/submit.mjs         - Submit results
```

### Edit:
```
src/index.mjs          - Integrate all modules
contracts/ZamaHealth.sol - Add ACL grants
```

---

## 🔧 Commands Reference

### Local Development
```bash
# Terminal 1: Backend
cd zama-health-backend
npm start

# Terminal 2: Frontend
cd zama-health/packages/site
npm run dev

# Terminal 3: Test
curl http://localhost:3001/health
```

### Deployment
```bash
# Railway
railway login
railway up

# Check logs
railway logs
```

### Testing
```bash
# Test ML
npm run ml:test

# Test contract
cast call $CONTRACT "sessions(uint256)" 0

# Test backend
curl http://localhost:3001/health
```

---

## 💡 Quick Wins

Nếu thiếu thời gian, ưu tiên:

1. ✅ Contract với ACL
2. ✅ Manual processing (keep current)
3. ✅ Deploy backend
4. ⏸️ Auto listener (làm sau)

**Manual workflow vẫn work cho demo!**

---

## 📊 Success Metrics

- [ ] Contract deployed with ACL
- [ ] Backend deployed to production
- [ ] 1 session processed successfully (manual OK)
- [ ] Frontend → Backend → Contract → Frontend (full cycle)
- [ ] Documentation updated

**Minimum Viable:** 3/5 ✅  
**Full Complete:** 5/5 ✅

---

## 🎯 End of Day 2 Target

```
✅ Contract: ACL enabled
✅ Backend: Deployed & running
✅ Workflow: End-to-end tested
✅ Demo: Ready to show
📝 Documentation: Complete
```

---

## 🚀 Let's GO!

**Start Time:** Tomorrow morning  
**End Time:** Tomorrow evening  
**Status:** Ready to ship! 💪

---

**Remember:**
- Coffee first ☕
- Test incrementally 
- Document as you go
- Manual mode is OK for demo
- Focus on working > perfect

