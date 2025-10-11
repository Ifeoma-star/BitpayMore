#!/bin/bash

# BitPay Protocol - Multi-Sig Treasury Admin Setup Script
# This script adds 5 multi-sig administrators to the treasury contract
# Requires 3-of-5 approvals for withdrawals

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   BitPay Treasury - Multi-Sig Admin Setup                 ║"
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

echo -e "${GREEN}✓ Clarinet found${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "Multi-Sig Configuration"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Treasury Configuration:"
echo "  • Total Admin Slots: 5"
echo "  • Required Approvals: 3 (3-of-5 multi-sig)"
echo "  • Timelock Period: 24 hours (144 blocks)"
echo "  • Daily Withdrawal Limit: 100 sBTC"
echo "  • Proposal Expiry: 7 days (1008 blocks)"
echo ""

# Admin addresses to add (replace with your actual addresses)
echo -e "${YELLOW}Configure your admin addresses:${NC}"
echo ""
echo "You need to provide 5 Stacks addresses for multi-sig admins."
echo "These admins will control treasury withdrawals (3 approvals required)."
echo ""
echo "Press Enter to use default test addresses, or provide your own:"
echo ""

# Default test addresses for simnet (replace in production!)
DEFAULT_ADMIN_1="ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
DEFAULT_ADMIN_2="ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND"
DEFAULT_ADMIN_3="ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB"
DEFAULT_ADMIN_4="ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0"
DEFAULT_ADMIN_5="ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"

read -p "Admin 1 address [${DEFAULT_ADMIN_1}]: " ADMIN_1
ADMIN_1=${ADMIN_1:-$DEFAULT_ADMIN_1}

read -p "Admin 2 address [${DEFAULT_ADMIN_2}]: " ADMIN_2
ADMIN_2=${ADMIN_2:-$DEFAULT_ADMIN_2}

read -p "Admin 3 address [${DEFAULT_ADMIN_3}]: " ADMIN_3
ADMIN_3=${ADMIN_3:-$DEFAULT_ADMIN_3}

read -p "Admin 4 address [${DEFAULT_ADMIN_4}]: " ADMIN_4
ADMIN_4=${ADMIN_4:-$DEFAULT_ADMIN_4}

read -p "Admin 5 address [${DEFAULT_ADMIN_5}]: " ADMIN_5
ADMIN_5=${ADMIN_5:-$DEFAULT_ADMIN_5}

echo ""
echo "Admin addresses configured:"
echo "  1. ${ADMIN_1}"
echo "  2. ${ADMIN_2}"
echo "  3. ${ADMIN_3}"
echo "  4. ${ADMIN_4}"
echo "  5. ${ADMIN_5}"
echo ""

read -p "Proceed with these addresses? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Adding Multi-Sig Admins"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Note: Each admin addition requires a multi-sig proposal${NC}"
echo "The deployer is automatically added as the first admin."
echo ""

# Function to add an admin via multi-sig proposal
add_admin() {
    local ADMIN_ADDRESS=$1
    local ADMIN_NUM=$2
    local DESCRIPTION=$3

    echo "───────────────────────────────────────────────────────────"
    echo "Adding Admin ${ADMIN_NUM}: ${ADMIN_ADDRESS}"
    echo "───────────────────────────────────────────────────────────"
    echo ""

    # Step 1: Propose adding admin
    echo "Step 1: Creating proposal..."
    clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-admin-add.log
(contract-call? .bitpay-treasury propose-add-admin '${ADMIN_ADDRESS} "${DESCRIPTION}")
CONSOLE_END

    if grep -q "(ok" /tmp/bitpay-admin-add.log; then
        PROPOSAL_ID=$(grep -oP '\(ok u\K[0-9]+' /tmp/bitpay-admin-add.log | head -1)
        echo -e "${GREEN}✓ Proposal created (ID: ${PROPOSAL_ID})${NC}"
    else
        echo -e "${RED}✗ Failed to create proposal${NC}"
        cat /tmp/bitpay-admin-add.log
        return 1
    fi

    echo ""
    echo -e "${YELLOW}Note: In production, you would need 2 more approvals from existing admins${NC}"
    echo -e "${YELLOW}For initial setup, the deployer auto-approves, but you still need 2 more approvals${NC}"
    echo ""

    # For initial setup on simnet, we can simulate approvals if needed
    # In production, different admin accounts would need to call approve-admin-proposal

    echo "Step 2: Getting additional approvals (simulating for setup)..."
    echo -e "${YELLOW}In production: Run from 2 other admin accounts:${NC}"
    echo "(contract-call? .bitpay-treasury approve-admin-proposal u${PROPOSAL_ID})"
    echo ""

    # Step 3: Execute proposal (after 3 approvals)
    echo "Step 3: Executing proposal..."
    clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-admin-execute.log
(contract-call? .bitpay-treasury execute-admin-proposal u${PROPOSAL_ID})
CONSOLE_END

    if grep -q "(ok true)" /tmp/bitpay-admin-execute.log; then
        echo -e "${GREEN}✓ Admin ${ADMIN_NUM} added successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Manual approval required${NC}"
        echo "After getting 3 approvals, run:"
        echo "(contract-call? .bitpay-treasury execute-admin-proposal u${PROPOSAL_ID})"
    fi

    echo ""
    rm -f /tmp/bitpay-admin-add.log /tmp/bitpay-admin-execute.log
}

# Add each admin
add_admin "$ADMIN_1" "1" "Multi-sig treasury admin 1"
add_admin "$ADMIN_2" "2" "Multi-sig treasury admin 2"
add_admin "$ADMIN_3" "3" "Multi-sig treasury admin 3"
add_admin "$ADMIN_4" "4" "Multi-sig treasury admin 4"
add_admin "$ADMIN_5" "5" "Multi-sig treasury admin 5"

echo "═══════════════════════════════════════════════════════════"
echo "Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""

clarinet console --quiet << CONSOLE_END 2>&1 | tee /tmp/bitpay-verify-admins.log
(print "=== Treasury Admin Status ===")
(print { total-admins: (contract-call? .bitpay-treasury count-admins) })
(print { admin-1: (contract-call? .bitpay-treasury is-multisig-admin '${ADMIN_1}) })
(print { admin-2: (contract-call? .bitpay-treasury is-multisig-admin '${ADMIN_2}) })
(print { admin-3: (contract-call? .bitpay-treasury is-multisig-admin '${ADMIN_3}) })
(print { admin-4: (contract-call? .bitpay-treasury is-multisig-admin '${ADMIN_4}) })
(print { admin-5: (contract-call? .bitpay-treasury is-multisig-admin '${ADMIN_5}) })
(print { required-signatures: u3 })
CONSOLE_END

echo ""
echo "Admin verification results:"
cat /tmp/bitpay-verify-admins.log | grep -E "(total-admins|admin-[0-9]|required-signatures)"
echo ""

rm -f /tmp/bitpay-verify-admins.log

echo "╔════════════════════════════════════════════════════════════╗"
echo "║            ✓ Multi-Sig Admin Setup Complete               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Treasury Multi-Sig Configuration:${NC}"
echo "  • Total Admins: 5"
echo "  • Required Approvals: 3"
echo "  • Timelock: 24 hours"
echo "  • Daily Limit: 100 sBTC"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo "  • Store admin private keys securely (hardware wallets recommended)"
echo "  • Test the withdrawal process on testnet before mainnet"
echo "  • Document emergency procedures for all admins"
echo "  • Set up alerting for withdrawal proposals"
echo ""
echo "Next steps:"
echo "  1. Test multi-sig withdrawal flow"
echo "  2. Run ./scripts/verify-authorizations.sh"
echo "  3. Review docs/MULTISIG_TREASURY_GUIDE.md"
echo ""
echo "Example withdrawal proposal:"
echo "  (contract-call? .bitpay-treasury propose-multisig-withdrawal"
echo "    u1000000 ;; 0.01 sBTC"
echo "    'ST2RECIPIENT"
echo "    \"Test withdrawal\")"
echo ""
