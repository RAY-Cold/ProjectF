'use client';

import { Info, Shield, Users, Vote } from 'lucide-react';

export function DAOExplanation() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Info className="w-5 h-5" />
        What the DAO Controls
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="font-medium mb-1">Claim Approvals</div>
            <div className="text-muted-foreground">
              DAO members vote on insurance claims. Claims require quorum and majority approval to be paid out.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Vote className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="font-medium mb-1">Parameter Governance</div>
            <div className="text-muted-foreground">
              Risk model parameters, premium curves, and protocol settings can be adjusted through DAO proposals.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="font-medium mb-1">Emergency Controls</div>
            <div className="text-muted-foreground">
              In extreme circumstances, the DAO can pause protocol operations or adjust emergency parameters.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

