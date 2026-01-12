// src/app/lending/page.tsx
import LendingMarketTable from "@/components/lending/LendingMarketTable";

export default function LendingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lending</h1>
        <p className="text-white/60 text-sm">
          Supply, borrow, repay, and withdraw — with risk-based interest powered by the Risk Engine.
        </p>
      </div>
      <LendingMarketTable />
    </div>
  );
}