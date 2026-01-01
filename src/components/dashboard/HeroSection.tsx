'use client';

import { Shield, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-12 mb-8">
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Fortify DeFi
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
            Risk-aware DeFi with built-in insurance. Unified protocol combining yield vaults, 
            lending, and on-chain insurance powered by a shared risk engine.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <div className="font-semibold">Yield Vaults</div>
              <div className="text-sm text-muted-foreground">Insured & Uninsured</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border">
            <Lock className="w-6 h-6 text-primary" />
            <div>
              <div className="font-semibold">On-chain Insurance</div>
              <div className="text-sm text-muted-foreground">DAO-governed Claims</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <div className="font-semibold">Risk Engine</div>
              <div className="text-sm text-muted-foreground">Dynamic Pricing</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

