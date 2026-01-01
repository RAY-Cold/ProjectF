'use client';

import { useDemoStore } from '@/store/demoStore';
import { Toggle } from '@/components/shared/Toggle';

export function DemoModeToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Demo Mode</span>
      <Toggle checked={isDemoMode} onCheckedChange={toggleDemoMode} />
    </div>
  );
}

