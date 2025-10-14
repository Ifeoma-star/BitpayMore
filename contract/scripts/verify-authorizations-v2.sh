#!/bin/bash

# Verify BitPay V2 Contract Authorizations

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay V2 Authorization Verification - Testnet          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOYER="ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7"
API="https://api.testnet.hiro.so"

echo "Checking authorization status..."
echo ""
echo "═══════════════════════════════════════════════════════════"

# Simple check using transaction history
check_auth() {
    local contract=$1
    echo -n "${contract}... "

    # Check if authorization transaction exists and succeeded
    local tx_check=$(curl -s "${API}/extended/v1/address/${DEPLOYER}/transactions?limit=50" | \
        python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tx in data.get('results', []):
        if tx.get('tx_type') == 'contract_call':
            contract_id = tx.get('contract_call', {}).get('contract_id', '')
            function_name = tx.get('contract_call', {}).get('function_name', '')
            if 'bitpay-access-control-v2' in contract_id and function_name == 'authorize-contract':
                if tx.get('tx_status') == 'success':
                    # Check function args for our contract
                    args = str(tx.get('contract_call', {}).get('function_args', []))
                    if '${contract}' in args:
                        print('AUTHORIZED')
                        break
except:
    pass
" 2>/dev/null)

    if [ "$tx_check" = "AUTHORIZED" ]; then
        echo -e "${GREEN}✓ AUTHORIZED${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ CHECKING...${NC}"
        return 1
    fi
}

SUCCESS=0
TOTAL=3

check_auth "bitpay-core-v2" && ((SUCCESS++))
check_auth "bitpay-marketplace-v2" && ((SUCCESS++))
check_auth "bitpay-treasury-v2" && ((SUCCESS++))

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo -e "  ${GREEN}✓ Authorized: ${SUCCESS}/${TOTAL}${NC}"

if [ $SUCCESS -eq $TOTAL ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL AUTHORIZATIONS CONFIRMED - PROTOCOL READY! 🚀      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Your BitPay protocol is fully deployed and authorized!"
    echo ""
    echo "Deployed Contracts:"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-access-control-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-nft-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-obligation-nft-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-sbtc-helper-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-treasury-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core-v2"
    echo "  • ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-marketplace-v2"
    echo ""
    echo "Next Steps:"
    echo "  1. ✅ Update frontend with new contract addresses"
    echo "  2. 🧪 Test stream creation and withdrawal"
    echo "  3. 🧪 Test marketplace functionality"
    echo "  4. 🔐 Configure multi-sig treasury (optional)"
    echo ""
else
    echo ""
    echo -e "${RED}⚠ Some contracts may not be authorized yet${NC}"
    echo "If authorization just completed, wait a few blocks and run again."
    echo ""
fi
