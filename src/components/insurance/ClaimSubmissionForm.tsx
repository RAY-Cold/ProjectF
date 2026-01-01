'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { formatETH } from '@/lib/utils/formatters';
import { submitClaim } from '@/lib/api/insurance';
import { useAccount } from 'wagmi';
import { useToast } from '@/providers/ToastProvider';
import { FileText, Plus, X } from 'lucide-react';

interface ClaimSubmissionFormProps {
  policyId: string;
  maxClaimAmount: number;
  onSuccess?: () => void;
}

export function ClaimSubmissionForm({
  policyId,
  maxClaimAmount,
  onSuccess,
}: ClaimSubmissionFormProps) {
  const { address } = useAccount();
  const { addToast } = useToast();
  const [lossAmount, setLossAmount] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const addEvidenceField = () => {
    setEvidence([...evidence, '']);
  };

  const removeEvidenceField = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const updateEvidence = (index: number, value: string) => {
    const newEvidence = [...evidence];
    newEvidence[index] = value;
    setEvidence(newEvidence);
  };

  const handleSubmit = async () => {
    if (!address) {
      addToast('error', 'Please connect your wallet');
      return;
    }

    if (!lossAmount || parseFloat(lossAmount) <= 0) {
      addToast('error', 'Please enter a valid loss amount');
      return;
    }

    if (parseFloat(lossAmount) > maxClaimAmount) {
      addToast('error', `Maximum claim amount is ${formatETH(maxClaimAmount)}`);
      return;
    }

    if (!description.trim()) {
      addToast('error', 'Please provide a description');
      return;
    }

    const validEvidence = evidence.filter(e => e.trim());

    setSubmitting(true);
    try {
      const result = await submitClaim(
        policyId,
        parseFloat(lossAmount),
        description,
        validEvidence,
        address
      );
      addToast('success', `Claim submitted! Claim ID: ${result.claimId.slice(-8)}`);
      setLossAmount('');
      setDescription('');
      setEvidence(['']);
      onSuccess?.();
    } catch (error) {
      addToast('error', 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Loss Amount (ETH)</label>
        <input
          type="number"
          value={lossAmount}
          onChange={(e) => setLossAmount(e.target.value)}
          placeholder={`Max: ${formatETH(maxClaimAmount)}`}
          max={maxClaimAmount}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the loss event and circumstances..."
          rows={4}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Evidence (URLs or hashes)</label>
          <button
            onClick={addEvidenceField}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {evidence.map((ev, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={ev}
                onChange={(e) => updateEvidence(idx, e.target.value)}
                placeholder="https://etherscan.io/tx/... or IPFS hash"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {evidence.length > 1 && (
                <button
                  onClick={() => removeEvidenceField(idx)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        isLoading={submitting}
        disabled={!lossAmount || !description.trim()}
      >
        <FileText className="w-4 h-4 mr-2" />
        Submit Claim
      </Button>
    </div>
  );
}

