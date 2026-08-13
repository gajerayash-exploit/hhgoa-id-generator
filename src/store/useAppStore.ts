import { create } from 'zustand';
import { getRandomBuilderClass } from '../lib/builderTitles';

export type AppStep = 'landing' | 'upload' | 'customize' | 'export';
export type CardFormat = 'pfp' | 'builderId';
export type SkinFilter = 'raw' | 'sunset' | 'glitch' | 'jungle' | 'cyber' | '8bit';

export interface Teammate {
  id: string;
  photoSrc: string | null;
  name: string;
  stack: string;
}

export interface AppState {
  step: AppStep;
  format: CardFormat;
  // Primary builder
  photoSrc: string | null;
  name: string;
  stack: string;
  builderClass: string;
  skin: SkinFilter;
  panX: number;
  panY: number;
  scale: number;
  // Squad mode
  squadMode: boolean;
  teammates: Teammate[];
  // Export
  generatedDataUrl: string | null;
}

export interface AppActions {
  setStep: (step: AppStep) => void;
  setFormat: (format: CardFormat) => void;
  setPhoto: (src: string | null) => void;
  setName: (name: string) => void;
  setStack: (stack: string) => void;
  setBuilderClass: (bc: string) => void;
  rerollBuilderClass: () => void;
  setSkin: (skin: SkinFilter) => void;
  setPan: (x: number, y: number) => void;
  setScale: (scale: number) => void;
  setSquadMode: (on: boolean) => void;
  addTeammate: () => void;
  removeTeammate: (id: string) => void;
  updateTeammate: (id: string, patch: Partial<Teammate>) => void;
  setGeneratedDataUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  step: 'landing',
  format: 'builderId',
  photoSrc: '/default_avatar.svg',
  name: '',
  stack: '',
  builderClass: getRandomBuilderClass(),
  skin: 'raw',
  panX: 0,
  panY: 0,
  scale: 1,
  squadMode: false,
  teammates: [],
  generatedDataUrl: null,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setFormat: (format) => set({ format }),
  setPhoto: (photoSrc) => set({ photoSrc, panX: 0, panY: 0, scale: 1 }),
  setName: (name) => set({ name }),
  setStack: (stack) => set({ stack }),
  setBuilderClass: (builderClass) => set({ builderClass }),
  rerollBuilderClass: () => set((s) => ({ builderClass: getRandomBuilderClass(s.builderClass) })),
  setSkin: (skin) => set({ skin }),
  setPan: (panX, panY) => set({ panX, panY }),
  setScale: (scale) => set({ scale }),

  setSquadMode: (on) =>
    set((s) => ({
      squadMode: on,
      teammates: on && s.teammates.length === 0
        ? [{ id: crypto.randomUUID(), photoSrc: null, name: '', stack: '' }]
        : s.teammates,
    })),

  addTeammate: () =>
    set((s) => {
      if (s.teammates.length >= 2) return s;
      return {
        teammates: [...s.teammates, { id: crypto.randomUUID(), photoSrc: null, name: '', stack: '' }],
      };
    }),

  removeTeammate: (id) =>
    set((s) => ({ teammates: s.teammates.filter((t) => t.id !== id) })),

  updateTeammate: (id, patch) =>
    set((s) => ({
      teammates: s.teammates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  setGeneratedDataUrl: (generatedDataUrl) => set({ generatedDataUrl }),

  reset: () => set({ ...initialState, builderClass: getRandomBuilderClass() }),
}));
