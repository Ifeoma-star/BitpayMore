"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocsNavigation } from "@/components/docs/DocsNavigation";
import { Introduction } from "@/components/docs/sections/Introduction";
import { GettingStarted } from "@/components/docs/sections/GettingStarted";
import { Architecture } from "@/components/docs/sections/Architecture";
import { SmartContracts } from "@/components/docs/sections/SmartContracts";
import { StreamingPayments } from "@/components/docs/sections/StreamingPayments";
import { Marketplace } from "@/components/docs/sections/Marketplace";
import { TreasuryManagement } from "@/components/docs/sections/TreasuryManagement";
import { ApiReference } from "@/components/docs/sections/ApiReference";
import { SecurityBestPractices } from "@/components/docs/sections/SecurityBestPractices";
import { FAQ } from "@/components/docs/sections/FAQ";
import { ContactSupport } from "@/components/docs/sections/ContactSupport";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');

  const renderSection = () => {
    switch (activeSection) {
      case 'introduction':
        return <Introduction />;
      case 'getting-started':
        return <GettingStarted />;
      case 'architecture':
        return <Architecture />;
      case 'smart-contracts':
        return <SmartContracts />;
      case 'streaming-payments':
        return <StreamingPayments />;
      case 'marketplace':
        return <Marketplace />;
      case 'treasury-management':
        return <TreasuryManagement />;
      case 'api-reference':
        return <ApiReference />;
      case 'security-best-practices':
        return <SecurityBestPractices />;
      case 'faq':
        return <FAQ />;
      case 'contact-support':
        return <ContactSupport />;
      default:
        return <Introduction />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-pink via-brand-teal to-brand-pink bg-clip-text text-transparent">
            BitPay Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bitcoin Streaming & Vesting Vaults - The Netflix for Money
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-64 flex-shrink-0"
          >
            <DocsNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {renderSection()}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
