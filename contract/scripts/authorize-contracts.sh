#!/bin/bash

# BitPay Protocol - Contract Authorization Script
# This script authorizes the core protocol contracts in bitpay-access-control
# Must be run after deploying all contracts

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay Protocol - Contract Authorization Setup          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NETWORK="${NETWORK:-simnet}"
DEPLOYER="${DEPLOYER:-deployer}"

echo "Network: ${NETWORK}"
echo "Deployer: ${DEPLOYER}"
echo ""

# Check if clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo -e "${RED}✗ Error: Clarinet is not installed${NC}"
    echo "Install from: https://docs.hiro.so/clarinet/installation"
    exit 1
fi

echo -e "${GREEN}✓ Clarinet found${NC}"
echo ""

# Create temporary Clarity script
SCRIPT_FILE=$(mktemp)
cat > "$SCRIPT_FILE" << 'EOF'
;; BitPay Protocol Authorization Script
;; This script authorizes the core protocol contracts

(define-public (authorize-all-contracts)
  (begin
    ;; Authorize bitpay-core
    ;; Required for: stream withdrawals, cancellations, vault access
    (unwrap! (contract-call? .bitpay-access-control authorize-contract .bitpay-core)
      (err "Failed to authorize bitpay-core"))

    ;; Authorize bitpay-marketplace
    ;; Required for: NFT sales, stream sender updates, fee collection
    (unwrap! (contract-call? .bitpay-access-control authorize-contract .bitpay-marketplace)
      (err "Failed to authorize bitpay-marketplace"))

    ;; Authorize bitpay-treasury
    ;; Required for: multi-sig withdrawals from vault
    (unwrap! (contract-call? .bitpay-access-control authorize-contract .bitpay-treasury)
      (err "Failed to authorize bitpay-treasury"))

    (ok "All contracts authorized successfully")
  )
)

;; Execute authorization
(print (authorize-all-contracts))
EOF

echo "═══════════════════════════════════════════════════════════"
echo "Step 1: Authorizing bitpay-core"
echo "═══════════════════════════════════════════════════════════"
echo "Required for: Stream withdrawals, cancellations, vault access"
echo ""

clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-auth.log
(contract-call? .bitpay-access-control authorize-contract .bitpay-core)
CONSOLE_END

if grep -q "(ok true)" /tmp/bitpay-auth.log; then
    echo -e "${GREEN}✓ bitpay-core authorized successfully${NC}"
else
    echo -e "${RED}✗ Failed to authorize bitpay-core${NC}"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "Step 2: Authorizing bitpay-marketplace"
echo "═══════════════════════════════════════════════════════════"
echo "Required for: NFT sales, stream sender updates"
echo ""

clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-auth.log
(contract-call? .bitpay-access-control authorize-contract .bitpay-marketplace)
CONSOLE_END

if grep -q "(ok true)" /tmp/bitpay-auth.log; then
    echo -e "${GREEN}✓ bitpay-marketplace authorized successfully${NC}"
else
    echo -e "${RED}✗ Failed to authorize bitpay-marketplace${NC}"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "Step 3: Authorizing bitpay-treasury"
echo "═══════════════════════════════════════════════════════════"
echo "Required for: Multi-sig withdrawals from vault"
echo ""

clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-auth.log
(contract-call? .bitpay-access-control authorize-contract .bitpay-treasury)
CONSOLE_END

if grep -q "(ok true)" /tmp/bitpay-auth.log; then
    echo -e "${GREEN}✓ bitpay-treasury authorized successfully${NC}"
else
    echo -e "${RED}✗ Failed to authorize bitpay-treasury${NC}"
    exit 1
fi
echo ""

# Cleanup
rm -f "$SCRIPT_FILE"
rm -f /tmp/bitpay-auth.log

echo "═══════════════════════════════════════════════════════════"
echo "Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""

clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-verify.log
(print "=== Contract Authorization Status ===")
(print { bitpay-core: (contract-call? .bitpay-access-control is-authorized-contract .bitpay-core) })
(print { bitpay-marketplace: (contract-call? .bitpay-access-control is-authorized-contract .bitpay-marketplace) })
(print { bitpay-treasury: (contract-call? .bitpay-access-control is-authorized-contract .bitpay-treasury) })
CONSOLE_END

if grep -q "bitpay-core: true" /tmp/bitpay-verify.log && \
   grep -q "bitpay-marketplace: true" /tmp/bitpay-verify.log && \
   grep -q "bitpay-treasury: true" /tmp/bitpay-verify.log; then
    echo -e "${GREEN}✓ All authorizations verified${NC}"
else
    echo -e "${RED}✗ Verification failed${NC}"
    exit 1
fi

rm -f /tmp/bitpay-verify.log

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 ✓ Authorization Complete                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Run ./scripts/setup-multisig-admins.sh to configure treasury"
echo "  2. Run ./scripts/verify-authorizations.sh to test functionality"
echo ""
echo "Documentation:"
echo "  - docs/CONTRACT_AUTHORIZATION_MATRIX.md"
echo "  - docs/COMPLETE_SETUP_GUIDE.md"
echo ""
