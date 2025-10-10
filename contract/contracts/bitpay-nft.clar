;; bitpay-nft
;; Stream NFT - Tokenizes payment streams following SIP-009 NFT standard

;; Implement SIP-009 NFT trait
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token stream-nft uint)

;; Data vars
(define-data-var last-token-id uint u0)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u400))
(define-constant ERR_NOT_TOKEN_OWNER (err u401))
(define-constant ERR_TOKEN_NOT_FOUND (err u402))
(define-constant ERR_UNAUTHORIZED (err u403))

;; Map token ID to stream ID
(define-map token-to-stream uint uint)

;; Map stream ID to token ID
(define-map stream-to-token uint uint)

;; SIP-009 required functions

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok none)
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? stream-nft token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
        (nft-transfer? stream-nft token-id sender recipient)
    )
)

;; Custom functions for stream NFT integration

;; Mint NFT for a stream (called by bitpay-core)
(define-public (mint (stream-id uint) (recipient principal))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? stream-nft token-id recipient))
        (var-set last-token-id token-id)
        (map-set token-to-stream token-id stream-id)
        (map-set stream-to-token stream-id token-id)
        (ok token-id)
    )
)

;; Burn NFT when stream is fully withdrawn or cancelled
(define-public (burn (token-id uint) (owner principal))
    (begin
        (asserts! (is-eq (some tx-sender) (nft-get-owner? stream-nft token-id)) ERR_NOT_TOKEN_OWNER)
        (map-delete token-to-stream token-id)
        (match (map-get? token-to-stream token-id)
            stream-id (map-delete stream-to-token stream-id)
            true
        )
        (nft-burn? stream-nft token-id owner)
    )
)

;; Get stream ID from token ID
(define-read-only (get-stream-id (token-id uint))
    (ok (map-get? token-to-stream token-id))
)

;; Get token ID from stream ID
(define-read-only (get-token-id (stream-id uint))
    (ok (map-get? stream-to-token stream-id))
)
