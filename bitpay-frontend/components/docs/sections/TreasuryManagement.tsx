"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Vault, Users, Vote, TrendingUp } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

export function TreasuryManagement() {
  return (
    <DocsSection
      title="Treasury Management"
      description="Decentralized governance and fee management"
      badge="Governance"
    >
      <SubSection title="Overview">
        <InfoCard title="Multi-Signature Treasury System" variant="teal">
          <p className="text-foreground leading-relaxed mb-4">
            BitPay implements a decentralized treasury system for managing protocol
            fees and funding development. The treasury is controlled by multiple
            admins through a proposal-based voting mechanism.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-muted p-3 rounded-lg text-center">
              <Vault className="h-6 w-6 text-brand-teal mx-auto mb-2" />
              <div className="font-semibold text-sm">Secure Vault</div>
              <div className="text-xs text-muted-foreground">
                Multi-sig protection
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <Users className="h-6 w-6 text-brand-teal mx-auto mb-2" />
              <div className="font-semibold text-sm">Admin Council</div>
              <div className="text-xs text-muted-foreground">
                Multiple administrators
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <Vote className="h-6 w-6 text-brand-teal mx-auto mb-2" />
              <div className="font-semibold text-sm">Proposal Voting</div>
              <div className="text-xs text-muted-foreground">
                Democratic decisions
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Fee Structure">
        <InfoCard title="Protocol Fees" variant="pink">
          <p className="text-sm text-foreground mb-4">
            BitPay collects minimal fees to ensure sustainable development and
            protocol maintenance:
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-brand-pink pl-4">
              <h4 className="font-semibold mb-1">Cancellation Fee: 1%</h4>
              <p className="text-sm text-muted-foreground">
                When a sender cancels a stream, 1% of the unvested amount is sent to
                the treasury. This fee discourages frivolous cancellations while
                maintaining flexibility.
              </p>
              <div className="mt-2 bg-muted p-2 rounded text-xs">
                <strong>Example:</strong> Stream with 1,000,000 sats, 50% vested. Upon
                cancellation: 500,000 unvested × 1% = 5,000 sats to treasury.
              </div>
            </div>

            <div className="border-l-4 border-brand-teal pl-4">
              <h4 className="font-semibold mb-1">
                Future: Optional Stream Creation Fee
              </h4>
              <p className="text-sm text-muted-foreground">
                Post-audit, a very small fee (0.1% - 0.5%) may be applied on stream
                creation. This would be governed by the admin council.
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="Fee Philosophy" variant="info">
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              <strong>Non-Extractive:</strong> Fees are designed to be minimal and
              serve the protocol, not extract value from users.
            </p>
            <p className="text-foreground">
              <strong>Sustainable:</strong> Revenue funds ongoing development,
              security audits, and ecosystem grants.
            </p>
            <p className="text-foreground">
              <strong>Transparent:</strong> All fee collection and spending is
              on-chain and publicly auditable.
            </p>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Governance Model">
        <InfoCard title="Admin Council & Proposals" variant="teal">
          <p className="text-sm text-muted-foreground mb-4">
            The treasury is governed by an admin council. Any admin can create
            proposals for treasury withdrawals, which must be approved by a majority
            of admins.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Proposal Lifecycle</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </span>
                  <div className="text-sm">
                    <strong>Creation:</strong> Admin creates proposal with recipient,
                    amount, and description
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </span>
                  <div className="text-sm">
                    <strong>Voting:</strong> All admins can vote for or against the
                    proposal
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </span>
                  <div className="text-sm">
                    <strong>Threshold:</strong> Proposal requires majority approval
                    (votes-for {">"} votes-against)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-brand-teal text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    4
                  </span>
                  <div className="text-sm">
                    <strong>Execution:</strong> Any admin can execute approved
                    proposal, funds are released
                  </div>
                </div>
              </div>
            </div>

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

;; Track individual admin votes
(define-map proposal-votes
    { proposal-id: uint, admin: principal }
    { vote: bool } ;; true = for, false = against
)

;; Create a new proposal
(define-public (create-proposal
        (recipient principal)
        (amount uint)
        (description (string-ascii 256))
    )
    (let ((proposal-id (var-get next-proposal-id)))
        (begin
            ;; Only admins can create proposals
            (try! (contract-call? .bitpay-access-control assert-is-admin))

            ;; Ensure treasury has sufficient funds
            (asserts! (<= amount (get-treasury-balance)) ERR_INSUFFICIENT_FUNDS)

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

            (print {
                event: "proposal-created",
                proposal-id: proposal-id,
                proposer: tx-sender,
                amount: amount,
            })

            (ok proposal-id)
        )
    )
)`}
            />
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Voting Mechanism">
        <InfoCard title="How Admins Vote" variant="pink">
          <CodeBlock
            language="clarity"
            title="bitpay-treasury.clar - Voting Functions"
            code={`;; Vote on a proposal
(define-public (vote-on-proposal
        (proposal-id uint)
        (vote bool) ;; true = for, false = against
    )
    (let (
            (proposal (unwrap! (map-get? proposals proposal-id) ERR_PROPOSAL_NOT_FOUND))
        )
        (begin
            ;; Only admins can vote
            (try! (contract-call? .bitpay-access-control assert-is-admin))

            ;; Can't vote on executed proposals
            (asserts! (not (get executed proposal)) ERR_PROPOSAL_EXECUTED)

            ;; Record vote
            (map-set proposal-votes
                { proposal-id: proposal-id, admin: tx-sender }
                { vote: vote }
            )

            ;; Update vote counts
            (if vote
                (map-set proposals proposal-id
                    (merge proposal { votes-for: (+ (get votes-for proposal) u1) })
                )
                (map-set proposals proposal-id
                    (merge proposal { votes-against: (+ (get votes-against proposal) u1) })
                )
            )

            (print {
                event: "vote-cast",
                proposal-id: proposal-id,
                admin: tx-sender,
                vote: vote,
            })

            (ok true)
        )
    )
)

;; Execute an approved proposal
(define-public (execute-proposal (proposal-id uint))
    (let (
            (proposal (unwrap! (map-get? proposals proposal-id) ERR_PROPOSAL_NOT_FOUND))
            (admin-count (contract-call? .bitpay-access-control get-admin-count))
        )
        (begin
            ;; Only admins can execute
            (try! (contract-call? .bitpay-access-control assert-is-admin))

            ;; Check not already executed
            (asserts! (not (get executed proposal)) ERR_PROPOSAL_EXECUTED)

            ;; Check majority approval
            (asserts! (> (get votes-for proposal) (get votes-against proposal))
                ERR_PROPOSAL_NOT_APPROVED
            )

            ;; Transfer funds to recipient
            (try! (contract-call? .bitpay-sbtc-helper transfer-from-treasury
                (get amount proposal)
                (get recipient proposal)
            ))

            ;; Mark as executed
            (map-set proposals proposal-id
                (merge proposal { executed: true })
            )

            (print {
                event: "proposal-executed",
                proposal-id: proposal-id,
                recipient: (get recipient proposal),
                amount: (get amount proposal),
            })

            (ok true)
        )
    )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="Treasury Use Cases">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Development Funding" variant="success">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  <strong>Core Development:</strong> Funding ongoing protocol
                  development, bug fixes, and new features.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Smart contract upgrades</li>
                  <li>• Frontend improvements</li>
                  <li>• Infrastructure costs</li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Security Audits" variant="warning">
            <div className="flex items-start gap-3">
              <Vault className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  <strong>Professional Audits:</strong> Funding comprehensive security
                  audits by reputable firms.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Smart contract audits</li>
                  <li>• Penetration testing</li>
                  <li>• Bug bounty programs</li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Ecosystem Grants" variant="info">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  <strong>Community Building:</strong> Grants for developers building
                  on BitPay.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• SDK development</li>
                  <li>• Integration tools</li>
                  <li>• Educational content</li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Marketing & Growth" variant="pink">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  <strong>Protocol Growth:</strong> Funding marketing, partnerships,
                  and user acquisition.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Conference sponsorships</li>
                  <li>• Partnership programs</li>
                  <li>• Community events</li>
                </ul>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Admin Management">
        <InfoCard title="Access Control" variant="teal">
          <p className="text-sm text-muted-foreground mb-3">
            The admin council can be updated through the access control contract.
            Adding or removing admins also requires proposal approval:
          </p>
          <CodeBlock
            language="clarity"
            title="bitpay-access-control.clar - Admin Management"
            code={`;; Admin list
(define-map admins principal bool)

;; Check if address is admin
(define-read-only (is-admin (address principal))
    (default-to false (map-get? admins address))
)

;; Assert caller is admin (throws error if not)
(define-public (assert-is-admin)
    (ok (asserts! (is-admin tx-sender) ERR_UNAUTHORIZED))
)

;; Add new admin (requires multi-sig through treasury proposal)
(define-public (add-admin (new-admin principal))
    (begin
        ;; Must be called by contract owner or through proposal
        (try! (assert-is-owner-or-treasury))

        (map-set admins new-admin true)
        (var-set admin-count (+ (var-get admin-count) u1))

        (print { event: "admin-added", admin: new-admin })
        (ok true)
    )
)

;; Remove admin (requires multi-sig through treasury proposal)
(define-public (remove-admin (admin principal))
    (begin
        (try! (assert-is-owner-or-treasury))

        (map-delete admins admin)
        (var-set admin-count (- (var-get admin-count) u1))

        (print { event: "admin-removed", admin: admin })
        (ok true)
    )
)`}
          />
        </InfoCard>
      </SubSection>

      <SubSection title="Treasury Transparency">
        <InfoCard title="Public Auditability" variant="success">
          <p className="text-sm text-foreground mb-4">
            All treasury operations are fully transparent and auditable on the
            blockchain:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-foreground">
                <strong>Real-time Balance:</strong> Treasury balance is publicly
                readable at any time
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-foreground">
                <strong>Proposal History:</strong> All proposals are stored on-chain
                with full details
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-foreground">
                <strong>Vote Records:</strong> Every admin vote is recorded and
                traceable
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-foreground">
                <strong>Execution Events:</strong> All fund movements emit events for
                indexing
              </span>
            </div>
          </div>

          <div className="mt-4 bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Anyone can query the treasury contract to view
              current balance, active proposals, and historical transactions. This
              ensures complete transparency and accountability.
            </p>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Future: DAO Transition">
        <InfoCard title="Decentralization Roadmap" variant="pink">
          <p className="text-sm text-foreground leading-relaxed mb-3">
            The current multi-sig admin model is designed as a temporary bootstrap
            mechanism. The long-term vision is to transition to a fully decentralized
            DAO (Decentralized Autonomous Organization).
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-brand-pink pl-4">
              <h4 className="font-semibold text-sm mb-1">Phase 1: Admin Council</h4>
              <p className="text-xs text-muted-foreground">
                Current state. Small group of trusted admins manage treasury through
                proposals.
              </p>
            </div>
            <div className="border-l-4 border-brand-teal pl-4">
              <h4 className="font-semibold text-sm mb-1">
                Phase 2: Token Governance
              </h4>
              <p className="text-xs text-muted-foreground">
                Introduce governance token. Token holders vote on proposals weighted
                by holdings.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-sm mb-1">Phase 3: Full DAO</h4>
              <p className="text-xs text-muted-foreground">
                Complete decentralization. Community governs protocol upgrades,
                treasury spending, and fee parameters.
              </p>
            </div>
          </div>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
