"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { MessageCircle, Mail, Github, Twitter, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSupport() {
  return (
    <DocsSection
      title="Contact & Support"
      description="Get help and connect with the BitPay community"
      badge="Support"
    >
      <SubSection title="Community Channels">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Discord Community" variant="pink">
            <div className="flex items-start gap-3 mb-4">
              <MessageCircle className="h-6 w-6 text-brand-pink flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  Join our Discord server for real-time support, community discussions,
                  and updates.
                </p>
                <p className="text-xs text-muted-foreground">
                  Active community • Quick responses • Technical help
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord
            </Button>
          </InfoCard>

          <InfoCard title="Twitter / X" variant="teal">
            <div className="flex items-start gap-3 mb-4">
              <Twitter className="h-6 w-6 text-brand-teal flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  Follow us on Twitter for the latest updates, announcements, and
                  ecosystem news.
                </p>
                <p className="text-xs text-muted-foreground">
                  @BitPayFinance • Daily updates • Community highlights
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Twitter className="mr-2 h-4 w-4" />
              Follow @BitPayFinance
            </Button>
          </InfoCard>

          <InfoCard title="GitHub" variant="info">
            <div className="flex items-start gap-3 mb-4">
              <Github className="h-6 w-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  Explore our open-source code, report issues, and contribute to the
                  project.
                </p>
                <p className="text-xs text-muted-foreground">
                  Open source • Bug reports • Feature requests
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </InfoCard>

          <InfoCard title="Telegram" variant="success">
            <div className="flex items-start gap-3 mb-4">
              <Users className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground mb-2">
                  Join our Telegram group for community discussions and support.
                </p>
                <p className="text-xs text-muted-foreground">
                  Global community • Multi-language support • Announcements
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Join Telegram
            </Button>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Direct Support">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Email Support" variant="pink">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">General Inquiries</h4>
                <a
                  href="mailto:support@bitpay.finance"
                  className="text-brand-pink hover:underline text-sm"
                >
                  support@bitpay.finance
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  General questions, account issues, feature requests
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Business & Partnerships</h4>
                <a
                  href="mailto:partnerships@bitpay.finance"
                  className="text-brand-pink hover:underline text-sm"
                >
                  partnerships@bitpay.finance
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Enterprise solutions, integrations, collaborations
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Security</h4>
                <a
                  href="mailto:security@bitpay.finance"
                  className="text-brand-pink hover:underline text-sm"
                >
                  security@bitpay.finance
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Security vulnerabilities, bug bounty reports
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Response Times" variant="info">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-foreground">Critical Issues</span>
                <span className="font-semibold text-brand-teal">{"<"} 2 hours</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-foreground">General Support</span>
                <span className="font-semibold text-brand-teal">{"<"} 24 hours</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-foreground">Feature Requests</span>
                <span className="font-semibold text-brand-teal">{"<"} 3 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground">Partnership Inquiries</span>
                <span className="font-semibold text-brand-teal">{"<"} 1 week</span>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Developer Resources">
        <InfoCard title="For Developers Building on BitPay" variant="teal">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-teal" />
                Documentation
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    Smart Contract Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    Integration Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    Code Examples
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Github className="h-4 w-4 text-brand-teal" />
                Developer Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    GitHub Discussions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    Discord #dev-support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-brand-pink hover:underline">
                    Stack Overflow
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:dev@bitpay.finance"
                    className="text-brand-pink hover:underline"
                  >
                    dev@bitpay.finance
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Bug Reports & Feature Requests">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Report a Bug" variant="warning">
            <p className="text-sm text-foreground mb-3">
              Found a bug? Help us improve BitPay by reporting it.
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">1.</span>
                <span className="text-foreground">
                  Check if it's already reported on GitHub Issues
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">2.</span>
                <span className="text-foreground">
                  Provide detailed steps to reproduce
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600">3.</span>
                <span className="text-foreground">
                  Include screenshots and error messages
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Report Bug
            </Button>
          </InfoCard>

          <InfoCard title="Request a Feature" variant="success">
            <p className="text-sm text-foreground mb-3">
              Have an idea to make BitPay better? We'd love to hear it!
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-start gap-2">
                <span className="text-green-600">1.</span>
                <span className="text-foreground">
                  Check existing feature requests first
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">2.</span>
                <span className="text-foreground">
                  Describe the problem it solves
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">3.</span>
                <span className="text-foreground">
                  Share your proposed solution
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Request Feature
            </Button>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="Office Hours & AMA">
        <InfoCard title="Community Events" variant="pink">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Weekly Office Hours</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Join our core team every Thursday at 3pm UTC for live Q&A, demos, and
                discussions.
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Next Session:</span>
                  <span className="font-semibold">Thursday, 3pm UTC</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-foreground">Platform:</span>
                  <span className="font-semibold">Discord Voice Channel</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Monthly AMA</h4>
              <p className="text-sm text-muted-foreground">
                First Tuesday of every month - Ask us anything about BitPay, roadmap,
                or the team.
              </p>
            </div>

            <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Next Office Hours
            </Button>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Status & Updates">
        <InfoCard title="System Status" variant="info">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-semibold">All Systems Operational</span>
              </div>
              <a href="#" className="text-xs text-brand-pink hover:underline">
                Status Page →
              </a>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">API</span>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">WebSocket</span>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Smart Contracts</span>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dashboard</span>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-semibold text-sm mb-2">Subscribe to Updates</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Legal & Compliance">
        <div className="grid md:grid-cols-3 gap-4">
          <InfoCard title="Legal" variant="info">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Compliance" variant="success">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Compliance Overview
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  AML Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  KYC Requirements
                </a>
              </li>
            </ul>
          </InfoCard>

          <InfoCard title="Brand Assets" variant="pink">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Logo & Brand Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Brand Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-brand-pink hover:underline">
                  Media Resources
                </a>
              </li>
            </ul>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="We're Here to Help">
        <InfoCard title="Get Started" variant="teal">
          <p className="text-foreground text-center mb-4">
            Whether you're new to BitPay or an experienced user, we're here to support
            your journey.
          </p>
          <div className="flex gap-3 justify-center">
            <Button className="bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat with Support
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </div>
        </InfoCard>
      </SubSection>
    </DocsSection>
  );
}
