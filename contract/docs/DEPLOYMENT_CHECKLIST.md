# BitPay Protocol - Deployment Checklist

Use this checklist to ensure proper deployment and configuration of the BitPay protocol.

---

## Pre-Deployment

### Environment Setup
- [ ] Clarinet installed and working
- [ ] Node.js installed (v16+)
- [ ] Git repository initialized
- [ ] Network selected (simnet/testnet/mainnet)

### Account Preparation
- [ ] Deployer account funded (≥10 STX)
- [ ] 5 multi-sig admin accounts created
- [ ] Multi-sig admin accounts funded (≥1 STX each)
- [ ] Backend service account created and funded
- [ ] Test accounts created for testing

### Contract Review
- [ ] All contracts reviewed and audited
- [ ] Security audit completed (for mainnet)
- [ ] Test coverage ≥90%
- [ ] Documentation reviewed

---

## Deployment Phase

### Step 1: Deploy Core Infrastructure
- [ ] Deploy `bitpay-access-control` ✓ First (no dependencies)
- [ ] Deploy `bitpay-sbtc-helper` ✓ Depends on access-control
- [ ] Deploy `bitpay-nft` ✓ Independent (called by core)
- [ ] Deploy `bitpay-obligation-nft` ✓ Independent (called by core)

**Verify:** All 4 contracts deployed successfully

### Step 2: Deploy Protocol Contracts
- [ ] Deploy `bitpay-treasury` ✓ Depends on access-control, sbtc-helper
- [ ] Deploy `bitpay-core` ✓ Depends on all above
- [ ] Deploy `bitpay-marketplace` ✓ Depends on core, treasury, obligation-nft

**Verify:** All 7 contracts deployed successfully

### Step 3: Record Deployment
- [ ] Save all contract addresses
- [ ] Create `deployment-addresses.json`
- [ ] Commit to git repository
- [ ] Backup deployer private key securely

---

## Configuration Phase

### Authorization (CRITICAL - Protocol Won't Work Without This)
- [ ] Run `./scripts/authorize-contracts.sh`
- [ ] Verify `bitpay-core` is authorized
- [ ] Verify `bitpay-marketplace` is authorized
- [ ] Verify `bitpay-treasury` is authorized

**Test Command:**
```clarity
(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)
;; Expected: true
```

### Multi-Sig Treasury Setup
- [ ] Run `./scripts/setup-multisig-admins.sh`
- [ ] Add all 5 admin addresses
- [ ] Verify admin count is 5
- [ ] Test proposal creation
- [ ] Test approval flow
- [ ] Verify 3-of-5 configuration

**Test Command:**
```clarity
(contract-call? .bitpay-treasury count-admins)
;; Expected: (ok u5)
```

### Marketplace Configuration
- [ ] Authorize backend service for gateway purchases
- [ ] Set marketplace fee (default: 1%)
- [ ] Configure NFT metadata URIs
- [ ] Test listing creation
- [ ] Test purchase initiation

**Test Command:**
```clarity
(contract-call? .bitpay-marketplace get-marketplace-fee-bps)
;; Expected: (ok u100) for 1%
```

### Optional Configuration
- [ ] Set custom marketplace fee if needed
- [ ] Configure NFT metadata base URIs
- [ ] Set up additional admins in access-control
- [ ] Configure operators if needed

---

## Verification Phase

### Run Verification Script
- [ ] Run `./scripts/verify-authorizations.sh`
- [ ] All authorization tests pass
- [ ] All configuration tests pass
- [ ] All integration tests pass
- [ ] All security tests pass

**Expected Output:** "✓ All Verifications Passed"

### Manual Testing

#### Test 1: Stream Creation
```clarity
(contract-call? .bitpay-core create-stream
    'ST2RECIPIENT
    u100000000
    (+ stacks-block-height u10)
    (+ stacks-block-height u1000)
)
```
- [ ] Stream created successfully
- [ ] Stream ID returned
- [ ] sBTC locked in vault
- [ ] Recipient NFT minted
- [ ] Obligation NFT minted

#### Test 2: Stream Withdrawal
```clarity
(contract-call? .bitpay-core withdraw-from-stream u1)
```
- [ ] Withdrawal successful
- [ ] Correct vested amount calculated
- [ ] sBTC transferred to recipient
- [ ] Stream state updated

#### Test 3: Marketplace Listing
```clarity
(contract-call? .bitpay-marketplace list-nft u1 u90000000)
```
- [ ] Listing created successfully
- [ ] Price stored correctly
- [ ] Owner verified
- [ ] Listing appears active

#### Test 4: Marketplace Purchase
```clarity
(contract-call? .bitpay-marketplace buy-nft u1)
```
- [ ] Purchase successful
- [ ] sBTC transferred to seller
- [ ] Marketplace fee sent to treasury
- [ ] Obligation NFT transferred
- [ ] Stream sender updated

#### Test 5: Stream Cancellation
```clarity
(contract-call? .bitpay-core cancel-stream u1)
```
- [ ] Cancellation successful
- [ ] Cancellation fee calculated correctly
- [ ] Fee sent to treasury
- [ ] Unvested amount returned to sender
- [ ] Vested amount sent to recipient

#### Test 6: Multi-Sig Withdrawal
```clarity
;; Admin 1
(contract-call? .bitpay-treasury propose-multisig-withdrawal
    u1000000 'ST2RECIPIENT "Test")

;; Admin 2
(contract-call? .bitpay-treasury approve-multisig-withdrawal u1)

;; Admin 3
(contract-call? .bitpay-treasury approve-multisig-withdrawal u1)

;; Wait 24 hours, then any admin
(contract-call? .bitpay-treasury execute-multisig-withdrawal u1)
```
- [ ] Proposal created successfully
- [ ] Approvals work from different admins
- [ ] 3 approvals required before execution
- [ ] Timelock enforced (24 hours)
- [ ] Withdrawal executes successfully
- [ ] Treasury balance updated

#### Test 7: Gateway-Assisted Purchase
```clarity
;; Buyer
(contract-call? .bitpay-marketplace initiate-purchase u2 "pay-123")

;; Backend service (after payment confirmed)
(contract-call? .bitpay-marketplace complete-purchase
    u2 'BUYER-ADDRESS "pay-123")
```
- [ ] Purchase initiated successfully
- [ ] Payment ID recorded
- [ ] Expiry set correctly
- [ ] Backend can complete purchase
- [ ] Ownership transferred

#### Test 8: Emergency Pause
```clarity
;; Pause
(contract-call? .bitpay-access-control pause-protocol)

;; Try to create stream (should fail)
(contract-call? .bitpay-core create-stream ...)

;; Withdrawals should still work
(contract-call? .bitpay-core withdraw-from-stream u1)

;; Unpause
(contract-call? .bitpay-access-control unpause-protocol)
```
- [ ] Pause successful
- [ ] Stream creation blocked during pause
- [ ] Withdrawals work during pause
- [ ] Unpause successful

---

## Security Verification

### Access Control Boundaries
- [ ] Only authorized contracts can access vault
- [ ] Only admins can authorize contracts
- [ ] Only admins can pause protocol
- [ ] Only stream sender can cancel stream
- [ ] Only recipient can withdraw from stream

### Multi-Sig Security
- [ ] 3-of-5 approval required
- [ ] 24-hour timelock enforced
- [ ] Daily limit enforced (100 sBTC)
- [ ] Proposals expire after 7 days
- [ ] Cannot execute without sufficient approvals

### NFT Security
- [ ] Only bitpay-core can mint recipient NFTs
- [ ] Only bitpay-core can mint obligation NFTs
- [ ] Recipient NFTs are soul-bound (non-transferable)
- [ ] Obligation NFTs are transferable
- [ ] NFT ownership properly tracked

### Marketplace Security
- [ ] Only NFT owner can list for sale
- [ ] Cannot buy your own listing
- [ ] Payments atomic (all-or-nothing)
- [ ] Fees calculated correctly
- [ ] Stream ownership updated atomically

---

## Monitoring Setup

### Event Monitoring
- [ ] Chainhook configured for contract events
- [ ] Stream creation events tracked
- [ ] Withdrawal events logged
- [ ] Marketplace sales tracked
- [ ] Treasury proposals monitored

### Alerting
- [ ] Treasury withdrawal proposals alert
- [ ] Large withdrawals alert
- [ ] Protocol pause alert
- [ ] Failed transaction alert
- [ ] Daily volume tracking

### Dashboard
- [ ] Total value locked (TVL)
- [ ] Active streams count
- [ ] Marketplace volume
- [ ] Treasury balance
- [ ] Fee collection stats

---

## Documentation

### User Documentation
- [ ] User guide published
- [ ] Stream creation tutorial
- [ ] Marketplace guide
- [ ] FAQ available
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] API documentation complete
- [ ] Contract architecture documented
- [ ] Authorization matrix available
- [ ] Integration guide available
- [ ] Example code provided

### Admin Documentation
- [ ] Multi-sig procedures documented
- [ ] Emergency procedures written
- [ ] Key management guide
- [ ] Incident response plan
- [ ] Contact list for admins

---

## Pre-Launch Checklist

### Final Security Review
- [ ] All contracts audited
- [ ] Audit recommendations implemented
- [ ] Security testing complete
- [ ] Penetration testing done (for mainnet)
- [ ] Bug bounty program setup (for mainnet)

### Operational Readiness
- [ ] Support team trained
- [ ] Monitoring active
- [ ] Alerting tested
- [ ] Backup procedures tested
- [ ] Disaster recovery plan ready

### Legal & Compliance
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] Regulatory compliance verified
- [ ] User agreements ready
- [ ] Liability disclaimers in place

### Marketing Preparation
- [ ] Website ready
- [ ] Social media accounts setup
- [ ] Announcement prepared
- [ ] User onboarding flow tested
- [ ] Support channels active

---

## Launch Day

### Launch Sequence
1. [ ] Final verification run
2. [ ] Announce launch time
3. [ ] Monitor closely for first hour
4. [ ] Check all metrics
5. [ ] Respond to user questions
6. [ ] Document any issues

### Monitoring During Launch
- [ ] Transaction throughput
- [ ] Error rates
- [ ] Gas costs
- [ ] User feedback
- [ ] System performance

### Emergency Contacts
- [ ] Multi-sig admins reachable
- [ ] Backend team on standby
- [ ] Support team available
- [ ] Developer team available
- [ ] Security team available

---

## Post-Launch

### First 24 Hours
- [ ] Monitor all transactions
- [ ] Track user adoption
- [ ] Collect feedback
- [ ] Fix critical issues immediately
- [ ] Document lessons learned

### First Week
- [ ] Review all metrics
- [ ] Analyze user behavior
- [ ] Optimize gas costs if needed
- [ ] Update documentation based on feedback
- [ ] Plan improvements

### Ongoing Maintenance
- [ ] Regular security reviews
- [ ] Performance monitoring
- [ ] User feedback analysis
- [ ] Feature planning
- [ ] Community engagement

---

## Rollback Plan (Emergency)

If critical issues are discovered:

1. **Immediate Actions**
   - [ ] Pause protocol via access-control
   - [ ] Notify all users
   - [ ] Secure all funds
   - [ ] Investigate root cause

2. **User Protection**
   - [ ] Enable withdrawals (even during pause)
   - [ ] Process refunds if needed
   - [ ] Communicate timeline
   - [ ] Provide support

3. **Resolution**
   - [ ] Fix critical issues
   - [ ] Test fixes thoroughly
   - [ ] Security review fixes
   - [ ] Deploy updates
   - [ ] Unpause protocol

---

## Success Metrics

### Technical Metrics
- [ ] Uptime ≥99.9%
- [ ] Transaction success rate ≥99%
- [ ] Average gas cost optimized
- [ ] Response time <3 seconds
- [ ] Zero security incidents

### Business Metrics
- [ ] User adoption growing
- [ ] TVL increasing
- [ ] Marketplace volume healthy
- [ ] User satisfaction ≥4.5/5
- [ ] Support ticket resolution <24h

---

## Scripts Reference

All scripts are in `scripts/` directory:

- `authorize-contracts.sh` - Authorize protocol contracts
- `setup-multisig-admins.sh` - Configure treasury admins
- `verify-authorizations.sh` - Verify all configurations
- `test-authorization-flows.sh` - Comprehensive testing

---

## Documentation Reference

All documentation in `docs/` directory:

- `CONTRACT_AUTHORIZATION_MATRIX.md` - Authorization requirements
- `COMPLETE_SETUP_GUIDE.md` - Step-by-step setup
- `MULTISIG_TREASURY_GUIDE.md` - Treasury operations
- `SECURITY_DEPLOYMENT_GUIDE.md` - Security best practices
- `DEPLOYMENT_CHECKLIST.md` - This checklist

---

## Final Sign-Off

Before going live, ensure:

- [ ] All sections of this checklist completed
- [ ] All tests passing
- [ ] All documentation reviewed
- [ ] All admins trained
- [ ] All monitoring active
- [ ] Emergency procedures tested

**Deployment Approved By:**

- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Operations Lead: _______________ Date: _______
- [ ] Project Manager: _______________ Date: _______

---

## Notes

Use this section to document deployment-specific details:

```
Network: _______________
Deployment Date: _______________
Contract Addresses: See deployment-addresses.json
Special Configurations: _______________
Known Issues: _______________
```

---

**Good luck with your deployment! 🚀**

For support, refer to:
- GitHub Issues
- Documentation in `docs/`
- Scripts in `scripts/`
