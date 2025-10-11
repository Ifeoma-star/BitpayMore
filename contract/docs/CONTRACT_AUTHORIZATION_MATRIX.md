# Contract Authorization Matrix

## Overview
This document maps all inter-contract calls and authorization requirements for the BitPay protocol.

## Authorization Flow Summary

```
bitpay-access-control (Central Authority)
    ↓ authorizes
    ├── bitpay-core
    ├── bitpay-marketplace
    ├── bitpay-treasury
    └── bitpay-sbtc-helper
```

---

## Contract Dependencies Map

### 1. **bitpay-core.clar**

**Calls Made:**
- `.bitpay-access-control.assert-not-paused` - Check protocol not paused
- `.bitpay-access-control.assert-authorized-contract` - Verify authorized contracts
- `.bitpay-sbtc-helper.transfer-to-vault` - Lock sBTC for streams
- `.bitpay-sbtc-helper.transfer-from-vault` - Release sBTC from vault
- `.bitpay-nft.mint` - Mint recipient NFT (soul-bound)
- `.bitpay-obligation-nft.mint` - Mint obligation NFT (transferable)
- `.bitpay-treasury.collect-cancellation-fee` - Send cancellation fees to treasury

**Must Be Authorized:** YES
- Required by: `bitpay-sbtc-helper.transfer-from-vault`
- Required by: `bitpay-marketplace` when calling `update-stream-sender`

**Authorization Check:** Contract-caller based in `update-stream-sender`

---

### 2. **bitpay-marketplace.clar**

**Calls Made:**
- `.bitpay-obligation-nft.get-owner` - Verify NFT ownership
- `.bitpay-obligation-nft.transfer` - Transfer obligation NFT
- `.bitpay-treasury.get-contract-address` - Get treasury address for payments
- `.bitpay-treasury.collect-marketplace-fee` - Record marketplace fee accounting
- `.bitpay-core.update-stream-sender` - Update stream ownership after sale
- `'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.transfer` - sBTC payments

**Must Be Authorized:** YES
- Required by: `bitpay-core.update-stream-sender`
- Required by: `bitpay-treasury.collect-marketplace-fee`

**Authorization Check:** Contract-caller based

---

### 3. **bitpay-treasury.clar**

**Calls Made:**
- `.bitpay-access-control.assert-is-admin` - Verify admin status
- `.bitpay-access-control.assert-authorized-contract` - Verify authorized contracts
- `.bitpay-sbtc-helper.transfer-from-vault` - Execute withdrawals

**Must Be Authorized:** YES
- Required by: `bitpay-sbtc-helper.transfer-from-vault`

**Authorization Check:** Contract-caller based in fee collection functions

---

### 4. **bitpay-sbtc-helper.clar**

**Calls Made:**
- `.bitpay-access-control.assert-authorized-contract` - Verify caller is authorized
- `'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.transfer` - sBTC transfers

**Must Be Authorized:** NO (utility contract)

**Authorization Check:** Checks that contract-caller is authorized before releasing funds

---

### 5. **bitpay-nft.clar** (Soul-Bound Recipient NFT)

**Calls Made:** None

**Must Be Authorized:** NO

**Authorization Check:** Only `bitpay-core` can mint (hardcoded in contract)

---

### 6. **bitpay-obligation-nft.clar** (Transferable Sender NFT)

**Calls Made:** None

**Must Be Authorized:** NO

**Authorization Check:** Only `bitpay-core` can mint (hardcoded in contract)

---

### 7. **bitpay-access-control.clar**

**Calls Made:** None (root authority)

**Must Be Authorized:** NO (root contract)

**Authorization Check:** N/A - This IS the authorization system

---

## Critical Authorization Requirements

### Phase 1: Deployment Authorization (REQUIRED)
After deploying all contracts, the following contracts MUST be authorized:

| Contract | Why Authorization Needed |
|----------|--------------------------|
| `bitpay-core` | Needs to withdraw from vault, called by marketplace |
| `bitpay-marketplace` | Needs to update stream sender, collect fees |
| `bitpay-treasury` | Needs to withdraw from vault for multi-sig withdrawals |

### Phase 2: Admin Configuration (REQUIRED)
1. Add multi-sig admins to `bitpay-treasury` (5 total, need 3 to approve)
2. Optionally add additional admins to `bitpay-access-control` (for emergency pause)

---

## Function-Level Authorization Matrix

### Functions Requiring Authorized Contract-Caller

| Function | Contract | Checks | Impact if Not Authorized |
|----------|----------|--------|--------------------------|
| `transfer-from-vault` | bitpay-sbtc-helper | `assert-authorized-contract(contract-caller)` | Cannot withdraw from vault ❌ |
| `update-stream-sender` | bitpay-core | `assert-authorized-contract(contract-caller)` OR sender check | Marketplace transfers fail ❌ |
| `collect-cancellation-fee` | bitpay-treasury | `assert-authorized-contract(contract-caller)` | Cannot cancel streams ❌ |
| `collect-marketplace-fee` | bitpay-treasury | `assert-authorized-contract(contract-caller)` | Cannot collect marketplace fees ❌ |

### Functions Requiring Admin Role

| Function | Contract | Who Can Call |
|----------|----------|--------------|
| `authorize-contract` | bitpay-access-control | Admins only |
| `revoke-contract` | bitpay-access-control | Admins only |
| `pause-protocol` | bitpay-access-control | Admins only |
| `unpause-protocol` | bitpay-access-control | Admins only |
| `add-admin` | bitpay-access-control | Admins only |
| `remove-admin` | bitpay-access-control | Contract owner or self |
| `propose-multisig-withdrawal` | bitpay-treasury | Multi-sig admins only |
| `approve-multisig-withdrawal` | bitpay-treasury | Multi-sig admins only |
| `execute-multisig-withdrawal` | bitpay-treasury | Any multi-sig admin (after 3 approvals + timelock) |

---

## Security Boundaries

### 1. **Vault Protection** (bitpay-sbtc-helper)
- Only authorized contracts can call `transfer-from-vault`
- Prevents malicious contracts from draining protocol funds
- Authorization checked via `contract-caller` (the contract that initiated the call chain)

### 2. **Stream Ownership Protection** (bitpay-core)
- Only current sender OR authorized contracts can update stream sender
- Prevents hijacking of payment obligations
- Dual check: `tx-sender == sender` OR `contract-caller` is authorized

### 3. **Treasury Protection** (bitpay-treasury)
- Multi-sig withdrawals require 3-of-5 admin approvals
- 24-hour timelock before execution
- 100 sBTC daily limit
- Only authorized contracts can trigger fee collection

### 4. **NFT Minting Protection**
- Only `bitpay-core` can mint recipient NFTs (hardcoded contract-caller check)
- Only `bitpay-core` can mint obligation NFTs (hardcoded contract-caller check)
- Prevents fake payment stream NFTs

---

## Transaction Flows Requiring Authorization

### Flow 1: Create Stream
```
User → bitpay-core.create-stream
    ├→ bitpay-access-control.assert-not-paused ✓
    ├→ bitpay-sbtc-helper.transfer-to-vault ✓ (public)
    ├→ bitpay-nft.mint ✓ (core is contract-caller)
    └→ bitpay-obligation-nft.mint ✓ (core is contract-caller)
```
**Authorization Required:** None (all public or hardcoded checks)

### Flow 2: Withdraw From Stream
```
User → bitpay-core.withdraw-from-stream
    └→ bitpay-sbtc-helper.transfer-from-vault
        └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
```
**Authorization Required:** `bitpay-core` must be authorized

### Flow 3: Cancel Stream
```
User → bitpay-core.cancel-stream
    ├→ bitpay-treasury.collect-cancellation-fee
    │   └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
    └→ bitpay-sbtc-helper.transfer-from-vault (x3)
        └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
```
**Authorization Required:** `bitpay-core` must be authorized, `bitpay-treasury` must be authorized

### Flow 4: Buy NFT (Direct On-Chain)
```
User → bitpay-marketplace.buy-nft
    ├→ sbtc-token.transfer (to seller) ✓
    ├→ sbtc-token.transfer (to treasury) ✓
    ├→ bitpay-treasury.collect-marketplace-fee
    │   └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
    ├→ bitpay-obligation-nft.transfer ✓
    └→ bitpay-core.update-stream-sender
        └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
```
**Authorization Required:** `bitpay-marketplace` must be authorized

### Flow 5: Complete Gateway Purchase
```
Backend → bitpay-marketplace.complete-purchase
    ├→ bitpay-obligation-nft.transfer ✓
    └→ bitpay-core.update-stream-sender
        └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
```
**Authorization Required:** `bitpay-marketplace` must be authorized

### Flow 6: Multi-Sig Treasury Withdrawal
```
Admin1 → bitpay-treasury.propose-multisig-withdrawal ✓
Admin2 → bitpay-treasury.approve-multisig-withdrawal ✓
Admin3 → bitpay-treasury.approve-multisig-withdrawal ✓
[Wait 24 hours]
Admin1 → bitpay-treasury.execute-multisig-withdrawal
    └→ bitpay-sbtc-helper.transfer-from-vault
        └→ bitpay-access-control.assert-authorized-contract ❌ NEEDS AUTH
```
**Authorization Required:** `bitpay-treasury` must be authorized

---

## Setup Checklist

### ✅ Step 1: Deploy All Contracts
- [ ] bitpay-access-control
- [ ] bitpay-sbtc-helper
- [ ] bitpay-nft
- [ ] bitpay-obligation-nft
- [ ] bitpay-core
- [ ] bitpay-treasury
- [ ] bitpay-marketplace

### ✅ Step 2: Authorize Protocol Contracts
Run the authorization script (see `scripts/authorize-contracts.sh`):
- [ ] Authorize `bitpay-core`
- [ ] Authorize `bitpay-marketplace`
- [ ] Authorize `bitpay-treasury`

### ✅ Step 3: Configure Multi-Sig Treasury
Run the multi-sig setup script (see `scripts/setup-multisig-admins.sh`):
- [ ] Add 5 multi-sig admin addresses
- [ ] Verify 3-of-5 configuration
- [ ] Test proposal/approval flow

### ✅ Step 4: Verify Authorization
Run the verification script (see `scripts/verify-authorizations.sh`):
- [ ] Verify contract authorizations
- [ ] Test stream creation
- [ ] Test stream withdrawal
- [ ] Test marketplace purchase
- [ ] Test treasury withdrawal proposal

---

## Emergency Procedures

### Emergency Pause
```bash
# Only admins can pause
clarinet console
>> (contract-call? .bitpay-access-control pause-protocol)
```

**Effect:**
- Stream creation blocked
- Withdrawals still work
- Marketplace disabled (streams can't be created to sell)

### Emergency Unpause
```bash
clarinet console
>> (contract-call? .bitpay-access-control unpause-protocol)
```

### Revoke Malicious Contract
```bash
clarinet console
>> (contract-call? .bitpay-access-control revoke-contract .malicious-contract)
```

---

## Common Issues

### Issue: "ERR_UNAUTHORIZED (u200)" when withdrawing
**Cause:** `bitpay-core` is not authorized in access-control
**Fix:** Run `scripts/authorize-contracts.sh`

### Issue: "ERR_UNAUTHORIZED (u200)" when buying NFT
**Cause:** `bitpay-marketplace` is not authorized in access-control
**Fix:** Run `scripts/authorize-contracts.sh`

### Issue: "ERR_UNAUTHORIZED (u200)" when collecting fees
**Cause:** Contract calling treasury fee collection is not authorized
**Fix:** Authorize the calling contract (`bitpay-core` or `bitpay-marketplace`)

### Issue: Multi-sig withdrawal fails
**Causes:**
1. Less than 3 approvals → Get more approvals
2. Timelock not elapsed → Wait 24 hours from proposal
3. Proposal expired → Create new proposal (max 7 days)
4. `bitpay-treasury` not authorized → Run authorization script

---

## Testing Authorization

See `scripts/test-authorization-flows.sh` for comprehensive tests covering:
- Stream lifecycle (create → withdraw → cancel)
- Marketplace purchases (direct + gateway)
- Treasury withdrawals (multi-sig + timelock)
- Emergency pause scenarios
- Authorization revocation
