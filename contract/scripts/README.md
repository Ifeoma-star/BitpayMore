# BitPay Protocol - Authorization Scripts

This directory contains scripts for configuring and verifying the BitPay protocol after deployment.

## Scripts Overview

### 1. `authorize-contracts.sh`
**Purpose:** Authorize core protocol contracts in the access-control system

**What it does:**
- Authorizes `bitpay-core` for vault access and stream operations
- Authorizes `bitpay-marketplace` for NFT sales and fee collection
- Authorizes `bitpay-treasury` for multi-sig withdrawals
- Verifies all authorizations completed successfully

**When to run:** Immediately after deploying all contracts (first configuration step)

**Usage:**
```bash
./scripts/authorize-contracts.sh
```

**Expected output:**
```
✓ bitpay-core authorized successfully
✓ bitpay-marketplace authorized successfully
✓ bitpay-treasury authorized successfully
✓ All authorizations verified
```

---

### 2. `setup-multisig-admins.sh`
**Purpose:** Configure 5 multi-sig administrators for treasury governance

**What it does:**
- Prompts for 5 admin addresses (or uses defaults for testing)
- Creates proposals to add each admin
- Shows approval workflow
- Verifies final admin count

**When to run:** After authorizing contracts (second configuration step)

**Usage:**
```bash
./scripts/setup-multisig-admins.sh
```

**Interactive prompts:**
- Admin 1-5 addresses (accepts defaults for testing)
- Confirmation before proceeding

**Configuration:**
- Total admins: 5
- Required approvals: 3 (3-of-5 multi-sig)
- Timelock: 24 hours (144 blocks)
- Daily limit: 100 sBTC

---

### 3. `verify-authorizations.sh`
**Purpose:** Verify all contracts are properly configured and authorized

**What it does:**
- Tests contract authorization status
- Checks access control configuration
- Verifies treasury multi-sig setup
- Validates marketplace configuration
- Tests core protocol initialization
- Runs integration tests
- Checks security boundaries

**When to run:**
- After completing authorization and multi-sig setup
- Before running production tests
- Periodically to verify configuration hasn't changed

**Usage:**
```bash
./scripts/verify-authorizations.sh
```

**Test categories:**
1. Contract Authorization Checks (3 tests)
2. Access Control Configuration (2 tests)
3. Treasury Configuration (3 tests)
4. Marketplace Configuration (2 tests)
5. Core Protocol Checks (1 test)
6. Integration Tests (3 tests)
7. Security Checks (1 test)

**Expected output:**
```
Total Tests: 15
Passed: 15
Failed: 0

✓ All Verifications Passed
```

---

### 4. `test-authorization-flows.sh`
**Purpose:** Comprehensive end-to-end testing of all authorization flows

**What it does:**
- Tests complete stream lifecycle
- Tests marketplace operations
- Tests multi-sig treasury workflows
- Tests gateway-assisted purchases
- Tests access control operations
- Tests NFT minting and tracking
- Tests vault balance management
- Tests security boundaries

**When to run:**
- After verification passes
- Before production launch
- After making configuration changes
- Periodically as regression tests

**Usage:**
```bash
./scripts/test-authorization-flows.sh
```

**Test flows:**
1. Stream Creation and Withdrawal
2. Marketplace Listing and Purchase
3. Treasury Multi-Sig Operations
4. Gateway-Assisted Purchase
5. Access Control Operations
6. Stream Cancellation with Fees
7. NFT Operations
8. Vault Balance Checks
9. Authorization Security Tests

**Pass criteria:** ≥90% pass rate for production readiness

---

## Deployment Workflow

Follow this sequence for proper deployment:

```
1. Deploy all contracts
   ├─ bitpay-access-control
   ├─ bitpay-sbtc-helper
   ├─ bitpay-nft
   ├─ bitpay-obligation-nft
   ├─ bitpay-treasury
   ├─ bitpay-core
   └─ bitpay-marketplace

2. Run authorization script
   $ ./scripts/authorize-contracts.sh
   └─ Authorizes 3 core contracts

3. Run multi-sig setup script
   $ ./scripts/setup-multisig-admins.sh
   └─ Adds 5 treasury admins

4. Run verification script
   $ ./scripts/verify-authorizations.sh
   └─ Confirms everything configured correctly

5. Run comprehensive tests
   $ ./scripts/test-authorization-flows.sh
   └─ Tests all functionality end-to-end

6. Deploy to production
   └─ Monitor closely
```

---

## Environment Variables

### Network Configuration
```bash
export NETWORK=simnet    # simnet, testnet, or mainnet
export DEPLOYER=deployer # Deployer account name
```

### Using with different networks
```bash
# Simnet (default)
./scripts/authorize-contracts.sh

# Testnet
NETWORK=testnet ./scripts/authorize-contracts.sh

# Mainnet
NETWORK=mainnet ./scripts/authorize-contracts.sh
```

---

## Troubleshooting

### Issue: "Clarinet is not installed"
**Solution:** Install Clarinet
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.run | sh
```

### Issue: "Failed to authorize bitpay-core"
**Possible causes:**
1. Contracts not deployed
2. Not running as deployer/admin
3. Contract already authorized

**Solution:**
```bash
# Check if contract is deployed
clarinet contracts list

# Check if you're admin
clarinet console
(contract-call? .bitpay-access-control is-admin tx-sender)

# Check if already authorized
(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)
```

### Issue: "Multi-sig admin addition fails"
**Possible causes:**
1. Not enough approvals (need 3)
2. Caller is not admin
3. Admin already exists

**Solution:**
```bash
# Check current admin count
clarinet console
(contract-call? .bitpay-treasury count-admins)

# Check if address is already admin
(contract-call? .bitpay-treasury is-multisig-admin 'ADDRESS)

# Check if you're admin
(contract-call? .bitpay-treasury is-multisig-admin tx-sender)
```

### Issue: "Verification tests failing"
**Solution:** Run authorization scripts in order:
```bash
./scripts/authorize-contracts.sh
./scripts/setup-multisig-admins.sh
./scripts/verify-authorizations.sh
```

---

## Script Requirements

### System Requirements
- Bash shell (Linux, macOS, or WSL on Windows)
- Clarinet CLI installed and in PATH
- Working directory: Project root

### Account Requirements
- Deployer account with admin privileges
- Sufficient STX for transaction gas
- For multi-sig: 5 admin accounts with STX

### Contract Requirements
All contracts must be deployed before running scripts:
- bitpay-access-control ✓
- bitpay-sbtc-helper ✓
- bitpay-nft ✓
- bitpay-obligation-nft ✓
- bitpay-treasury ✓
- bitpay-core ✓
- bitpay-marketplace ✓

---

## Testing on Different Networks

### Simnet (Local Development)
```bash
# Use default configuration
./scripts/authorize-contracts.sh
./scripts/setup-multisig-admins.sh
./scripts/verify-authorizations.sh
```

### Testnet (Pre-Production)
```bash
# Set network and test with real accounts
export NETWORK=testnet
./scripts/authorize-contracts.sh

# Provide real testnet addresses for admins
./scripts/setup-multisig-admins.sh

# Verify everything works
./scripts/verify-authorizations.sh
./scripts/test-authorization-flows.sh
```

### Mainnet (Production)
```bash
# Use production configuration
export NETWORK=mainnet

# Run with production admin addresses
./scripts/authorize-contracts.sh
./scripts/setup-multisig-admins.sh

# Comprehensive verification
./scripts/verify-authorizations.sh

# Full testing (with caution - uses real funds)
./scripts/test-authorization-flows.sh
```

---

## Security Notes

### Admin Keys
- Store admin private keys securely
- Use hardware wallets for mainnet admins
- Never commit private keys to git
- Implement key rotation procedures

### Multi-Sig Best Practices
- Use geographically distributed admins
- Use different organizations/individuals
- Test multi-sig flow on testnet first
- Document emergency procedures
- Set up secure communication channels

### Script Safety
- Scripts are read-only (verification scripts)
- Authorization scripts modify state (run once)
- Test scripts may create transactions
- Review scripts before execution
- Keep backups before running

---

## Script Output Logging

All scripts log output to console. To save logs:

```bash
# Save authorization log
./scripts/authorize-contracts.sh | tee authorization.log

# Save verification results
./scripts/verify-authorizations.sh | tee verification.log

# Save test results
./scripts/test-authorization-flows.sh | tee test-results.log
```

---

## Automation

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy and Verify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Clarinet
        run: |
          curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.run | sh

      - name: Deploy contracts
        run: |
          clarinet deployments apply

      - name: Authorize contracts
        run: |
          ./scripts/authorize-contracts.sh

      - name: Setup multi-sig
        run: |
          ./scripts/setup-multisig-admins.sh

      - name: Verify setup
        run: |
          ./scripts/verify-authorizations.sh

      - name: Run tests
        run: |
          ./scripts/test-authorization-flows.sh
```

---

## Support

For issues with scripts:

1. Check troubleshooting section above
2. Review documentation in `docs/` directory
3. Check contract deployment status
4. Verify account permissions
5. Review script output carefully

---

## Documentation Links

- [Complete Setup Guide](../docs/COMPLETE_SETUP_GUIDE.md)
- [Authorization Matrix](../docs/CONTRACT_AUTHORIZATION_MATRIX.md)
- [Multi-Sig Treasury Guide](../docs/MULTISIG_TREASURY_GUIDE.md)
- [Deployment Checklist](../docs/DEPLOYMENT_CHECKLIST.md)
- [Security Guide](../docs/SECURITY_DEPLOYMENT_GUIDE.md)

---

## Contributing

If you find issues or want to improve scripts:

1. Test changes thoroughly
2. Update documentation
3. Follow existing code style
4. Add error handling
5. Update this README

---

## License

Same as main project license
