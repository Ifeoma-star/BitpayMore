# BitPay Protocol - Complete Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Sequence](#deployment-sequence)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Testing & Verification](#testing--verification)
6. [Production Checklist](#production-checklist)

---

## Overview

The BitPay protocol consists of 7 smart contracts that work together to enable streaming payments on Stacks blockchain with invoice factoring capabilities.

### Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  bitpay-access-control                       │
│              (Central Authorization System)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ authorizes
        ┌──────────────┼──────────────┬──────────────┐
        ↓              ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ bitpay-core  │ │   bitpay-    │ │   bitpay-    │ │   bitpay-    │
│              │ │  marketplace │ │   treasury   │ │ sbtc-helper  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       │ mints          │ transfers      │ collects       │ manages
       ↓                ↓                ↓                ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  bitpay-nft  │ │bitpay-oblig- │ │  Multi-sig   │ │   sBTC       │
│ (soul-bound) │ │  ation-nft   │ │  Withdrawals │ │    Vault     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Prerequisites

### Development Environment
- Clarinet installed (`curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.run | sh`)
- Node.js (v16+) for scripts
- Git for version control

### Accounts Required
1. **Deployer Account** - Deploys all contracts (becomes initial admin)
2. **5 Multi-Sig Admin Accounts** - For treasury governance (3-of-5 approval)
3. **Backend Service Account** - For gateway-assisted marketplace purchases
4. **Test Accounts** - For testing stream creation and marketplace

### Before Deployment
1. **Fund Accounts**
   - Deployer: ~10 STX for deployment gas
   - Each multi-sig admin: ~1 STX for transaction gas
   - Backend service: ~1 STX for transaction gas

2. **Configure sBTC Address**
   - Simnet: `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`
   - Testnet: `ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token`
   - Mainnet: (update when sBTC mainnet launches)

---

## Deployment Sequence

### Why Deployment Order Matters

Contracts reference each other, so they must be deployed in dependency order:

1. **bitpay-access-control** - No dependencies (root authority)
2. **bitpay-sbtc-helper** - Depends on: access-control
3. **bitpay-nft** - No dependencies (only called by core)
4. **bitpay-obligation-nft** - No dependencies (only called by core)
5. **bitpay-treasury** - Depends on: access-control, sbtc-helper
6. **bitpay-core** - Depends on: access-control, sbtc-helper, nft, obligation-nft, treasury
7. **bitpay-marketplace** - Depends on: core, treasury, obligation-nft

### Step 1: Deploy Core Infrastructure

```bash
# Deploy access control (root authority)
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-access-control

# Deploy sBTC helper (vault manager)
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-sbtc-helper

# Deploy NFT contracts
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-nft
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-obligation-nft
```

### Step 2: Deploy Protocol Contracts

```bash
# Deploy treasury (multi-sig)
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-treasury

# Deploy core streaming protocol
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-core

# Deploy marketplace (invoice factoring)
clarinet deployments apply --manifest deployments/default.simnet-plan.yaml -p bitpay-marketplace
```

### Step 3: Record Contract Addresses

After deployment, save all contract addresses:

```bash
# Create a deployment record
cat > deployment-addresses.json <<EOF
{
  "network": "simnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "bitpay-access-control": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-access-control",
    "bitpay-sbtc-helper": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-sbtc-helper",
    "bitpay-nft": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-nft",
    "bitpay-obligation-nft": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-obligation-nft",
    "bitpay-treasury": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-treasury",
    "bitpay-core": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-core",
    "bitpay-marketplace": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-marketplace"
  }
}
EOF
```

---

## Post-Deployment Configuration

### Phase 1: Authorize Protocol Contracts (CRITICAL)

Without authorization, the protocol **will not work**. Run the authorization script:

```bash
# Automated script (recommended)
./scripts/authorize-contracts.sh

# OR manual via Clarinet console
clarinet console
```

```clarity
;; Authorize bitpay-core (needed for withdrawals and cancellations)
(contract-call? .bitpay-access-control authorize-contract .bitpay-core)
;; Expected: (ok true)

;; Authorize bitpay-marketplace (needed for NFT sales)
(contract-call? .bitpay-access-control authorize-contract .bitpay-marketplace)
;; Expected: (ok true)

;; Authorize bitpay-treasury (needed for multi-sig withdrawals)
(contract-call? .bitpay-access-control authorize-contract .bitpay-treasury)
;; Expected: (ok true)
```

### Phase 2: Configure Multi-Sig Treasury Admins

Add 5 admin addresses (3 approvals required for withdrawals):

```bash
# Automated script (recommended)
./scripts/setup-multisig-admins.sh

# OR manual via Clarinet console
clarinet console
```

```clarity
;; Propose adding Admin 1
(contract-call? .bitpay-treasury propose-add-admin
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  "Multi-sig admin 1")
;; Expected: (ok u1) - proposal ID 1

;; Initial proposer auto-approves, need 2 more admins to approve
;; Switch to another admin account and approve
(contract-call? .bitpay-treasury approve-admin-proposal u1)

;; After 3 approvals, execute
(contract-call? .bitpay-treasury execute-admin-proposal u1)
;; Expected: (ok true)

;; Repeat for admins 2-5
;; After adding all 5, verify:
(contract-call? .bitpay-treasury count-admins)
;; Expected: (ok u5)
```

### Phase 3: Configure Marketplace Backend Authorization

For gateway-assisted purchases (credit card payments):

```bash
clarinet console
```

```clarity
;; Add backend service principal
(contract-call? .bitpay-marketplace add-authorized-backend
  'ST2BACKEND_SERVICE_ADDRESS)
;; Expected: (ok true)

;; Verify
(contract-call? .bitpay-marketplace is-authorized-backend
  'ST2BACKEND_SERVICE_ADDRESS)
;; Expected: true
```

### Phase 4: Optional Configuration

#### Set Marketplace Fee (Default: 1%)
```clarity
;; Set to 2% (200 basis points)
(contract-call? .bitpay-marketplace set-marketplace-fee u200)
```

#### Set NFT Metadata URIs
```clarity
;; Recipient NFT URI
(contract-call? .bitpay-nft set-base-token-uri "https://api.bitpay.example/nft/recipient/")

;; Obligation NFT URI
(contract-call? .bitpay-obligation-nft set-base-token-uri "https://api.bitpay.example/nft/obligation/")
```

---

## Testing & Verification

### Step 1: Verify Authorization

```bash
./scripts/verify-authorizations.sh
```

Expected output:
```
✅ bitpay-core is authorized
✅ bitpay-marketplace is authorized
✅ bitpay-treasury is authorized
✅ Treasury has 5 multi-sig admins
✅ Backend service is authorized
```

### Step 2: Test Stream Creation

```clarity
;; Create a test stream
(contract-call? .bitpay-core create-stream
  'ST2RECIPIENT_ADDRESS  ;; recipient
  u100000000             ;; 1 sBTC
  (+ stacks-block-height u10)  ;; starts in 10 blocks
  (+ stacks-block-height u1000) ;; ends in 1000 blocks
)
;; Expected: (ok u1) - stream ID 1
```

### Step 3: Test Stream Withdrawal

```clarity
;; Wait for stream to start, then withdraw
(contract-call? .bitpay-core withdraw-from-stream u1)
;; Expected: (ok <vested-amount>)
```

### Step 4: Test Marketplace Listing

```clarity
;; List obligation NFT for sale
(contract-call? .bitpay-marketplace list-nft
  u1          ;; stream-id
  u90000000   ;; price: 0.9 sBTC (10% discount)
)
;; Expected: (ok true)
```

### Step 5: Test Marketplace Purchase

```clarity
;; Buy the listed NFT
(contract-call? .bitpay-marketplace buy-nft u1)
;; Expected: (ok <sale-id>)

;; Verify stream ownership transferred
(contract-call? .bitpay-core get-stream u1)
;; Check sender field matches new owner
```

### Step 6: Test Multi-Sig Treasury Withdrawal

```clarity
;; Admin 1: Propose withdrawal
(contract-call? .bitpay-treasury propose-multisig-withdrawal
  u1000000   ;; 0.01 sBTC
  'ST2RECIPIENT_ADDRESS
  "Test withdrawal")
;; Expected: (ok u1) - proposal ID 1

;; Admin 2: Approve
(contract-call? .bitpay-treasury approve-multisig-withdrawal u1)

;; Admin 3: Approve
(contract-call? .bitpay-treasury approve-multisig-withdrawal u1)

;; Wait 24 hours (144 blocks on simnet, fast-forward time)

;; Any admin: Execute
(contract-call? .bitpay-treasury execute-multisig-withdrawal u1)
;; Expected: (ok true)
```

---

## Production Checklist

### Security Audit
- [ ] Smart contracts audited by reputable firm
- [ ] All critical functions tested
- [ ] Multi-sig configuration verified
- [ ] Authorization matrix validated
- [ ] Emergency procedures documented

### Pre-Launch Configuration
- [ ] All 7 contracts deployed successfully
- [ ] Contract addresses recorded and backed up
- [ ] Authorization completed (3 contracts authorized)
- [ ] Multi-sig admins configured (5 admins, 3-of-5)
- [ ] Backend service authorized for marketplace
- [ ] Marketplace fee configured (default 1%)
- [ ] NFT metadata URIs configured
- [ ] Treasury daily limit configured (default 100 sBTC)

### Monitoring Setup
- [ ] Chainhook monitoring configured for events
- [ ] Treasury withdrawal alerts enabled
- [ ] Marketplace sale notifications configured
- [ ] Daily volume tracking dashboard
- [ ] Error alerting system active

### Documentation
- [ ] User guides published
- [ ] API documentation complete
- [ ] Emergency procedures distributed to admins
- [ ] Support channels established
- [ ] FAQ and troubleshooting guide available

### Access Control
- [ ] Multi-sig admin keys secured (hardware wallets recommended)
- [ ] Backend service keys secured (HSM recommended)
- [ ] Deployer account private key backed up securely
- [ ] Key rotation procedures documented
- [ ] Incident response plan established

### Testing on Testnet
- [ ] Full stream lifecycle tested
- [ ] Marketplace purchases tested (direct + gateway)
- [ ] Multi-sig withdrawals tested
- [ ] Emergency pause tested
- [ ] Contract authorization revocation tested
- [ ] Edge cases covered (cancellations, expired proposals, etc.)

### Launch Preparation
- [ ] Gas reserves allocated for multi-sig admins
- [ ] Initial treasury funding (if applicable)
- [ ] Marketing materials ready
- [ ] Legal compliance verified
- [ ] Terms of service published
- [ ] Privacy policy published

---

## Common Issues & Troubleshooting

### Issue: Contract deployment fails
**Symptoms:** Deployment transaction rejected
**Causes:**
- Insufficient STX for gas
- Contract syntax errors
- Dependency not deployed yet

**Solutions:**
1. Check account balance: `clarinet balance`
2. Verify contract syntax: `clarinet check`
3. Follow deployment order exactly

### Issue: Authorization fails
**Symptoms:** `ERR_UNAUTHORIZED (u200)` when calling functions
**Causes:**
- Contracts not authorized in access-control
- Wrong principal trying to authorize (only admins can authorize)

**Solutions:**
1. Verify you're using deployer/admin account
2. Run authorization script: `./scripts/authorize-contracts.sh`
3. Verify: `(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)`

### Issue: Multi-sig admin addition fails
**Symptoms:** Cannot add new admin to treasury
**Causes:**
- Not calling from existing multi-sig admin
- Insufficient approvals (need 3)
- Trying to add duplicate admin

**Solutions:**
1. Verify caller is multi-sig admin: `(contract-call? .bitpay-treasury is-multisig-admin tx-sender)`
2. Get 3 approvals before executing
3. Check admin not already added

### Issue: Marketplace purchase fails
**Symptoms:** `ERR_TRANSFER_FAILED` when buying NFT
**Causes:**
- Marketplace not authorized in access-control
- Insufficient sBTC balance
- Listing inactive or expired

**Solutions:**
1. Authorize marketplace: `(contract-call? .bitpay-access-control authorize-contract .bitpay-marketplace)`
2. Check buyer sBTC balance
3. Verify listing is active: `(contract-call? .bitpay-marketplace is-listed <stream-id>)`

### Issue: Treasury withdrawal fails
**Symptoms:** Cannot execute approved withdrawal
**Causes:**
- Less than 3 approvals
- Timelock not elapsed (need 24 hours)
- Proposal expired (max 7 days)
- Daily limit exceeded

**Solutions:**
1. Check approval count: `(contract-call? .bitpay-treasury get-withdrawal-proposal <proposal-id>)`
2. Wait for timelock: minimum 144 blocks after proposal
3. Check proposal not expired
4. Check daily limit not exceeded

---

## Support & Resources

### Documentation
- Contract source: `contract/contracts/`
- Architecture docs: `docs/CONTRACT_AUTHORIZATION_MATRIX.md`
- Multi-sig guide: `docs/MULTISIG_TREASURY_GUIDE.md`
- Security guide: `docs/SECURITY_DEPLOYMENT_GUIDE.md`

### Scripts
- Authorization: `scripts/authorize-contracts.sh`
- Multi-sig setup: `scripts/setup-multisig-admins.sh`
- Verification: `scripts/verify-authorizations.sh`
- Testing: `scripts/test-authorization-flows.sh`

### Community
- GitHub Issues: Report bugs and request features
- Discord: Real-time support and discussions
- Documentation: Comprehensive guides and tutorials

---

## Next Steps After Setup

1. **Test Thoroughly** - Run all test scripts and verify functionality
2. **Monitor Deployment** - Watch for any errors or unusual activity
3. **Document Custom Config** - Note any configuration changes from defaults
4. **Train Multi-Sig Admins** - Ensure all admins understand withdrawal process
5. **Prepare Launch** - Marketing, user guides, support channels
6. **Go Live** - Enable public access and monitor closely

Good luck with your deployment! 🚀
