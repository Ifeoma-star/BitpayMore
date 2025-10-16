"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Rocket,
  Box,
  Code2,
  Waves,
  ShoppingBag,
  Vault,
  FileCode,
  Shield,
  HelpCircle,
  MessageCircle
} from "lucide-react";

interface DocsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Sparkles,
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Box,
  },
  {
    id: 'smart-contracts',
    title: 'Smart Contracts',
    icon: Code2,
  },
  {
    id: 'streaming-payments',
    title: 'Streaming Payments',
    icon: Waves,
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    icon: ShoppingBag,
  },
  {
    id: 'treasury-management',
    title: 'Treasury Management',
    icon: Vault,
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: FileCode,
  },
  {
    id: 'security-best-practices',
    title: 'Security & Best Practices',
    icon: Shield,
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
  },
  {
    id: 'contact-support',
    title: 'Contact & Support',
    icon: MessageCircle,
  },
];

export function DocsNavigation({ activeSection, onSectionChange }: DocsNavigationProps) {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-4">
        <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Documentation
        </h2>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto py-2 px-3 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90 text-white"
                    : "hover:bg-muted"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-left">{item.title}</span>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
