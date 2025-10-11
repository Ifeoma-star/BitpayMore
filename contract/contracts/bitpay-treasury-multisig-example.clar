;; bitpay-treasury with built-in multi-sig
;; Example of how to add multi-sig directly to treasury

;; Multi-sig configuration
(define-data-var required-signatures uint u2) ;; Need 2 approvals
(define-data-var total-admins uint u3)        ;; Out of 3 admins

;; Admin list
(define-map admins principal bool)

;; Initialize 3 admins (you control 2, trusted partner controls 1)
(map-set admins 'SP1YOUR-LAPTOP-KEY... true)
(map-set admins 'SP2YOUR-HARDWARE-WALLET... true)
(map-set admins 'SP3TRUSTED-PARTNER... true)

;; Withdrawal proposals
(define-map withdrawal-proposals
    uint ;; proposal-id
    {
        proposer: principal,
        amount: uint,
        recipient: principal,
        approvals: (list 10 principal),
        executed: bool,
        proposed-at: uint
    }
)

(define-data-var next-proposal-id uint u0)

;; Step 1: Propose withdrawal (any admin)
(define-public (propose-withdrawal
    (amount uint)
    (recipient principal))
    (let (
        (proposal-id (var-get next-proposal-id))
    )
        ;; Only admins can propose
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        (asserts! (<= amount treasury-balance) ERR_INSUFFICIENT_BALANCE)

        ;; Create proposal
        (map-set withdrawal-proposals proposal-id {
            proposer: tx-sender,
            amount: amount,
            recipient: recipient,
            approvals: (list tx-sender), ;; Proposer auto-approves
            executed: false,
            proposed-at: stacks-block-height
        })

        (var-set next-proposal-id (+ proposal-id u1))

        (print {
            event: "withdrawal-proposed",
            proposal-id: proposal-id,
            amount: amount,
            recipient: recipient,
            proposer: tx-sender
        })

        (ok proposal-id)
    )
)

;; Step 2: Approve withdrawal (other admins)
(define-public (approve-withdrawal (proposal-id uint))
    (let (
        (proposal (unwrap! (map-get? withdrawal-proposals proposal-id) ERR_NOT_FOUND))
        (current-approvals (get approvals proposal))
    )
        ;; Only admins can approve
        (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED)

        ;; Can't approve own proposal again
        (asserts! (not (is-in-list tx-sender current-approvals)) ERR_ALREADY_APPROVED)

        ;; Can't approve executed proposal
        (asserts! (not (get executed proposal)) ERR_ALREADY_EXECUTED)

        ;; Add approval
        (map-set withdrawal-proposals proposal-id
            (merge proposal {
                approvals: (unwrap!
                    (as-max-len? (append current-approvals tx-sender) u10)
                    ERR_LIST_FULL)
            })
        )

        (print {
            event: "withdrawal-approved",
            proposal-id: proposal-id,
            approver: tx-sender,
            total-approvals: (+ (len current-approvals) u1)
        })

        (ok true)
    )
)

;; Step 3: Execute withdrawal (once enough approvals)
(define-public (execute-withdrawal (proposal-id uint))
    (let (
        (proposal (unwrap! (map-get? withdrawal-proposals proposal-id) ERR_NOT_FOUND))
        (approval-count (len (get approvals proposal)))
    )
        ;; Check requirements
        (asserts! (not (get executed proposal)) ERR_ALREADY_EXECUTED)
        (asserts! (>= approval-count (var-get required-signatures)) ERR_INSUFFICIENT_APPROVALS)

        ;; Execute withdrawal
        (try! (as-contract (contract-call? .bitpay-sbtc-helper
            transfer-from-vault
            (get amount proposal)
            (get recipient proposal)
        )))

        ;; Mark as executed
        (map-set withdrawal-proposals proposal-id
            (merge proposal { executed: true })
        )

        ;; Update treasury balance
        (var-set treasury-balance (- (var-get treasury-balance) (get amount proposal)))

        (print {
            event: "withdrawal-executed",
            proposal-id: proposal-id,
            amount: (get amount proposal),
            recipient: (get recipient proposal)
        })

        (ok true)
    )
)

;; Helper: Check if principal is in list
(define-private (is-in-list (item principal) (lst (list 10 principal)))
    (is-some (index-of lst item))
)

;; Helper: Check if admin
(define-read-only (is-admin (user principal))
    (default-to false (map-get? admins user))
)

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_INVALID_AMOUNT (err u401))
(define-constant ERR_INSUFFICIENT_BALANCE (err u402))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_APPROVED (err u405))
(define-constant ERR_ALREADY_EXECUTED (err u406))
(define-constant ERR_INSUFFICIENT_APPROVALS (err u407))
(define-constant ERR_LIST_FULL (err u408))

;; Placeholder for treasury balance
(define-data-var treasury-balance uint u0)
