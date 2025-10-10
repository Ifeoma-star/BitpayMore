# BitPay Security Deployment Guide

## Vault Access Control Security Feature

This guide explains the security improvements made to protect the BitPay vault from unauthorized access.

---

## 🔒 Security Enhancement Overview

**Problem Solved:** Prevents malicious contracts from draining the vault by calling `transfer-from-vault` directly.

**Solution:** Contract-caller authorization using the access-control contract as a central authority.

---

## 📋 Deployment Steps

### Step 1: Deploy All Contracts

Deploy contracts in the following order:

```bash
# 1. Deploy access control (base dependency)
clarinet deployments apply -p ./deployments/default.simnet-plan.yaml

# Contracts deployed:
# - bitpay-access-control.clar
# - bitpay-sbtc-helper.clar
# - bitpay-core.clar
# - bitpay-treasury.clar
# - bitpay-nft.clar
```

### Step 2: Authorize Core Contract

After deployment, authorize `bitpay-core` to access the vault:

```typescript
// Using Stacks.js
import { makeContractCall, broadcastTransaction } from '@stacks/transactions';

const authorizeCoreContract = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitpay-access-control',
    functionName: 'authorize-contract',
    functionArgs: [
      principalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-core')
    ],
    senderKey: deployerPrivateKey,
    network: new StacksTestnet(),
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  console.log('✅ bitpay-core authorized:', broadcastResponse.txid);
};

await authorizeCoreContract();
```

**Using Clarinet Console:**

```clarity
(contract-call? .bitpay-access-control authorize-contract .bitpay-core)
```

### Step 3: Authorize Treasury Contract (Optional)

If using the treasury for fee collection:

```typescript
const authorizeTreasuryContract = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitpay-access-control',
    functionName: 'authorize-contract',
    functionArgs: [
      principalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-treasury')
    ],
    senderKey: deployerPrivateKey,
    network: new StacksTestnet(),
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  console.log('✅ bitpay-treasury authorized:', broadcastResponse.txid);
};

await authorizeTreasuryContract();
```

### Step 4: Verify Authorization

Check that contracts are properly authorized:

```typescript
const verifyAuthorization = async () => {
  const { result: coreAuth } = await callReadOnlyFunction({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitpay-access-control',
    functionName: 'is-authorized-contract',
    functionArgs: [
      principalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bitpay-core')
    ],
    senderAddress: deployerAddress,
    network: new StacksTestnet(),
  });

  console.log('bitpay-core authorized:', cvToValue(result)); // Should be true
};

await verifyAuthorization();
```

---

## 🧪 Testing the Security Feature

Run the security tests:

```bash
# Run all tests
npm test

# Run only security tests
npm test security-vault-access.test.ts
```

### Manual Security Test

Try to call `transfer-from-vault` from an unauthorized contract:

```clarity
;; This should FAIL with ERR_UNAUTHORIZED (u200)
(contract-call? .bitpay-sbtc-helper transfer-from-vault u1000000 tx-sender)

;; Result: (err u200) ✅ Access denied!
```

Try through authorized `bitpay-core`:

```clarity
;; First create a stream
(contract-call? .bitpay-core create-stream
  'ST2... ;; recipient
  u10000000 ;; amount
  block-height ;; start
  (+ block-height u1000) ;; end
)

;; Advance blocks to vest
;; ...

;; Withdraw through authorized contract
(contract-call? .bitpay-core withdraw-from-stream u1)

;; Result: (ok u...) ✅ Withdrawal successful!
```

---

## 🔐 Security Architecture

### Contract Authorization Flow

```
┌─────────────────────────────────────────────────┐
│           bitpay-access-control                 │
│                                                  │
│  authorized-contracts map:                      │
│    .bitpay-core      → true  ✅                │
│    .bitpay-treasury  → true  ✅                │
│    .malicious-contract → NOT IN MAP ❌         │
└─────────────────────────────────────────────────┘
                       ▲
                       │ checks authorization
                       │
┌──────────────────────┴──────────────────────────┐
│           bitpay-sbtc-helper                     │
│                                                  │
│  transfer-from-vault(amount, recipient)         │
│    1. Check: contract-caller authorized? ✅     │
│    2. Transfer: vault → recipient                │
└──────────────────────────────────────────────────┘
                       ▲
                       │ calls
                       │
┌──────────────────────┴──────────────────────────┐
│           bitpay-core                            │
│                                                  │
│  withdraw-from-stream(stream-id)                │
│    1. Check: tx-sender = recipient? ✅          │
│    2. Calculate vested amount                    │
│    3. Call: transfer-from-vault                  │
└──────────────────────────────────────────────────┘
```

### Attack Prevention

**Unauthorized Contract Attack (BLOCKED):**

```
Attacker → malicious-contract → transfer-from-vault
                                       ↓
                              contract-caller check
                                       ↓
                        is malicious-contract authorized?
                                       ↓
                                     NO ❌
                                       ↓
                            ERR_UNAUTHORIZED (u200)
```

**Legitimate Withdrawal (ALLOWED):**

```
User → bitpay-core.withdraw-from-stream → transfer-from-vault
             ↓                                    ↓
     recipient check ✅               contract-caller check
             ↓                                    ↓
     vested amount check ✅          is bitpay-core authorized?
             ↓                                    ↓
     calls transfer-from-vault                  YES ✅
                                                  ↓
                                       Transfer executes ✅
```

---

## 🛡️ Admin Functions

### Add Admin

```typescript
const addAdmin = async (newAdminAddress: string) => {
  await makeContractCall({
    contractAddress: deployerAddress,
    contractName: 'bitpay-access-control',
    functionName: 'add-admin',
    functionArgs: [principalCV(newAdminAddress)],
    senderKey: adminPrivateKey,
    network,
  });
};
```

### Authorize New Contract

```typescript
const authorizeContract = async (contractPrincipal: string) => {
  await makeContractCall({
    contractAddress: deployerAddress,
    contractName: 'bitpay-access-control',
    functionName: 'authorize-contract',
    functionArgs: [principalCV(contractPrincipal)],
    senderKey: adminPrivateKey,
    network,
  });
};
```

### Revoke Contract Authorization

```typescript
const revokeContract = async (contractPrincipal: string) => {
  await makeContractCall({
    contractAddress: deployerAddress,
    contractName: 'bitpay-access-control',
    functionName: 'revoke-contract',
    functionArgs: [principalCV(contractPrincipal)],
    senderKey: adminPrivateKey,
    network,
  });
};
```

---

## 📊 Monitoring & Events

All authorization changes emit events that can be monitored:

### contract-authorized Event

```typescript
{
  event: "contract-authorized",
  contract: principal,
  authorized-by: principal
}
```

### contract-revoked Event

```typescript
{
  event: "contract-revoked",
  contract: principal,
  revoked-by: principal
}
```

### Monitoring with Chainhook

```json
{
  "chain": "stacks",
  "uuid": "bitpay-authorization-monitor",
  "name": "BitPay Authorization Monitor",
  "version": 1,
  "networks": {
    "testnet": {
      "if_this": {
        "scope": "print_event",
        "contract_identifier": "ST1...bitpay-access-control",
        "contains": "contract-authorized"
      },
      "then_that": {
        "http_post": {
          "url": "https://api.bitpay.com/webhooks/authorization",
          "authorization_header": "Bearer YOUR_TOKEN"
        }
      }
    }
  }
}
```

---

## ⚠️ Important Security Notes

1. **Only Admins Can Authorize**: Ensure deployer wallet is secure
2. **Revocation is Immediate**: Revoking authorization takes effect on next block
3. **No Circular Dependencies**: Access-control is the base layer dependency
4. **Event Logging**: All auth changes are logged on-chain for auditing
5. **Testnet First**: Always test authorization on testnet before mainnet

---

## 🚀 Production Checklist

- [ ] Deploy all contracts to testnet
- [ ] Authorize bitpay-core contract
- [ ] Authorize bitpay-treasury contract (if used)
- [ ] Run full security test suite
- [ ] Verify authorization with read-only calls
- [ ] Test stream creation → withdrawal flow
- [ ] Attempt unauthorized access (should fail)
- [ ] Set up Chainhook monitoring
- [ ] Document authorized contracts in team wiki
- [ ] Deploy to mainnet
- [ ] Repeat authorization steps on mainnet
- [ ] Final security verification on mainnet

---

## 📞 Emergency Procedures

If unauthorized access is detected:

1. **Immediately pause protocol:**
   ```typescript
   await makeContractCall({
     contractName: 'bitpay-access-control',
     functionName: 'pause-protocol',
     ...
   });
   ```

2. **Revoke suspicious contract:**
   ```typescript
   await makeContractCall({
     contractName: 'bitpay-access-control',
     functionName: 'revoke-contract',
     functionArgs: [principalCV(suspiciousContract)],
     ...
   });
   ```

3. **Audit all recent vault transactions**

4. **Unpause after confirming security**

---

## 📚 Additional Resources

- [Clarity Security Best Practices](https://docs.stacks.co/clarity/security)
- [BitPay Smart Contract Documentation](../README.md)
- [Stacks.js Documentation](https://stacks.js.org/)

---

**Questions or Security Concerns?**
Contact the security team immediately at security@bitpay.com
