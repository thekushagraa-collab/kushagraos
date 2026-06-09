/* ============================================================================
   KushagraOS — global store (Zustand)
   Owns OS-level state: theme, boot, window registry/focus, ⌘K, assistant.
   Phase 1 wires theme end-to-end; window/cmdk/assistant slices are scaffolded
   for Phase 2+ (Desktop, WindowManager, command bar, voice twin).
   All updates are immutable (new arrays/objects), per coding-style rules.
   ========================================================================== */

import { create } from "zustand";
import { applyTheme, getInitialTheme, nextTheme, type Theme } from "./theme";
import { applyMotion, getInitialMotion } from "./motionPref";

/** The apps that live on the desktop / mobile home screen (spec IA). */
export type AppId =
  | "about"
  | "capabilities"
  | "work"
  | "origin"
  | "telemetry"
  | "vision"
  | "contact"
  | "studio"
  | "lab"
  | "market"
  | "client"
  | "files"
  | "integrations"
  | "flow"
  | "atlas"
  | "forge"
  | "assistant";

/** Audience routing at boot ("login as") — reorders apps + tailors copy. */
export type Audience = "client" | "recruiter" | "founder" | "explorer";

export interface OSWindow {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface OSState {
  /* ---- Theme ---------------------------------------------------------- */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  /* ---- Motion ---------------------------------------------------------- */
  /** Whether KushagraOS animates. Default ON, independent of the OS
      prefers-reduced-motion setting. The menubar Motion control flips it. */
  motion: boolean;
  setMotion: (on: boolean) => void;
  toggleMotion: () => void;

  /* ---- Boot sequence + audience --------------------------------------- */
  isBooted: boolean;
  setBooted: (booted: boolean) => void;
  /** Which visitor lens the dock/copy is tuned to. Null until "login as". */
  audience: Audience | null;
  setAudience: (audience: Audience) => void;

  /* ---- Mobile (phone-OS): one full-screen app at a time --------------- */
  mobileAppId: AppId | null;
  openMobileApp: (appId: AppId) => void;
  closeMobileApp: () => void;

  /* ---- Window manager ------------------------------------------------- */
  windows: OSWindow[];
  focusedId: string | null;
  topZ: number;
  openApp: (appId: AppId, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;

  /* ---- Command bar (⌘K) ---------------------------------------------- */
  isCmdkOpen: boolean;
  setCmdkOpen: (open: boolean) => void;
  toggleCmdk: () => void;

  /* ---- Voice/text assistant ------------------------------------------ */
  isAssistantOpen: boolean;
  isListening: boolean;
  toggleAssistant: () => void;
  setListening: (listening: boolean) => void;
}

const BASE_Z = 100;

export const useOS = create<OSState>((set) => ({
  /* ---- Theme ---------------------------------------------------------- */
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme = nextTheme(state.theme);
      applyTheme(theme);
      return { theme };
    }),

  /* ---- Motion --------------------------------------------------------- */
  motion: getInitialMotion(),
  setMotion: (on) => {
    applyMotion(on);
    set({ motion: on });
  },
  toggleMotion: () =>
    set((state) => {
      const motion = !state.motion;
      applyMotion(motion);
      return { motion };
    }),

  /* ---- Boot + audience ------------------------------------------------ */
  isBooted: false,
  setBooted: (isBooted) => set({ isBooted }),
  audience: null,
  setAudience: (audience) => set({ audience }),

  /* ---- Mobile --------------------------------------------------------- */
  mobileAppId: null,
  openMobileApp: (appId) =>
    // assistant routes to the overlay on mobile too (not a full-screen app)
    set(appId === "assistant" ? { isAssistantOpen: true } : { mobileAppId: appId }),
  closeMobileApp: () => set({ mobileAppId: null }),

  /* ---- Window manager ------------------------------------------------- */
  windows: [],
  focusedId: null,
  topZ: BASE_Z,
  openApp: (appId, title) =>
    set((state) => {
      // The assistant is a persistent overlay, not a window — route it there.
      if (appId === "assistant") return { isAssistantOpen: true };
      const existing = state.windows.find((w) => w.appId === appId);
      const z = state.topZ + 1;
      if (existing) {
        return {
          topZ: z,
          focusedId: existing.id,
          windows: state.windows.map((w) =>
            w.id === existing.id ? { ...w, z, isMinimized: false } : w,
          ),
        };
      }
      const id = `${appId}-${Date.now()}`;
      const offset = state.windows.length * 28;
      const win: OSWindow = {
        id,
        appId,
        title,
        x: 120 + offset,
        y: 96 + offset,
        w: 720,
        h: 520,
        z,
        isMinimized: false,
        isMaximized: false,
      };
      return { windows: [...state.windows, win], focusedId: id, topZ: z };
    }),
  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      focusedId: state.focusedId === id ? null : state.focusedId,
    })),
  focusWindow: (id) =>
    set((state) => {
      const z = state.topZ + 1;
      return {
        topZ: z,
        focusedId: id,
        windows: state.windows.map((w) => (w.id === id ? { ...w, z } : w)),
      };
    }),
  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w,
      ),
      focusedId: state.focusedId === id ? null : state.focusedId,
    })),
  toggleMaximize: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w,
      ),
    })),
  moveWindow: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),
  resizeWindow: (id, w, h) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, w, h } : win,
      ),
    })),

  /* ---- Command bar ---------------------------------------------------- */
  isCmdkOpen: false,
  setCmdkOpen: (isCmdkOpen) => set({ isCmdkOpen }),
  toggleCmdk: () => set((state) => ({ isCmdkOpen: !state.isCmdkOpen })),

  /* ---- Assistant ------------------------------------------------------ */
  isAssistantOpen: false,
  isListening: false,
  toggleAssistant: () =>
    set((state) => ({ isAssistantOpen: !state.isAssistantOpen })),
  setListening: (isListening) => set({ isListening }),
}));
