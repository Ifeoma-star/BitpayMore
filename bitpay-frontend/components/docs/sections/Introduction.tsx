"use client";

import { DocsSection, SubSection, InfoCard } from "../DocsSection";
import { Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Introduction() {
  return (
    <DocsSection
      title="Introduction"
      description="Welcome to BitPay - Bitcoin Streaming & Vesting Vaults"
      badge="v1.0"
    >
      <SubSection title="Project Name & Tagline">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-brand-pink" />
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">
              BitPay
            </h3>
            <p className="text-muted-foreground">
              Bitcoin Streaming & Vesting Vaults, Powered by sBTC
            </p>
          </div>
        </div>
      </SubSection>

      <SubSection title="Vision Statement">
        <InfoCard title="Our Mission" variant="pink">
          <p className="text-foreground leading-relaxed">
            To become the foundational primitive for programmable cash flows on
            Bitcoin, enabling a new era of Bitcoin-native payroll, vesting,
            subscriptions, and continuous finance.
          </p>
        </InfoCard>
      </SubSection>

      <SubSection title="Elevator Pitch">
        <p className="text-foreground leading-relaxed">
          BitPay allows users to lock sBTC in a smart contract to create
          continuous, non-stop streams of money to any recipient. It brings the
          powerful concept of money streams (e.g., Sablier) to Bitcoin for the
          first time, leveraging the revolutionary sBTC primitive to ensure
          settlements are native, secure, and trust-minimized.
        </p>
      </SubSection>

      <SubSection title='The Core Concept: "Netflix for Money"'>
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            You know how on Netflix, you pay a monthly fee and you can watch as
            many shows as you want until the next month? The shows just "stream"
            to you.
          </p>
          <p className="text-foreground leading-relaxed">
            Now, imagine instead of streaming shows, you could stream money.
          </p>
          <InfoCard title="The Magic of Money Streams" variant="teal">
            <p className="text-foreground leading-relaxed mb-3">
              What if you could send your friend $100, but instead of it arriving
              all at once, it drips to them $1 every hour for 100 hours? Or what
              if a Bitcoin company wanted to pay its employees their salary every
              single second instead of just once a month?
            </p>
            <p className="text-foreground leading-relaxed font-medium">
              That's what BitPay does. It's an app that lets you create continuous
              streams of money.
            </p>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="How It Works: The Simple Version">
        <InfoCard title="Think of BitPay like a super-secure, programmable vending machine for cash" variant="info">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-brand-pink text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">You Put Money In</h4>
                <p className="text-sm text-muted-foreground">
                  You tell the app, "I want to send $100 to my friend Alex over
                  the next 100 hours."
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-brand-pink text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">The Machine Locks It Up</h4>
                <p className="text-sm text-muted-foreground">
                  The app takes your $100 and locks it in a super-secure digital
                  vault (this is the smart contract).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-brand-teal text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Money Drips Out</h4>
                <p className="text-sm text-muted-foreground">
                  The vault is programmed to let Alex take out exactly $1 for
                  every hour that passes. He can withdraw his $1 anytime he wants.
                  After 50 hours, he can take out $50. After 100 hours, he can
                  take it all.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-brand-teal text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">You're in Control</h4>
                <p className="text-sm text-muted-foreground">
                  If you change your mind after 50 hours, you can cancel it. The
                  vault will let Alex keep the $50 he already earned, and it will
                  give you back the remaining $50.
                </p>
              </div>
            </div>
          </div>
        </InfoCard>
      </SubSection>

      <SubSection title="Why This is a Big Deal and Why BitPay Wins">
        <p className="text-foreground leading-relaxed mb-6">
          This project isn't just a cool idea; it's perfectly built to unlock the
          Bitcoin economy. Here's why:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Built on Bitcoin's Superpowers" variant="pink">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  This isn't using a random cryptocurrency. It's built on Stacks,
                  which gives it the security and power of Bitcoin. It uses sBTC,
                  which is like a special version of Bitcoin that can be used for
                  these clever apps.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Solves Real Problems" variant="teal">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-brand-teal flex-shrink-0 mt-1" />
              <div>
                <ul className="text-sm space-y-2 text-foreground">
                  <li>
                    <strong>For Gamers & Creators:</strong> Get paid by fans for
                    every minute you're live streaming
                  </li>
                  <li>
                    <strong>For Startups:</strong> Pay employees with a live
                    stream of salary
                  </li>
                  <li>
                    <strong>For Everyone:</strong> Makes sending money more
                    flexible and modern
                  </li>
                </ul>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="AI-Powered Development" variant="info">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  Built using cutting-edge AI tools like Claude and Cursor,
                  demonstrating "vibe coding" - using AI as a powerful tool while
                  developers remain in control of security and architecture.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Great User Experience" variant="success">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  The idea is super easy to understand. Visual, exciting, and
                  doesn't need a complicated explanation. Anyone can immediately
                  "get it."
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </SubSection>

      <SubSection title="The Bottom Line">
        <InfoCard title="Why BitPay Wins" variant="pink">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-brand-pink">✓</span>
              <span className="text-foreground">
                <strong>Cool Idea:</strong> It's "Netflix for Money" – easy to
                understand and exciting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-pink">✓</span>
              <span className="text-foreground">
                <strong>Technical Skills:</strong> Uses advanced Bitcoin technology
                (sBTC, Clarity smart contracts)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-pink">✓</span>
              <span className="text-foreground">
                <strong>Uses AI Right:</strong> Demonstrates "vibe coding"
                perfectly
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-pink">✓</span>
              <span className="text-foreground">
                <strong>Perfect Fit:</strong> Aligns perfectly with making Bitcoin
                more useful
              </span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-foreground font-medium text-center">
              It's not just another app; it's a glimpse into the future of how we
              could all use money, built on the most secure network in the world.
            </p>
          </div>
        </InfoCard>

        <div className="flex gap-4 mt-6">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
              Get Started
            </Button>
          </Link>
          <Link href="/explorer" className="flex-1">
            <Button variant="outline" className="w-full">
              Explore Streams
            </Button>
          </Link>
        </div>
      </SubSection>
    </DocsSection>
  );
}
