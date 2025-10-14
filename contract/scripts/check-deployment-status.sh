#!/bin/bash

# Simple BitPay Deployment Checker

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay Contract Deployment Status - Testnet             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

DEPLOYER="ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7"

echo "Deployer: ${DEPLOYER}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Checking Contract Deployments:"
echo "═══════════════════════════════════════════════════════════"
echo ""

SUCCESS=0
FAILED=0

check_contract() {
    local name=$1
    echo -n "${name}... "

    # Try to fetch contract interface
    local response=$(curl -s "https://api.testnet.hiro.so/v2/contracts/interface/${DEPLOYER}/${name}" 2>/dev/null)

    if echo "$response" | grep -q '"functions"'; then
        echo -e "${GREEN}✓ DEPLOYED${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        ((FAILED++))
        return 1
    fi
}

# Check all v2 contracts
check_contract "bitpay-access-control-v2"
check_contract "bitpay-nft-v2"
check_contract "bitpay-obligation-nft-v2"
check_contract "bitpay-sbtc-helper-v2"
check_contract "bitpay-treasury-v2"
check_contract "bitpay-core-v2"
check_contract "bitpay-marketplace-v2"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Summary:"
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Deployed: ${SUCCESS}/7${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}✗ Missing: ${FAILED}/7${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Contract Addresses:"
echo "═══════════════════════════════════════════════════════════"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-access-control-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-nft-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-obligation-nft-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-sbtc-helper-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-treasury-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core-v2"
echo "ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-marketplace-v2"

echo ""
if [ $SUCCESS -eq 7 ]; then
    echo -e "${GREEN}✓ All contracts deployed successfully!${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Authorize contracts (CRITICAL):"
    echo "     clarinet console --testnet"
    echo "     Then run:"
    echo "       (contract-call? .bitpay-access-control-v2 authorize-contract .bitpay-core-v2)"
    echo "       (contract-call? .bitpay-access-control-v2 authorize-contract .bitpay-marketplace-v2)"
    echo "       (contract-call? .bitpay-access-control-v2 authorize-contract .bitpay-treasury-v2)"
    echo ""
    echo "  2. Verify authorizations:"
    echo "       (contract-call? .bitpay-access-control-v2 is-authorized-contract .bitpay-core-v2)"
    echo "       (contract-call? .bitpay-access-control-v2 is-authorized-contract .bitpay-marketplace-v2)"
    echo "       (contract-call? .bitpay-access-control-v2 is-authorized-contract .bitpay-treasury-v2)"
else
    echo -e "${RED}✗ Some contracts are missing!${NC}"
    exit 1
fi
echo "═══════════════════════════════════════════════════════════"
echo ""
