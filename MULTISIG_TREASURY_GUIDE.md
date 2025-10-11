# 🏦 Multi-Sig Treasury Setup & User Guide

## Professional-Grade Security Implementation

Your BitPay treasury now has **institutional-grade multi-signature** protection with:
- ✅ **3-of-5 Multi-Sig** (requires 3 admin approvals)
- ✅ **24-Hour Timelock** (can't execute instantly after proposal)
- ✅ **7-Day Proposal Expiry** (proposals auto-expire)
- ✅ **100 sBTC Daily Limit** (prevents massive single-day withdrawals)
- ✅ **Full Audit Trail** (all actions logged on-chain)
- ✅ **Admin Rotation** (add/remove admins via multi-sig)

---

## 📋 Configuration

### Current Settings (Hardcoded in Contract)

```clarity
REQUIRED_SIGNATURES: 3        // Need 3 approvals out of 5 admins
TOTAL_ADMIN_SLOTS: 5          // Maximum 5 admins
TIMELOCK_BLOCKS: 144          // ~24 hours (10-minute blocks)
PROPOSAL_EXPIRY_BLOCKS: 1008  // ~7 days
DAILY_WITHDRAWAL_LIMIT: 100 sBTC // Maximum per day
```

### What This Means:
- **No single person** can withdraw funds alone
- **No instant withdrawals** - must wait 24 hours minimum
- **No unlimited withdrawals** - max 100 sBTC per day
- **Proposals expire** - can't sit indefinitely

---

## 🚀 Initial Setup (After Deployment)

### Step 1: Add Your Admin Wallets

When you deploy, only **CONTRACT_OWNER** (the deployer) is an admin.

You need to add 4 more admins to reach the 3-of-5 configuration:

```clarity
;; Option A: During deployment, manually add in contract initialization
(map-set multisig-admins 'SP1YOUR-LAPTOP-WALLET... true)
(map-set multisig-admins 'SP2YOUR-LEDGER-WALLET... true)
(map-set multisig-admins 'SP3COFOUNDER-WALLET... true)
(map-set multisig-admins 'SP4CFO-WALLET... true)
(map-set multisig-admins 'SP5BOARD-MEMBER-WALLET... true)
```

```clarity
;; Option B: After deployment, use propose-add-admin (requires existing admins to approve)
;; This is the secure way to add admins post-deployment
```

### Step 2: Verify Admin List

Check who's an admin:

```clarity
(contract-call? .bitpay-treasury is-multisig-admin-check 'SP1WALLET...)
// Returns: (ok true) if admin, (ok false) if not
```

### Step 3: Test with Small Withdrawal

Before storing large amounts, test the system:
1. Propose 1 sBTC withdrawal
2. Get 2 other admins to approve
3. Wait 24 hours
4. Execute
5. Verify funds transferred correctly

---

## 💰 How to Withdraw Funds (Complete Workflow)

### Example: Withdraw 50 sBTC for Company Payroll

#### **Monday 9:00 AM - Admin #1 Proposes**

```clarity
(contract-call? .bitpay-treasury propose-multisig-withdrawal
  u50000000  // 50 sBTC (in microunits)
  'SP1COMPANY-PAYROLL-WALLET...
  "March 2024 payroll - 5 employees")

// Returns: (ok u0)  // Proposal ID #0
```

**Status After:**
- ✅ Proposal #0 created
- ✅ 1/3 approvals (Admin #1 auto-approved)
- ❌ Can't execute yet (need 2 more approvals)

#### **Monday 2:00 PM - Admin #2 Reviews & Approves**

```clarity
// First, review the proposal
(contract-call? .bitpay-treasury get-withdrawal-proposal u0)

// Returns:
// (ok (some {
//   proposer: SP1ADMIN1...,
//   amount: u50000000,
//   recipient: SP1COMPANY-PAYROLL...,
//   approvals: [SP1ADMIN1...],
//   executed: false,
//   proposed-at: u12345,
//   expires-at: u13353,
//   description: "March 2024 payroll - 5 employees"
// }))

// Looks good! Approve it
(contract-call? .bitpay-treasury approve-multisig-withdrawal u0)

// Returns: (ok true)
```

**Status After:**
- ✅ 2/3 approvals (Admin #1 + Admin #2)
- ❌ Can't execute yet (need 1 more approval)

#### **Monday 5:00 PM - Admin #3 Approves**

```clarity
(contract-call? .bitpay-treasury approve-multisig-withdrawal u0)

// Returns: (ok true)
```

**Status After:**
- ✅ 3/3 approvals! ✅
- ❌ Can't execute yet (timelock: must wait until Tuesday 9:00 AM)

#### **Tuesday 9:30 AM - Anyone Executes (24 hours elapsed)**

```clarity
(contract-call? .bitpay-treasury execute-multisig-withdrawal u0)

// Returns: (ok true)
// 💰 50 sBTC transferred to payroll wallet!
```

**Status After:**
- ✅ Executed!
- ✅ Proposal marked as completed
- ✅ Treasury balance decreased by 50 sBTC
- ✅ Daily withdrawal limit: 50/100 sBTC used

---

## 👥 How to Add/Remove Admins

### Add a New Admin (e.g., New CFO)

#### Step 1: Propose

```clarity
(contract-call? .bitpay-treasury propose-add-admin 'SP6NEW-CFO...)

// Returns: (ok u1)  // Admin proposal ID #1
```

#### Step 2: Get 2 More Approvals

```clarity
// Admin #2 approves
(contract-call? .bitpay-treasury approve-admin-proposal u1)

// Admin #3 approves
(contract-call? .bitpay-treasury approve-admin-proposal u1)
```

#### Step 3: Execute (No Timelock for Admin Changes!)

```clarity
(contract-call? .bitpay-treasury execute-admin-proposal u1)

// Returns: (ok true)
// ✅ New CFO is now an admin!
```

### Remove an Admin (e.g., Employee Leaves)

#### Step 1: Propose Removal

```clarity
(contract-call? .bitpay-treasury propose-remove-admin 'SP4OLD-CFO...)

// Returns: (ok u2)  // Admin proposal ID #2
```

#### Step 2: Get Approvals & Execute

```clarity
// 2 other admins approve
(contract-call? .bitpay-treasury approve-admin-proposal u2)
(contract-call? .bitpay-treasury approve-admin-proposal u2)

// Execute removal
(contract-call? .bitpay-treasury execute-admin-proposal u2)

// ✅ Old CFO removed!
```

**Security Note:** You **cannot remove yourself** - prevents accidental lockout.

---

## 🔒 Security Features Explained

### 1. **3-of-5 Multi-Sig**

**Prevents:**
- Single key compromise
- Rogue admin
- Accidental loss of keys

**Scenario:** Your laptop gets hacked
- Hacker has: 1/5 keys
- Hacker needs: 3/5 keys to withdraw
- **Result:** ❌ Funds safe, hacker blocked
- **Action:** Use your 2 other keys + 2 co-admins to remove compromised key

### 2. **24-Hour Timelock**

**Prevents:**
- Flash attacks
- Panicked decisions
- Social engineering

**Scenario:** Hacker gets 3 admin keys via phishing
- Hacker proposes withdrawal at 12:00 PM Monday
- Gets 3 approvals by 1:00 PM Monday
- **Timelock:** Can't execute until 12:00 PM Tuesday
- **You Notice:** At 6:00 PM Monday, check proposals, see suspicious withdrawal
- **You Block:** Get 3 honest admins to propose emergency pause or remove compromised keys
- **Result:** ✅ Funds saved!

### 3. **7-Day Proposal Expiry**

**Prevents:**
- Old proposals being executed later
- Forgotten proposals
- Stale approvals

**Scenario:** Proposal from 2 weeks ago
- Original purpose no longer valid
- **Result:** ❌ Can't execute (expired)
- **Action:** Create new proposal if still needed

### 4. **100 sBTC Daily Limit**

**Prevents:**
- Catastrophic single-day loss
- Limits damage from compromise

**Scenario:** Attacker somehow gets through multi-sig
- Executes withdrawal: 100 sBTC at 9:00 AM
- Tries again: ❌ Blocked (daily limit reached)
- **You Notice:** By evening, detect suspicious activity
- **You Act:** Emergency pause, investigate, rotate keys
- **Result:** Lost 100 sBTC instead of entire treasury

### 5. **Proposal Descriptions**

**Provides:**
- Clear audit trail
- Accountability
- Context for reviewers

**Example:**
```clarity
"March 2024 payroll - 5 employees"
"Marketing budget Q1 - Partnership with XYZ"
"Emergency bug bounty payout - Critical vulnerability"
```

Admins can review and understand purpose before approving.

---

## 📊 Query Functions (Read-Only)

### Check Proposal Status

```clarity
(contract-call? .bitpay-treasury get-withdrawal-proposal u0)
```

### Check Admin Status

```clarity
(contract-call? .bitpay-treasury is-multisig-admin-check 'SP1WALLET...)
```

### View Multi-Sig Configuration

```clarity
(contract-call? .bitpay-treasury get-multisig-config)

// Returns:
// (ok {
//   required-signatures: u3,
//   total-slots: u5,
//   timelock-blocks: u144,
//   proposal-expiry-blocks: u1008,
//   daily-limit: u100000000,
//   withdrawn-today: u50000000,  // Already withdrawn today
//   last-withdrawal-block: u12500
// })
```

### Get Next Proposal ID

```clarity
(contract-call? .bitpay-treasury get-next-proposal-id)

// Returns: (ok u3)  // Next proposal will be ID #3
```

---

## ⚠️ Common Mistakes & How to Avoid

### Mistake #1: Proposing Withdrawal > Daily Limit

```clarity
// ❌ BAD: Trying to withdraw 150 sBTC (exceeds 100 sBTC limit)
(contract-call? .bitpay-treasury propose-multisig-withdrawal
  u150000000 ...)

// ✅ GOOD: Split into two proposals
// Day 1: Withdraw 100 sBTC
// Day 2: Withdraw 50 sBTC
```

### Mistake #2: Forgetting Timelock

```clarity
// Proposed at block 10000
// Get 3 approvals by block 10005
// Try to execute at block 10010
// ❌ Error: Timelock not elapsed (need block 10144)

// ✅ Wait until block 10144 (~24 hours)
```

### Mistake #3: Letting Proposal Expire

```clarity
// Proposed at block 10000
// Expires at block 11008 (7 days later)
// Try to execute at block 11100
// ❌ Error: Proposal expired

// ✅ Create new proposal if still needed
```

### Mistake #4: Trying to Remove Yourself

```clarity
// ❌ BAD: Admin tries to remove their own key
(contract-call? .bitpay-treasury propose-remove-admin tx-sender)
// Error: Can't remove self

// ✅ GOOD: Another admin proposes your removal
```

---

## 🚨 Emergency Procedures

### If Admin Key is Compromised

1. **Immediately notify other admins** (off-chain communication)
2. **Propose removal** of compromised key:
   ```clarity
   (contract-call? .bitpay-treasury propose-remove-admin 'SP-COMPROMISED...)
   ```
3. **Get 2 other admins** to approve ASAP
4. **Execute removal**:
   ```clarity
   (contract-call? .bitpay-treasury execute-admin-proposal u[id])
   ```
5. **Add replacement key** using `propose-add-admin`

### If Suspicious Proposal Detected

1. **DO NOT APPROVE** the suspicious proposal
2. **Wait for expiry** (7 days maximum)
3. **Investigate** who proposed and why
4. **Consider removing** malicious admin
5. **Review** all other pending proposals

### If You Lose 2+ Keys

**CRITICAL:** With 3-of-5 config, losing 2 keys is still safe:
- You need 3 signatures
- You have 5 keys total
- Losing 2 leaves 3 remaining
- **Result:** ✅ Can still operate (barely)

**Action Plan:**
1. **Immediately add new admins** (before losing more keys)
2. **Use remaining 3 keys** to approve new admins
3. **Remove lost keys** once new ones added
4. **Update key storage procedures**

---

## 🎯 Best Practices

### Key Storage

1. **Admin #1 (Your Daily Laptop)**
   - Store in password manager
   - Use for regular proposals
   - Rotate every 6 months

2. **Admin #2 (Your Hardware Wallet)**
   - Ledger/Trezor
   - Use for approvals
   - Keep in safe location

3. **Admin #3 (Co-Founder)**
   - Their secure wallet
   - Independent key storage
   - Regular security audits

4. **Admin #4 (Company CFO/CTO)**
   - Corporate custody solution
   - Multi-person access
   - Documented procedures

5. **Admin #5 (Cold Storage Backup)**
   - Paper wallet in bank vault
   - Only for emergency recovery
   - Test annually

### Operational Procedures

1. **Regular Proposals**:
   - Always include clear descriptions
   - Get approval within 48 hours
   - Execute within 72 hours (before expiry worry)

2. **Large Withdrawals (>50 sBTC)**:
   - Announce 1 week ahead
   - Document business purpose
   - Get unanimous approval (5/5) for good practice

3. **Admin Rotation**:
   - Review admin list quarterly
   - Remove departing employees immediately
   - Add new admins with proper onboarding

4. **Security Reviews**:
   - Audit all proposals monthly
   - Check for unauthorized attempts
   - Verify all admins still have secure keys

---

## 📈 Monitoring & Analytics

### Events to Monitor

All multi-sig actions emit events you can track:

```clarity
// Withdrawal events
"withdrawal-proposed"
"withdrawal-approved"
"withdrawal-executed"

// Admin management events
"add-admin-proposed"
"remove-admin-proposed"
"admin-proposal-approved"
"admin-proposal-executed"
```

### Recommended Monitoring Setup

1. **Set up Chainhook** to listen for these events
2. **Send notifications** to admin Slack/Discord channel
3. **Log all proposals** to audit database
4. **Alert on suspicious activity**:
   - Multiple failed proposals
   - Proposals to unknown addresses
   - Large withdrawal attempts

---

## 🔧 Customization Options

If you want different settings, modify these constants before deployment:

```clarity
;; Want 2-of-3 instead of 3-of-5?
(define-constant REQUIRED_SIGNATURES u2)
(define-constant TOTAL_ADMIN_SLOTS u3)

;; Want 48-hour timelock instead of 24?
(define-constant TIMELOCK_BLOCKS u288)  // ~48 hours

;; Want 200 sBTC daily limit instead of 100?
(define-constant DAILY_WITHDRAWAL_LIMIT u200000000)
```

**⚠️ WARNING:** These are constants and **cannot be changed after deployment**!

Choose carefully based on your security requirements.

---

## ✅ Setup Checklist

Before going to production:

- [ ] Deploy treasury contract with multi-sig enabled
- [ ] Add all 5 admin wallets
- [ ] Verify each admin can check their status
- [ ] Test small withdrawal (1 sBTC)
  - [ ] Propose
  - [ ] Get 3 approvals
  - [ ] Wait 24 hours
  - [ ] Execute successfully
- [ ] Test admin addition
- [ ] Test admin removal
- [ ] Set up monitoring/alerts
- [ ] Document admin key storage locations
- [ ] Train all admins on procedures
- [ ] Create emergency contact list
- [ ] Schedule quarterly security reviews

---

## 🆘 Support & Questions

If you encounter issues:

1. **Check error code**: Each error returns a specific code (500-512)
2. **Review this guide**: Most issues covered above
3. **Check proposal status**: May be expired/already executed
4. **Verify admin status**: Ensure you're still an admin
5. **Check daily limit**: May have hit 100 sBTC cap

---

## 📚 Additional Resources

- **Clarity Language Docs**: https://docs.stacks.co/clarity
- **Multi-Sig Best Practices**: https://bitcoin.org/en/secure-your-wallet
- **Stacks Block Explorer**: Monitor your proposals on-chain

---

**Congratulations! Your treasury now has institutional-grade security. 🎉**

Remember: **With great power comes great responsibility** - protect those admin keys!
