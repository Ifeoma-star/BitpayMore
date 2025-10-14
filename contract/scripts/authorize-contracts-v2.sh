#!/bin/bash

# BitPay V2 Contract Authorization Script
# Authorizes protocol contracts on testnet

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay V2 Contract Authorization - Testnet              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOYER="ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7"

echo "This script will authorize 3 contracts:"
echo "  1. bitpay-core-v2"
echo "  2. bitpay-marketplace-v2"
echo "  3. bitpay-treasury-v2"
echo ""

# Check if stx CLI is installed
if command -v stx &> /dev/null; then
    echo -e "${GREEN}✓ stx CLI found${NC}"
    USE_STX=true
else
    echo -e "${YELLOW}⚠ stx CLI not found${NC}"
    echo "Installing stx CLI..."
    npm install -g @stacks/cli 2>/dev/null || {
        echo -e "${RED}✗ Failed to install stx CLI${NC}"
        echo ""
        echo "Please install manually:"
        echo "  npm install -g @stacks/cli"
        echo ""
        echo "Or use the manual authorization method below."
        USE_STX=false
    }
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Authorization Transactions:"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$USE_STX" = true ]; then
    echo "Using stx CLI to broadcast transactions..."
    echo ""

    # Authorize core
    echo "1. Authorizing bitpay-core-v2..."
    stx call_contract_func \
        ${DEPLOYER} \
        bitpay-access-control-v2 \
        authorize-contract \
        --testnet \
        -p ".bitpay-core-v2" \
        --fee 10000 || echo -e "${RED}✗ Failed${NC}"

    echo ""
    sleep 2

    # Authorize marketplace
    echo "2. Authorizing bitpay-marketplace-v2..."
    stx call_contract_func \
        ${DEPLOYER} \
        bitpay-access-control-v2 \
        authorize-contract \
        --testnet \
        -p ".bitpay-marketplace-v2" \
        --fee 10000 || echo -e "${RED}✗ Failed${NC}"

    echo ""
    sleep 2

    # Authorize treasury
    echo "3. Authorizing bitpay-treasury-v2..."
    stx call_contract_func \
        ${DEPLOYER} \
        bitpay-access-control-v2 \
        authorize-contract \
        --testnet \
        -p ".bitpay-treasury-v2" \
        --fee 10000 || echo -e "${RED}✗ Failed${NC}"

    echo ""
    echo -e "${GREEN}✓ Authorization transactions submitted${NC}"
    echo "Waiting for confirmations (this may take a few minutes)..."
    sleep 30

else
    echo -e "${YELLOW}Manual Authorization Required${NC}"
    echo ""
    echo "Since stx CLI is not available, please use one of these methods:"
    echo ""
    echo "─────────────────────────────────────────────────────────"
    echo "METHOD 1: Using Stacks Explorer"
    echo "─────────────────────────────────────────────────────────"
    echo ""
    echo "1. Go to: https://explorer.hiro.so/sandbox/contract-call?chain=testnet"
    echo ""
    echo "2. Fill in these details for EACH authorization:"
    echo ""
    echo "   Contract Address: ${DEPLOYER}"
    echo "   Contract Name: bitpay-access-control-v2"
    echo "   Function: authorize-contract"
    echo ""
    echo "3. For bitpay-core-v2:"
    echo "   contract-to-auth: ${DEPLOYER}.bitpay-core-v2"
    echo ""
    echo "4. For bitpay-marketplace-v2:"
    echo "   contract-to-auth: ${DEPLOYER}.bitpay-marketplace-v2"
    echo ""
    echo "5. For bitpay-treasury-v2:"
    echo "   contract-to-auth: ${DEPLOYER}.bitpay-treasury-v2"
    echo ""
    echo "─────────────────────────────────────────────────────────"
    echo "METHOD 2: Using clarinet and manual deployment"
    echo "─────────────────────────────────────────────────────────"
    echo ""
    echo "Create authorization transactions manually and broadcast them."
    echo ""
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Next: Verify Authorizations"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "After authorizations are confirmed, check status with:"
echo "  ./scripts/check-authorizations.sh"
echo ""
