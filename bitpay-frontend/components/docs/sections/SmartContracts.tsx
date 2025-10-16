"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Code2, FileCode, Shield, Zap } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function SmartContracts() {
  return (
    <DocsSection
      title="Smart Contracts"
      description="Deep dive into BitPay's Clarity smart contract architecture"
      badge="Technical"
    >
      <SubSection title="Contract Overview">
        <p className="text-foreground leading-relaxed mb-6">
          BitPay consists of seven Clarity smart contracts that work together
          to enable secure, decentralized streaming payments on Bitcoin:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="bitpay-core" variant="pink">
            <div className="flex items-start gap-3 mb-3">
              <Code2 className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  The heart of BitPay. Handles stream creation, vesting
                  calculations, withdrawals, and cancellations.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• create-stream</div>
              <div>• withdraw-from-stream</div>
              <div>• cancel-stream</div>
              <div>• get-withdrawable-amount</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-treasury" variant="teal">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  Multi-signature treasury for protocol fee management and
                  decentralized governance.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• create-proposal</div>
              <div>• vote-on-proposal</div>
              <div>• execute-proposal</div>
              <div>• deposit-fees</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-marketplace" variant="info">
            <div className="flex items-start gap-3 mb-3">
              <FileCode className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  NFT marketplace for trading stream obligation NFTs,
                  creating secondary markets for future cash flows.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• list-obligation-nft</div>
              <div>• buy-obligation-nft</div>
              <div>• cancel-listing</div>
              <div>• update-listing-price</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-nft" variant="success">
            <div className="flex items-start gap-3 mb-3">
              <Zap className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  SIP-009 compliant NFT for recipient claim rights. Soul-bound
                  (non-transferable) to protect recipients.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• mint (internal only)</div>
              <div>• get-owner</div>
              <div>• get-token-uri</div>
              <div>• get-last-token-id</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-obligation-nft" variant="warning">
            <div className="flex items-start gap-3 mb-3">
              <FileCode className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  SIP-009 compliant NFT for sender payment obligations.
                  Transferable and tradeable on the marketplace.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• mint (internal only)</div>
              <div>• transfer</div>
              <div>• get-owner</div>
              <div>• get-last-token-id</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-sbtc-helper" variant="pink">
            <div className="flex items-start gap-3 mb-3">
              <Code2 className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  Helper contract for sBTC operations. Handles transfers to/from
                  vault and treasury.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• transfer-to-vault</div>
              <div>• transfer-from-vault</div>
              <div>• transfer-to-treasury</div>
              <div>• get-vault-balance</div>
            </div>
          </InfoCard>

          <InfoCard title="bitpay-access-control" variant="teal">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  Admin and permission management. Controls protocol pause state
                  and admin list for governance.
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 mt-3 pt-3 border-t">
              <div>• add-admin</div>
              <div>• remove-admin</div>
              <div>• set-paused</div>
              <div>• is-admin</div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="bitpay-core: Core Contract">
        <InfoCard title="Stream Data Structure" variant="pink">
          <p className="text-sm text-muted-foreground mb-3">
            Each stream is stored as a map entry with the following structure:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-core.clar - Stream Data Map"
            code={`;; Stream data structure
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
)`}
          />
        </InfoCard>

        <InfoCard title="Creating a Stream" variant="teal">
          <p className="text-sm text-muted-foreground mb-3">
            The create-stream function locks sBTC in the vault and creates a new
            stream record:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-core.clar - create-stream"
            code={`;; Create a new payment stream
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

            ;; Update tracking lists
            (map-set sender-streams tx-sender
                (unwrap-panic (as-max-len?
                    (append (get-sender-streams tx-sender) stream-id) u200))
            )

            (map-set recipient-streams recipient
                (unwrap-panic (as-max-len?
                    (append (get-recipient-streams recipient) stream-id) u200))
            )

            ;; Mint NFTs for both parties
            (try! (contract-call? .bitpay-nft mint stream-id recipient))
            (try! (contract-call? .bitpay-obligation-nft mint stream-id tx-sender))

            (ok stream-id)
        )
    )
)`}
          />
        </InfoCard>

        <InfoCard title="Vesting Calculation: The Core Algorithm" variant="info">
          <p className="text-sm text-muted-foreground mb-3">
            The heart of BitPay is the linear vesting calculation. This pure
            function determines how much has vested at any given block:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-core.clar - calculate-vested-amount"
            code={`;; Calculate vested amount for a stream
;; Uses linear vesting: (elapsed / duration) * total
;; @param stream-id: ID of the stream
;; @returns: (ok vested-amount) on success
(define-read-only (calculate-vested-amount (stream-id uint))
    (let (
            (stream (unwrap! (map-get? streams stream-id) ERR_STREAM_NOT_FOUND))
            (current-block stacks-block-height)
        )
        (if (get cancelled stream)
            ;; If cancelled, vesting stopped at cancellation block
            (let (
                    (cancel-block (unwrap-panic (get cancelled-at-block stream)))
                )
                (if (<= cancel-block (get start-block stream))
                    (ok u0)
                    (if (>= cancel-block (get end-block stream))
                        (ok (get amount stream))
                        (ok (/
                            (* (get amount stream)
                               (- cancel-block (get start-block stream)))
                            (- (get end-block stream) (get start-block stream))
                        ))
                    )
                )
            )
            ;; Active stream - calculate current vesting
            (if (<= current-block (get start-block stream))
                (ok u0) ;; Stream hasn't started
                (if (>= current-block (get end-block stream))
                    (ok (get amount stream)) ;; Stream fully vested
                    ;; Linear vesting formula
                    (ok (/
                        (* (get amount stream)
                           (- current-block (get start-block stream)))
                        (- (get end-block stream) (get start-block stream))
                    ))
                )
            )
        )
    )
)

;; Get withdrawable amount (vested - already withdrawn)
(define-read-only (get-withdrawable-amount (stream-id uint))
    (let (
            (stream (unwrap! (map-get? streams stream-id) ERR_STREAM_NOT_FOUND))
            (vested (try! (calculate-vested-amount stream-id)))
        )
        (ok (- vested (get withdrawn stream)))
    )
)`}
          />
          <InfoCard title="Why This Algorithm Works" variant="success">
            <div className="text-sm space-y-2">
              <p className="text-foreground">
                The linear vesting formula is elegant and gas-efficient:
              </p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>
                  • <strong className="text-foreground">Deterministic:</strong>{" "}
                  Same inputs always produce same output
                </li>
                <li>
                  • <strong className="text-foreground">Off-chain compatible:</strong>{" "}
                  Can be calculated in frontend for instant feedback
                </li>
                <li>
                  • <strong className="text-foreground">No loops:</strong> O(1)
                  complexity regardless of stream duration
                </li>
                <li>
                  • <strong className="text-foreground">Safe math:</strong> Clarity
                  prevents overflow/underflow automatically
                </li>
              </ul>
            </div>
          </InfoCard>
        </InfoCard>

        <InfoCard title="Withdrawing from a Stream" variant="teal">
          <CodeBlock
            language="clarity"
            title="bitpay-core.clar - withdraw-from-stream"
            code={`;; Withdraw vested amount from a stream
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
            (try! (contract-call? .bitpay-sbtc-helper transfer-from-vault
                available tx-sender
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
)`}
          />
        </InfoCard>

        <InfoCard title="Cancelling a Stream" variant="warning">
          <p className="text-sm text-muted-foreground mb-3">
            Senders can cancel streams, but recipients keep all vested funds. A
            small cancellation fee (1%) is charged on the unvested amount:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-core.clar - cancel-stream"
            code={`;; Cancel a stream (sender only)
;; Recipient keeps vested amount, sender gets unvested minus fee
;; @param stream-id: ID of the stream to cancel
;; @returns: (ok refund-amount) on success
(define-public (cancel-stream (stream-id uint))
    (let (
            (stream (unwrap! (map-get? streams stream-id) ERR_STREAM_NOT_FOUND))
            (vested (try! (calculate-vested-amount stream-id)))
            (withdrawn (get withdrawn stream))
            (unvested (- (get amount stream) vested))
            ;; 1% cancellation fee on unvested amount
            (cancellation-fee (/ (* unvested CANCELLATION_FEE_BPS) u10000))
            (refund (- unvested cancellation-fee))
        )
        (begin
            ;; Only sender can cancel
            (asserts! (is-eq tx-sender (get sender stream)) ERR_UNAUTHORIZED)
            (asserts! (not (get cancelled stream)) ERR_STREAM_ALREADY_CANCELLED)

            ;; Mark as cancelled
            (map-set streams stream-id
                (merge stream {
                    cancelled: true,
                    cancelled-at-block: (some stacks-block-height),
                })
            )

            ;; Send cancellation fee to treasury
            (if (> cancellation-fee u0)
                (try! (contract-call? .bitpay-treasury deposit-fees cancellation-fee))
                true
            )

            ;; Refund unvested amount minus fee to sender
            (if (> refund u0)
                (try! (contract-call? .bitpay-sbtc-helper transfer-from-vault
                    refund tx-sender
                ))
                true
            )

            (print {
                event: "stream-cancelled",
                stream-id: stream-id,
                sender: tx-sender,
                vested: vested,
                refunded: refund,
                fee: cancellation-fee,
            })

            (ok refund)
        )
    )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="bitpay-treasury: Governance Contract">
        <InfoCard title="Multi-Signature Treasury Management" variant="teal">
          <p className="text-sm text-muted-foreground mb-3">
            The treasury contract implements a proposal-based governance system for
            managing protocol fees:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-treasury.clar - Proposal Structure"
            code={`;; Proposal data structure
(define-map proposals
    uint ;; proposal-id
    {
        proposer: principal,
        recipient: principal,
        amount: uint,
        description: (string-ascii 256),
        created-at: uint,
        executed: bool,
        votes-for: uint,
        votes-against: uint,
    }
)

;; Admin voting
(define-map proposal-votes
    { proposal-id: uint, admin: principal }
    { vote: bool } ;; true = for, false = against
)

;; Create a withdrawal proposal
(define-public (create-proposal
        (recipient principal)
        (amount uint)
        (description (string-ascii 256))
    )
    (let ((proposal-id (var-get next-proposal-id)))
        (begin
            ;; Only admins can create proposals
            (try! (contract-call? .bitpay-access-control assert-is-admin))

            (map-set proposals proposal-id {
                proposer: tx-sender,
                recipient: recipient,
                amount: amount,
                description: description,
                created-at: stacks-block-height,
                executed: false,
                votes-for: u0,
                votes-against: u0,
            })

            (var-set next-proposal-id (+ proposal-id u1))
            (ok proposal-id)
        )
    )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="bitpay-marketplace: NFT Trading">
        <InfoCard title="Stream NFT Marketplace" variant="info">
          <p className="text-sm text-muted-foreground mb-3">
            The marketplace enables trading of stream obligation NFTs, creating
            secondary markets for future cash flows:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-marketplace.clar - Listing & Trading"
            code={`;; Listing data structure
(define-map listings
    uint ;; nft-id (stream-id)
    {
        seller: principal,
        price: uint,
        listed-at: uint,
    }
)

;; List an obligation NFT for sale
(define-public (list-obligation-nft
        (stream-id uint)
        (price uint)
    )
    (begin
        ;; Verify ownership
        (asserts! (is-eq (some tx-sender)
            (contract-call? .bitpay-obligation-nft get-owner stream-id))
            ERR_NOT_OWNER
        )

        (map-set listings stream-id {
            seller: tx-sender,
            price: price,
            listed-at: stacks-block-height,
        })

        (ok true)
    )
)

;; Buy a listed obligation NFT
(define-public (buy-obligation-nft (stream-id uint))
    (let (
            (listing (unwrap! (map-get? listings stream-id) ERR_NOT_LISTED))
        )
        (begin
            ;; Transfer payment to seller
            (try! (contract-call? .bitpay-sbtc-helper transfer-sbtc
                (get price listing)
                tx-sender
                (get seller listing)
            ))

            ;; Transfer NFT to buyer
            (try! (contract-call? .bitpay-obligation-nft transfer
                stream-id
                (get seller listing)
                tx-sender
            ))

            ;; Remove listing
            (map-delete listings stream-id)

            (ok true)
        )
    )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="Security Features">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Access Control" variant="warning">
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>
                  Only recipients can withdraw from streams they receive
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Only senders can cancel streams they created</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Only admins can create treasury proposals</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Emergency pause mechanism for critical vulnerabilities</span>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Safe Math" variant="success">
            <p className="text-sm text-foreground mb-3">
              Clarity provides automatic overflow/underflow protection:
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>All arithmetic operations are checked</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Division by zero returns error</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>No silent failures or unexpected behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Decidable: Can prove behavior before execution</span>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Testing & Verification">
        <InfoCard title="Comprehensive Test Suite" variant="info">
          <p className="text-sm text-muted-foreground mb-3">
            All contracts are tested with Clarinet's testing framework:
          </p>
          <CodeBlock
            language="typescript"
            title="bitpay-core.test.ts"
            code={`import { describe, expect, it } from "vitest";

describe("bitpay-core", () => {
  it("creates a stream successfully", () => {
    const { result } = simnet.callPublicFn(
      "bitpay-core",
      "create-stream",
      [Cl.principal(recipient), Cl.uint(1000000), Cl.uint(100), Cl.uint(500)],
      sender
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("calculates vested amount correctly", () => {
    // Create stream: 1000 sats over 100 blocks
    simnet.callPublicFn("bitpay-core", "create-stream",
      [Cl.principal(recipient), Cl.uint(1000), Cl.uint(100), Cl.uint(200)],
      sender
    );

    // Mine 50 blocks (halfway through)
    simnet.mineEmptyBlocks(50);

    // Should be 50% vested = 500 sats
    const vested = simnet.callReadOnlyFn(
      "bitpay-core",
      "calculate-vested-amount",
      [Cl.uint(1)],
      sender
    );
    expect(vested.result).toBeOk(Cl.uint(500));
  });
});`}
          />
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
