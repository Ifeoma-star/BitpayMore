;; bitpay-core
;; Core streaming payment protocol for BitPay
;; Handles stream creation, vesting calculation, withdrawals, and cancellations

;; Error codes
(define-constant ERR_UNAUTHORIZED (err u300))
(define-constant ERR_STREAM_NOT_FOUND (err u301))
(define-constant ERR_INVALID_AMOUNT (err u302))
(define-constant ERR_INVALID_DURATION (err u303))
(define-constant ERR_STREAM_ALREADY_CANCELLED (err u304))
(define-constant ERR_NOTHING_TO_WITHDRAW (err u305))
(define-constant ERR_INVALID_RECIPIENT (err u306))
(define-constant ERR_START_BLOCK_IN_PAST (err u307))

;; Minimum stream duration (10 blocks ~100 minutes on Bitcoin)
(define-constant MIN_STREAM_DURATION u10)

;; data vars
;;

;; Counter for stream IDs
(define-data-var next-stream-id uint u1)

;; data maps
;;

;; Stream data structure
(define-map streams
    uint ;; stream-id
    {
        sender: principal,
        recipient: principal,
        amount: uint,
        start-block: uint,
        end-block: uint,
        withdrawn: uint,
        cancelled: bool,
        cancelled-at-block: (optional uint),
    }
)

;; Track user's created streams
(define-map sender-streams
    principal ;; sender
    (list 200 uint) ;; list of stream-ids
)

;; Track user's received streams
(define-map recipient-streams
    principal ;; recipient
    (list 200 uint) ;; list of stream-ids
)

;; public functions
;;

;; Create a new payment stream
;; @param recipient: Principal receiving the stream
;; @param amount: Total amount of sBTC to stream (in sats)
;; @param start-block: Block height when streaming starts
;; @param end-block: Block height when streaming ends
;; @returns: (ok stream-id) on success
(define-public (create-stream
        (recipient principal)
        (amount uint)
        (start-block uint)
        (end-block uint)
    )
    (let (
            (stream-id (var-get next-stream-id))
            (duration (- end-block start-block))
        )
        (begin
            ;; Check protocol not paused
            (try! (contract-call? .bitpay-access-control assert-not-paused))

            ;; Validate inputs
            (asserts! (> amount u0) ERR_INVALID_AMOUNT)
            (asserts! (not (is-eq recipient tx-sender)) ERR_INVALID_RECIPIENT)
            (asserts! (>= start-block stacks-block-height)
                ERR_START_BLOCK_IN_PAST
            )
            (asserts! (>= duration MIN_STREAM_DURATION) ERR_INVALID_DURATION)

            ;; Transfer sBTC to vault
            (try! (contract-call? .bitpay-sbtc-helper transfer-to-vault amount
                tx-sender
            ))

            ;; Create stream record
            (map-set streams stream-id {
                sender: tx-sender,
                recipient: recipient,
                amount: amount,
                start-block: start-block,
                end-block: end-block,
                withdrawn: u0,
                cancelled: false,
                cancelled-at-block: none,
            })

            ;; Update sender's stream list
            (map-set sender-streams tx-sender
                (unwrap-panic (as-max-len? (append (get-sender-streams tx-sender) stream-id)
                    u200
                ))
            )

            ;; Update recipient's stream list
            (map-set recipient-streams recipient
                (unwrap-panic (as-max-len? (append (get-recipient-streams recipient) stream-id)
                    u200
                ))
            )

            ;; Increment stream ID counter
            (var-set next-stream-id (+ stream-id u1))

            (print {
                event: "stream-created",
                stream-id: stream-id,
                sender: tx-sender,
                recipient: recipient,
                amount: amount,
                start-block: start-block,
                end-block: end-block,
            })

            (ok stream-id)
        )
    )
)

;; Withdraw vested amount from a stream
;; @param stream-id: ID of the stream to withdraw from
;; @returns: (ok withdrawn-amount) on success
(define-public (withdraw-from-stream (stream-id uint))
    (let (
            (stream (unwrap! (map-get? streams stream-id) ERR_STREAM_NOT_FOUND))
            (available (try! (get-withdrawable-amount stream-id)))
        )
        (begin
            ;; Only recipient can withdraw
            (asserts! (is-eq tx-sender (get recipient stream)) ERR_UNAUTHORIZED)

            ;; Check there's something to withdraw
            (asserts! (> available u0) ERR_NOTHING_TO_WITHDRAW)

            ;; Transfer from vault to recipient
            (try! (contract-call? .bitpay-sbtc-helper transfer-from-vault available
                tx-sender
            ))

            ;; Update withdrawn amount
            (map-set streams stream-id
                (merge stream { withdrawn: (+ (get withdrawn stream) available) })
            )

            (print {
                event: "stream-withdrawal",
                stream-id: stream-id,
                recipient: tx-sender,
                amount: available,
            })

            (ok available)
        )
    )
)

;; Cancel a stream and return unvested funds to sender
;; @param stream-id: ID of the stream to cancel
;; @returns: (ok true) on success
(define-public (cancel-stream (stream-id uint))
    (let (
            (stream (unwrap! (map-get? streams stream-id) ERR_STREAM_NOT_FOUND))
            (vested (get-vested-amount-at-block stream-id stacks-block-height))
            (already-withdrawn (get withdrawn stream))
            (unvested (- (get amount stream) vested))
            (owed-to-recipient (- vested already-withdrawn))
        )
        (begin
            ;; Only sender can cancel
            (asserts! (is-eq tx-sender (get sender stream)) ERR_UNAUTHORIZED)

            ;; Check not already cancelled
            (asserts! (not (get cancelled stream)) ERR_STREAM_ALREADY_CANCELLED)

            ;; Transfer unvested back to sender
            (if (> unvested u0)
                (try! (contract-call? .bitpay-sbtc-helper transfer-from-vault unvested
                    tx-sender
                ))
                true
            )

            ;; Transfer owed amount to recipient
            (if (> owed-to-recipient u0)
                (try! (contract-call? .bitpay-sbtc-helper transfer-from-vault
                    owed-to-recipient (get recipient stream)
                ))
                true
            )

            ;; Mark stream as cancelled
            (map-set streams stream-id
                (merge stream {
                    cancelled: true,
                    cancelled-at-block: (some stacks-block-height),
                    withdrawn: (get amount stream), ;; Mark all as withdrawn
                })
            )

            (print {
                event: "stream-cancelled",
                stream-id: stream-id,
                sender: tx-sender,
                unvested-returned: unvested,
                vested-paid: owed-to-recipient,
                cancelled-at-block: stacks-block-height,
            })

            (ok true)
        )
    )
)

;; read only functions
;;

;; Get stream details
;; @param stream-id: ID of the stream
;; @returns: Optional stream data
(define-read-only (get-stream (stream-id uint))
    (map-get? streams stream-id)
)

;; Get list of streams created by a sender
;; @param sender: Principal address
;; @returns: List of stream IDs
(define-read-only (get-sender-streams (sender principal))
    (default-to (list) (map-get? sender-streams sender))
)

;; Get list of streams received by a recipient
;; @param recipient: Principal address
;; @returns: List of stream IDs
(define-read-only (get-recipient-streams (recipient principal))
    (default-to (list) (map-get? recipient-streams recipient))
)

;; Calculate vested amount at a specific block
;; @param stream-id: ID of the stream
;; @param block-height-value: Block height to calculate vesting at
;; @returns: Vested amount in sats
(define-read-only (get-vested-amount-at-block
        (stream-id uint)
        (block-height-value uint)
    )
    (match (map-get? streams stream-id)
        stream
        (let (
                (start (get start-block stream))
                (end (get end-block stream))
                (amount (get amount stream))
                (duration (- end start))
            )
            ;; Before start: nothing vested
            (if (< block-height-value start)
                u0
                ;; After end or cancelled: everything vested
                (if (or (>= block-height-value end) (get cancelled stream))
                    amount
                    ;; During stream: linear vesting
                    (let ((elapsed (- block-height-value start)))
                        (/ (* amount elapsed) duration)
                    )
                )
            )
        )
        u0 ;; Stream not found
    )
)

;; Get currently vested amount
;; @param stream-id: ID of the stream
;; @returns: Vested amount at current block
(define-read-only (get-vested-amount (stream-id uint))
    (get-vested-amount-at-block stream-id stacks-block-height)
)

;; Get amount available to withdraw
;; @param stream-id: ID of the stream
;; @returns: (ok available-amount) or error
(define-read-only (get-withdrawable-amount (stream-id uint))
    (match (map-get? streams stream-id)
        stream (let (
                (vested (get-vested-amount-at-block stream-id stacks-block-height))
                (withdrawn (get withdrawn stream))
            )
            (ok (- vested withdrawn))
        )
        ERR_STREAM_NOT_FOUND
    )
)

;; Get next stream ID that will be assigned
;; @returns: Next stream ID
(define-read-only (get-next-stream-id)
    (var-get next-stream-id)
)

;; Check if stream is active (not cancelled and not ended)
;; @param stream-id: ID of the stream
;; @returns: true if active, false otherwise
(define-read-only (is-stream-active (stream-id uint))
    (match (map-get? streams stream-id)
        stream (and
            (not (get cancelled stream))
            (< stacks-block-height (get end-block stream))
        )
        false
    )
)

;; private functions
;;
