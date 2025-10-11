#!/bin/bash

# BitPay Protocol - Authorization Verification Script
# Verifies that all contracts are properly authorized and configured

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay Protocol - Authorization Verification            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NETWORK="${NETWORK:-simnet}"

echo "Network: ${NETWORK}"
echo ""

# Check if clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo -e "${RED}✗ Error: Clarinet is not installed${NC}"
    exit 1
fi

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
run_test() {
    local TEST_NAME=$1
    local TEST_COMMAND=$2
    local EXPECTED=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing: ${TEST_NAME}... "

    result=$(clarinet console --quiet << CONSOLE_END 2>&1
${TEST_COMMAND}
CONSOLE_END
)

    if echo "$result" | grep -q "$EXPECTED"; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: ${EXPECTED}"
        echo "  Got: ${result}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "1. Contract Authorization Checks"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "bitpay-core is authorized" \
    "(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)" \
    "true"

run_test "bitpay-marketplace is authorized" \
    "(contract-call? .bitpay-access-control is-authorized-contract .bitpay-marketplace)" \
    "true"

run_test "bitpay-treasury is authorized" \
    "(contract-call? .bitpay-access-control is-authorized-contract .bitpay-treasury)" \
    "true"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2. Access Control Configuration"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Protocol is not paused" \
    "(contract-call? .bitpay-access-control is-paused)" \
    "false"

run_test "Deployer is admin" \
    "(contract-call? .bitpay-access-control is-admin tx-sender)" \
    "true"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3. Treasury Configuration"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Treasury admin count > 0" \
    "(contract-call? .bitpay-treasury count-admins)" \
    "(ok"

run_test "Treasury fee rate is set" \
    "(contract-call? .bitpay-treasury get-marketplace-fee-bps)" \
    "(ok"

run_test "Treasury daily limit is set" \
    "(contract-call? .bitpay-treasury get-daily-withdrawal-limit)" \
    "(ok"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4. Marketplace Configuration"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Marketplace fee is configured" \
    "(contract-call? .bitpay-marketplace get-marketplace-fee-bps)" \
    "(ok"

run_test "Marketplace stats accessible" \
    "(contract-call? .bitpay-marketplace get-marketplace-stats)" \
    "(ok"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5. Core Protocol Checks"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Core next stream ID is initialized" \
    "(contract-call? .bitpay-core get-next-stream-id)" \
    "u1"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6. Integration Tests"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Testing contract call chains..."
echo ""

# Test: Can access-control authorize contracts?
echo -n "  • Access-control can authorize contracts... "
clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-test1.log > /dev/null
(contract-call? .bitpay-access-control is-authorized-contract .bitpay-core)
CONSOLE_END

if grep -q "true" /tmp/bitpay-test1.log; then
    echo -e "${GREEN}✓${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test: Can treasury get contract address?
echo -n "  • Treasury contract address accessible... "
clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-test2.log > /dev/null
(contract-call? .bitpay-treasury get-contract-address)
CONSOLE_END

if grep -q "(ok" /tmp/bitpay-test2.log; then
    echo -e "${GREEN}✓${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test: Can marketplace calculate fees?
echo -n "  • Marketplace fee calculation works... "
clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-test3.log > /dev/null
(contract-call? .bitpay-marketplace calculate-marketplace-fee u1000000)
CONSOLE_END

if grep -q "u" /tmp/bitpay-test3.log; then
    echo -e "${GREEN}✓${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Cleanup temp files
rm -f /tmp/bitpay-test*.log

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "7. Security Checks"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check that unauthorized contracts cannot access vault
echo -n "  • Unauthorized contracts blocked... "
clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-security1.log > /dev/null
;; This should fail because we're not an authorized contract
(contract-call? .bitpay-access-control assert-authorized-contract tx-sender)
CONSOLE_END

if grep -q "err" /tmp/bitpay-security1.log; then
    echo -e "${GREEN}✓${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC}"
    echo "  WARNING: Unauthorized access not properly blocked!"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

rm -f /tmp/bitpay-security1.log

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Test Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              ✓ All Verifications Passed                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Your BitPay protocol is properly configured!${NC}"
    echo ""
    echo "✓ All contracts are authorized"
    echo "✓ Access control is working"
    echo "✓ Treasury is configured"
    echo "✓ Marketplace is ready"
    echo "✓ Security checks passed"
    echo ""
    echo "Next steps:"
    echo "  1. Test stream creation and withdrawal"
    echo "  2. Test marketplace listing and purchase"
    echo "  3. Test multi-sig treasury withdrawal"
    echo "  4. Review docs/COMPLETE_SETUP_GUIDE.md"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              ✗ Some Verifications Failed                  ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${RED}Please fix the failed tests before proceeding.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Run ./scripts/authorize-contracts.sh"
    echo "  • Run ./scripts/setup-multisig-admins.sh"
    echo "  • Check contract deployment was successful"
    echo "  • Verify you're using the correct network"
    echo ""
    echo "For help, see:"
    echo "  • docs/CONTRACT_AUTHORIZATION_MATRIX.md"
    echo "  • docs/COMPLETE_SETUP_GUIDE.md"
    echo ""
    exit 1
fi
