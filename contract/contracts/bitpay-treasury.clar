;; bitpay-treasury
;; Treasury contract for fee collection and management

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u500))
(define-constant ERR_INSUFFICIENT_BALANCE (err u501))
(define-constant ERR_INVALID_AMOUNT (err u502))
(define-constant ERR_PAUSED (err u503))

;; Fee percentage (basis points: 100 = 1%, 50 = 0.5%)
(define-constant DEFAULT_FEE_BPS u50) ;; 0.5% fee

;; Data vars
(define-data-var treasury-balance uint u0)
(define-data-var fee-bps uint DEFAULT_FEE_BPS)
(define-data-var total-fees-collected uint u0)
(define-data-var admin principal CONTRACT_OWNER)

;; Maps
(define-map fee-recipients principal uint)

;; Authorization check
(define-private (is-admin)
    (is-eq tx-sender (var-get admin))
)

;; Check if protocol is paused via access-control
(define-private (check-not-paused)
    (let ((paused-check (contract-call? .bitpay-access-control is-paused)))
        (asserts! (not paused-check) ERR_PAUSED)
        (ok true)
    )
)

;; Calculate fee amount based on basis points
(define-read-only (calculate-fee (amount uint))
    (let ((fee (/ (* amount (var-get fee-bps)) u10000)))
        (ok fee)
    )
)

;; Collect fee from a stream (called by bitpay-core)
(define-public (collect-fee (amount uint))
    (begin
        (try! (check-not-paused))
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)

        (let ((fee (unwrap-panic (calculate-fee amount))))
            ;; Transfer fee from sender to treasury
            (try! (contract-call? .bitpay-sbtc-helper transfer-to-vault fee tx-sender))

            ;; Update treasury balance
            (var-set treasury-balance (+ (var-get treasury-balance) fee))
            (var-set total-fees-collected (+ (var-get total-fees-collected) fee))

            (ok fee)
        )
    )
)

;; Withdraw from treasury (admin only)
(define-public (withdraw (amount uint) (recipient principal))
    (begin
        (asserts! (is-admin) ERR_UNAUTHORIZED)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        (asserts! (<= amount (var-get treasury-balance)) ERR_INSUFFICIENT_BALANCE)

        ;; Transfer from treasury to recipient
        (try! (as-contract (contract-call? .bitpay-sbtc-helper transfer-from-vault amount recipient)))

        ;; Update treasury balance
        (var-set treasury-balance (- (var-get treasury-balance) amount))

        (ok amount)
    )
)

;; Distribute fees to recipients
(define-public (distribute-to-recipient (recipient principal) (amount uint))
    (begin
        (asserts! (is-admin) ERR_UNAUTHORIZED)
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        (asserts! (<= amount (var-get treasury-balance)) ERR_INSUFFICIENT_BALANCE)

        ;; Transfer to recipient
        (try! (as-contract (contract-call? .bitpay-sbtc-helper transfer-from-vault amount recipient)))

        ;; Update balances
        (var-set treasury-balance (- (var-get treasury-balance) amount))
        (map-set fee-recipients recipient
            (+ (default-to u0 (map-get? fee-recipients recipient)) amount)
        )

        (ok amount)
    )
)

;; Update fee percentage (admin only)
(define-public (set-fee-bps (new-fee-bps uint))
    (begin
        (asserts! (is-admin) ERR_UNAUTHORIZED)
        (asserts! (<= new-fee-bps u1000) ERR_INVALID_AMOUNT) ;; Max 10% fee

        (var-set fee-bps new-fee-bps)
        (ok new-fee-bps)
    )
)

;; Transfer admin role
(define-public (transfer-admin (new-admin principal))
    (begin
        (asserts! (is-admin) ERR_UNAUTHORIZED)
        (var-set admin new-admin)
        (ok new-admin)
    )
)

;; Read-only functions

(define-read-only (get-treasury-balance)
    (ok (var-get treasury-balance))
)

(define-read-only (get-fee-bps)
    (ok (var-get fee-bps))
)

(define-read-only (get-total-fees-collected)
    (ok (var-get total-fees-collected))
)

(define-read-only (get-admin)
    (ok (var-get admin))
)

(define-read-only (get-recipient-total (recipient principal))
    (ok (default-to u0 (map-get? fee-recipients recipient)))
)

;; Calculate net amount after fee deduction
(define-read-only (get-amount-after-fee (gross-amount uint))
    (let ((fee (unwrap-panic (calculate-fee gross-amount))))
        (ok (- gross-amount fee))
    )
)
