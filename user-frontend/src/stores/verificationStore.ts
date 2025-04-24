import { create } from 'zustand';

interface VerificationState {
  tempToken: string | null;
  setTempToken: (token: string) => void;
  clearTempToken: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  tempToken: null,
  setTempToken: (token) => set({ tempToken: token }),
  clearTempToken: () => set({ tempToken: null }),
})); 