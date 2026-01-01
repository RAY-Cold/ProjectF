'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, TrendingUp, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">About Fortify DeFi</h2>
          <p className="text-muted-foreground mb-4">
            Fortify DeFi is a unified, risk-aware DeFi protocol that combines yield vaults, 
            lending, and on-chain insurance into a single platform. Our core innovation is a 
            shared Risk Engine that dynamically influences pricing and strategy across all modules.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-card rounded-lg border border-border">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-2">Risk Engine</h3>
              <p className="text-sm text-muted-foreground">
                Calculates risk scores (0-100) based on protocol age, TVL volatility, 
                audit status, exploit history, and liquidity depth.
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-2">Yield Vaults</h3>
              <p className="text-sm text-muted-foreground">
                Users deposit funds into vaults with optional insurance. Risk score 
                influences APY and premium rates.
              </p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <Lock className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-2">Insurance & DAO</h3>
              <p className="text-sm text-muted-foreground">
                Users can purchase coverage for vault positions. Claims require DAO voting 
                for approval and payout.
              </p>
            </div>
          </div>

          <div className="p-6 bg-muted rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Risk Engine Flow</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Risk Engine calculates scores for users, vaults, and protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Scores influence insurance premiums (higher risk = higher premium)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Scores influence lending interest rates (higher risk = lower rates)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Scores determine vault strategy safety tiers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>All components share the same risk model for consistency</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Demo Script for Judges</h2>
          <Accordion title="Step 1: Connect Wallet & View Dashboard">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click "Connect Wallet" in the header</li>
              <li>View your Risk Profile on the dashboard</li>
              <li>Notice the Risk Score gauge and breakdown</li>
              <li>Check the "Next Best Action" panel for recommendations</li>
            </ol>
          </Accordion>

          <Accordion title="Step 2: Explore Vaults">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Navigate to the Vaults page</li>
              <li>Use filters to explore different risk tiers</li>
              <li>Click on a vault to view details</li>
              <li>Notice the difference between insured and uninsured APY</li>
              <li>Try depositing into a vault (demo mode)</li>
            </ol>
          </Accordion>

          <Accordion title="Step 3: Purchase Insurance">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to the Insurance page</li>
              <li>Click "Purchase Coverage"</li>
              <li>See how risk score affects premium calculation</li>
              <li>Complete the purchase flow</li>
            </ol>
          </Accordion>

          <Accordion title="Step 4: Simulate Loss Event (Demo Mode)">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Enable Demo Mode toggle in the header</li>
              <li>Go to Vaults page and select a vault</li>
              <li>Click "Simulate Loss Event" (admin control)</li>
              <li>Return to Insurance page to see the claim option</li>
            </ol>
          </Accordion>

          <Accordion title="Step 5: Submit & Vote on Claim">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Submit a claim with evidence</li>
              <li>Go to Governance page</li>
              <li>See the claim in the voting queue</li>
              <li>Vote Approve or Reject</li>
              <li>In Demo Mode, use "Fast-forward" to approve claim</li>
              <li>Return to Insurance page to see payout</li>
            </ol>
          </Accordion>

          <Accordion title="Step 6: Explore Risk Analytics">
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Navigate to Risk Analytics page</li>
              <li>View Risk Score Breakdown</li>
              <li>Check Risk Heatmap showing vaults vs risk tiers</li>
              <li>Review TVL and Claims charts</li>
              <li>Examine Risk Engine Output table</li>
            </ol>
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Disclaimers</h2>
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Hackathon MVP</p>
                <p className="text-muted-foreground">
                  This is a demonstration prototype built for hackathon purposes. 
                  All transactions, claims, and events are simulated. No real funds 
                  are at risk.
                </p>
                <p className="text-muted-foreground">
                  The Risk Engine, insurance calculations, and DAO governance are 
                  simplified for demo purposes. A production version would require 
                  extensive security audits, economic modeling, and legal review.
                </p>
                <p className="text-muted-foreground">
                  Mock data is used throughout the application. Connect a wallet to 
                  see personalized data, but all interactions are simulated.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
