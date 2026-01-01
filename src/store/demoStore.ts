import { create } from 'zustand';

interface DemoStore {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  simulatedEvents: string[];
  addSimulatedEvent: (event: string) => void;
  resetDemo: () => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemoMode: false,
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
  simulatedEvents: [],
  addSimulatedEvent: (event: string) =>
    set((state) => ({
      simulatedEvents: [...state.simulatedEvents, event],
    })),
  resetDemo: () => set({ simulatedEvents: [] }),
}));

