# BitPay Protocol Documentation

Complete documentation for deploying, configuring, and operating the BitPay streaming payments protocol on Stacks blockchain.

---

## 📚 Documentation Index

### Getting Started

1. **[Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)** - Start here
   - Overview of architecture
   - Step-by-step deployment instructions
   - Post-deployment configuration
   - Testing and verification procedures
   - Production checklist

2. **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Your deployment companion
   - Pre-deployment preparation
   - Deployment phase checklist
   - Configuration verification
   - Testing checklist
   - Launch day procedures

### Technical Documentation

3. **[Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md)** - Critical security reference
   - Complete authorization requirements
   - Contract dependency map
   - Function-level authorization matrix
   - Security boundaries explained
   - Transaction flow diagrams
   - Troubleshooting authorization issues

4. **[Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md)** - Treasury operations
   - 3-of-5 multi-sig configuration
   - Withdrawal proposal workflow
   - Admin management procedures
   - Security features (timelock, daily limits)
   - Emergency procedures
   - Real-world scenarios and examples

5. **[Security Deployment Guide](SECURITY_DEPLOYMENT_GUIDE.md)** - Security best practices
   - Security considerations
   - Key management
   - Access control policies
   - Emergency procedures
   - Audit requirements

---

## 🚀 Quick Start

### For First-Time Deployment

1. Read: [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)
2. Use: [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
3. Run: Scripts in `../scripts/` directory
   - `authorize-contracts.sh`
   - `setup-multisig-admins.sh`
   - `verify-authorizations.sh`

### For Understanding Authorization

1. Read: [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md)
2. Review: Authorization scripts in `../scripts/`
3. Test: Run `verify-authorizations.sh`

### For Treasury Operations

1. Read: [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md)
2. Practice: On testnet first
3. Document: Your specific procedures

---

## 📖 Document Summaries

### Complete Setup Guide
**When to use:** Before and during deployment

**What's inside:**
- Architecture overview with diagrams
- Prerequisites and account preparation
- Deployment sequence (order matters!)
- Authorization setup (critical)
- Multi-sig treasury configuration
- Comprehensive testing procedures
- Troubleshooting common issues

**Key sections:**
- Deployment Sequence → Follow exactly
- Post-Deployment Configuration → Critical for functionality
- Testing & Verification → Don't skip
- Production Checklist → Final safety net

---

### Deployment Checklist
**When to use:** Throughout deployment process

**What's inside:**
- Pre-deployment preparation tasks
- Step-by-step deployment verification
- Configuration phase checkboxes
- Testing procedures
- Security verification
- Monitoring setup
- Launch day procedures

**How to use:**
- Print or keep open during deployment
- Check off each item as completed
- Use as communication tool with team
- Reference for sign-offs

---

### Contract Authorization Matrix
**When to use:** When understanding or debugging authorization

**What's inside:**
- Complete contract dependency map
- Authorization requirements for each contract
- Function-level authorization details
- Transaction flow diagrams
- Security boundary explanations
- Common authorization issues and fixes

**Critical sections:**
- Critical Authorization Requirements → Must-do list
- Function-Level Authorization Matrix → What needs what
- Transaction Flows Requiring Authorization → See it in action
- Common Issues → Quick fixes

**Why it's important:**
Without proper authorization, core functions will fail:
- ❌ Withdrawals fail
- ❌ Marketplace purchases fail
- ❌ Stream cancellations fail
- ❌ Treasury operations fail

---

### Multi-Sig Treasury Guide
**When to use:** When operating treasury or adding admins

**What's inside:**
- Multi-sig configuration explanation (3-of-5)
- Complete withdrawal workflow with examples
- Admin management procedures
- Security features (timelock, limits, expiry)
- Real-world scenarios
- Emergency procedures
- Best practices

**Key workflows:**
1. Propose Withdrawal → Admin 1 creates proposal
2. Approve Withdrawal → Admins 2 & 3 approve
3. Wait Timelock → 24 hours minimum
4. Execute Withdrawal → Any admin executes

**Security features:**
- 3-of-5 approvals required
- 24-hour timelock
- 100 sBTC daily limit
- 7-day proposal expiry

---

### Security Deployment Guide
**When to use:** Before production deployment

**What's inside:**
- Security best practices
- Key management guidelines
- Access control policies
- Monitoring and alerting setup
- Incident response procedures
- Audit requirements

---

## 🔧 Scripts Documentation

All deployment and verification scripts are in `../scripts/` directory.

### Authorization Scripts

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `authorize-contracts.sh` | Authorize protocol contracts | First - after deployment |
| `setup-multisig-admins.sh` | Configure treasury admins | Second - after authorization |
| `verify-authorizations.sh` | Verify configuration | Third - verify setup |
| `test-authorization-flows.sh` | Comprehensive testing | Fourth - test everything |

See [Scripts README](../scripts/README.md) for detailed documentation.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  bitpay-access-control                       │
│              (Central Authorization System)                  │
│  • Manages admin roles                                       │
│  • Authorizes contracts                                      │
│  • Emergency pause functionality                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ authorizes
        ┌──────────────┼──────────────┬──────────────┐
        ↓              ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ bitpay-core  │ │   bitpay-    │ │   bitpay-    │ │   bitpay-    │
│              │ │  marketplace │ │   treasury   │ │ sbtc-helper  │
│ • Stream     │ │              │ │              │ │              │
│   creation   │ │ • NFT sales  │ │ • Multi-sig  │ │ • Vault      │
│ • Withdrawals│ │ • Pricing    │ │   governance │ │   management │
│ • Cancel     │ │ • Transfers  │ │ • Fee        │ │ • sBTC       │
│              │ │              │ │   collection │ │   transfers  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       │ mints          │ transfers      │ collects       │ manages
       ↓                ↓                ↓                ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  bitpay-nft  │ │bitpay-oblig- │ │  Protocol    │ │   sBTC       │
│ (soul-bound) │ │  ation-nft   │ │    Fees      │ │    Vault     │
│ Recipient    │ │ (transferable│ │              │ │              │
│ proof        │ │  Sender NFT) │ │ • Cancel fees│ │ • Locked     │
│              │ │              │ │ • Market fees│ │   funds      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## ⚠️ Critical Concepts

### 1. Authorization is Mandatory
**Without authorization, the protocol doesn't work.**

After deploying all contracts, you MUST:
```bash
./scripts/authorize-contracts.sh
```

This authorizes:
- `bitpay-core` → For withdrawals and cancellations
- `bitpay-marketplace` → For NFT sales
- `bitpay-treasury` → For multi-sig withdrawals

**See:** [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md)

### 2. Multi-Sig is Required for Treasury
**Treasury withdrawals require 3-of-5 admin approvals.**

Configuration:
- 5 total admins
- 3 approvals needed
- 24-hour timelock
- 100 sBTC daily limit

**See:** [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md)

### 3. Two Types of NFTs
**Recipient NFT vs Obligation NFT - different purposes**

| Feature | Recipient NFT | Obligation NFT |
|---------|---------------|----------------|
| Purpose | Proof of payment receipt | Transferable payment right |
| Transferable | ❌ No (soul-bound) | ✅ Yes |
| Marketplace | Cannot be sold | Can be sold |
| Owner | Recipient | Sender (current) |

### 4. Two Purchase Methods
**Direct on-chain vs Gateway-assisted**

**Direct:** Buyer pays with crypto wallet (atomic)
```clarity
(contract-call? .bitpay-marketplace buy-nft <stream-id>)
```

**Gateway:** Buyer pays with credit card (two-step)
```clarity
;; Step 1: Buyer initiates
(contract-call? .bitpay-marketplace initiate-purchase <stream-id> <payment-id>)

;; Step 2: Backend completes after payment confirmed
(contract-call? .bitpay-marketplace complete-purchase <stream-id> <buyer> <payment-id>)
```

---

## 📋 Common Workflows

### Deploy New Protocol Instance

1. **Prepare**
   - [ ] Read [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)
   - [ ] Prepare accounts and fund them
   - [ ] Choose 5 multi-sig admins

2. **Deploy**
   - [ ] Deploy contracts in correct order (see guide)
   - [ ] Record all contract addresses
   - [ ] Backup deployer private key

3. **Configure**
   - [ ] Run `authorize-contracts.sh`
   - [ ] Run `setup-multisig-admins.sh`
   - [ ] Authorize backend service (marketplace)
   - [ ] Configure fees and URIs (optional)

4. **Verify**
   - [ ] Run `verify-authorizations.sh`
   - [ ] All tests must pass
   - [ ] Fix any failures before proceeding

5. **Test**
   - [ ] Run `test-authorization-flows.sh`
   - [ ] Create test stream
   - [ ] Test marketplace listing
   - [ ] Test multi-sig withdrawal

6. **Launch**
   - [ ] Use [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
   - [ ] Monitor closely
   - [ ] Be ready for issues

### Add New Treasury Admin

1. **Propose**
   ```clarity
   (contract-call? .bitpay-treasury propose-add-admin
       'NEW_ADMIN_ADDRESS
       "Description of admin")
   ```

2. **Approve (need 3 total)**
   ```clarity
   ;; From 2 other admins
   (contract-call? .bitpay-treasury approve-admin-proposal <proposal-id>)
   ```

3. **Execute**
   ```clarity
   (contract-call? .bitpay-treasury execute-admin-proposal <proposal-id>)
   ```

**See:** [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md) for details

### Withdraw from Treasury

1. **Propose** (Admin 1)
   ```clarity
   (contract-call? .bitpay-treasury propose-multisig-withdrawal
       u100000000  ;; 1 sBTC
       'RECIPIENT_ADDRESS
       "Reason for withdrawal")
   ```

2. **Approve** (Admins 2 & 3)
   ```clarity
   (contract-call? .bitpay-treasury approve-multisig-withdrawal <proposal-id>)
   ```

3. **Wait** (24 hours minimum)
   - Timelock enforced
   - Cannot execute early

4. **Execute** (Any admin)
   ```clarity
   (contract-call? .bitpay-treasury execute-multisig-withdrawal <proposal-id>)
   ```

**See:** [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md) for details

### Emergency Pause

```clarity
;; Pause protocol (admins only)
(contract-call? .bitpay-access-control pause-protocol)

;; Effect: Stream creation blocked, withdrawals still work

;; Unpause when resolved
(contract-call? .bitpay-access-control unpause-protocol)
```

---

## 🐛 Troubleshooting

### "ERR_UNAUTHORIZED (u200)" errors

**Cause:** Contract not authorized in access-control

**Fix:**
```bash
./scripts/authorize-contracts.sh
```

**Verify:**
```clarity
(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)
;; Should return: true
```

**See:** [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md) → Common Issues

### Multi-sig withdrawal fails

**Possible causes:**
- Less than 3 approvals
- Timelock not elapsed (need 24 hours)
- Proposal expired (max 7 days)
- Daily limit exceeded

**See:** [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md) → Common Issues

### Marketplace purchase fails

**Check:**
1. Marketplace authorized?
2. Listing active?
3. Sufficient sBTC balance?
4. Not buying own listing?

**See:** [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md) → Flow 4

---

## 📞 Support Resources

### Documentation
- This README - Overview and navigation
- Setup Guide - Deployment instructions
- Authorization Matrix - Technical reference
- Multi-Sig Guide - Treasury operations
- Deployment Checklist - Verification tool

### Scripts
- `../scripts/` - All automation scripts
- `../scripts/README.md` - Script documentation

### Code
- `../contracts/` - Smart contract source code
- `../tests/` - Contract test suites

---

## 🎯 By Role

### For Deployers
1. [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)
2. [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
3. [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md)
4. Scripts: All authorization scripts

### For Treasury Admins
1. [Multi-Sig Treasury Guide](MULTISIG_TREASURY_GUIDE.md)
2. [Security Deployment Guide](SECURITY_DEPLOYMENT_GUIDE.md)
3. Withdrawal workflow (in Multi-Sig Guide)
4. Emergency procedures

### For Developers
1. [Contract Authorization Matrix](CONTRACT_AUTHORIZATION_MATRIX.md)
2. Contract source code (`../contracts/`)
3. Test files (`../tests/`)
4. Integration examples

### For Operators
1. [Security Deployment Guide](SECURITY_DEPLOYMENT_GUIDE.md)
2. Monitoring and alerting setup
3. Emergency procedures
4. Incident response

---

## ✅ Pre-Launch Checklist

Before going to production:

- [ ] All documents read and understood
- [ ] Deployment tested on testnet
- [ ] All scripts run successfully
- [ ] All verifications pass
- [ ] Multi-sig tested with real admins
- [ ] Emergency procedures documented
- [ ] Monitoring and alerting setup
- [ ] Team trained on procedures
- [ ] Security audit completed (for mainnet)
- [ ] User documentation prepared

---

## 📝 Document Maintenance

### Keeping Documentation Updated

When making changes:
- Update relevant documentation
- Update this index if adding/removing docs
- Update version numbers and dates
- Test all examples and commands
- Review for accuracy

### Version History

- v1.0 - Initial documentation suite
  - Complete Setup Guide
  - Contract Authorization Matrix
  - Multi-Sig Treasury Guide
  - Deployment Checklist
  - Security Deployment Guide

---

## 🤝 Contributing

Found an error or have suggestions?

1. Document the issue clearly
2. Propose the fix/improvement
3. Test your changes
4. Update related documentation
5. Submit for review

---

**Ready to deploy? Start with the [Complete Setup Guide](COMPLETE_SETUP_GUIDE.md)!**
