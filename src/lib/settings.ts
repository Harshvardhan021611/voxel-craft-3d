"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeviceMode } from "@/lib/device";

export type ControlAction =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "jump"
  | "sprint"
  | "crouch"
  | "inventory"
  | "interact"
  | "drop"
  | "pause"
  | "fly";

export type Quality = "auto" | "low" | "medium" | "high" | "ultra";

export const DEFAULT_BINDINGS: Record<ControlAction, string> = {
  forward: "KeyW",
  back: "KeyS",
  left: "KeyA",
  right: "KeyD",
  jump: "Space",
  sprint: "ShiftLeft",
  crouch: "ControlLeft",
  inventory: "KeyE",
  interact: "KeyF",
  drop: "KeyQ",
  pause: "Escape",
  fly: "KeyV",
};

export const CONTROL_LABELS: Record<ControlAction, string> = {
  forward: "Move forward",
  back: "Move backward",
  left: "Move left",
  right: "Move right",
  jump: "Jump",
  sprint: "Sprint",
  crouch: "Crouch",
  inventory: "Open inventory",
  interact: "Interact / use",
  drop: "Drop item",
  pause: "Pause menu",
  fly: "Toggle flight (creative)",
};

export function keyLabel(code: string): string {
  if (!code) return "—";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Arrow")) return code.replace("Arrow", "Arrow ");
  const map: Record<string, string> = {
    Space: "Space",
    ShiftLeft: "Shift",
    ShiftRight: "Right Shift",
    ControlLeft: "Ctrl",
    ControlRight: "Right Ctrl",
    AltLeft: "Alt",
    Escape: "Esc",
    Enter: "Enter",
    Tab: "Tab",
    Backspace: "Backspace",
  };
  return map[code] ?? code;
}

interface SettingsState {
  bindings: Record<ControlAction, string>;
  sensitivity: number;
  padSensitivity: number;
  invertY: boolean;
  quality: Quality;
  showFps: boolean;
  showHints: boolean;
  tutorialEnabled: boolean;
  tutorialDone: Partial<Record<DeviceMode, boolean>>;
  setBinding: (action: ControlAction, code: string) => void;
  resetBindings: () => void;
  setSensitivity: (value: number) => void;
  setPadSensitivity: (value: number) => void;
  setInvertY: (value: boolean) => void;
  setQuality: (value: Quality) => void;
  setShowFps: (value: boolean) => void;
  setShowHints: (value: boolean) => void;
  setTutorialEnabled: (value: boolean) => void;
  markTutorialDone: (mode: DeviceMode, value: boolean) => void;
  resetAll: () => void;
}

const initial = {
  bindings: { ...DEFAULT_BINDINGS },
  sensitivity: 1,
  padSensitivity: 1,
  invertY: false,
  quality: "auto" as Quality,
  showFps: true,
  showHints: true,
  tutorialEnabled: true,
  tutorialDone: {},
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...initial,
      setBinding: (action, code) =>
        set((state) => ({ bindings: { ...state.bindings, [action]: code } })),
      resetBindings: () => set({ bindings: { ...DEFAULT_BINDINGS } }),
      setSensitivity: (sensitivity) => set({ sensitivity }),
      setPadSensitivity: (padSensitivity) => set({ padSensitivity }),
      setInvertY: (invertY) => set({ invertY }),
      setQuality: (quality) => set({ quality }),
      setShowFps: (showFps) => set({ showFps }),
      setShowHints: (showHints) => set({ showHints }),
      setTutorialEnabled: (tutorialEnabled) => set({ tutorialEnabled }),
      markTutorialDone: (mode, value) =>
        set((state) => ({ tutorialDone: { ...state.tutorialDone, [mode]: value } })),
      resetAll: () => set({ ...initial, bindings: { ...DEFAULT_BINDINGS }, tutorialDone: {} }),
    }),
    { name: "voxelcraft-settings-v2" }
  )
);

/** Maps a pressed key code to a control action using the player's bindings. */
export function actionForCode(code: string, bindings: Record<ControlAction, string>): ControlAction | null {
  for (const action of Object.keys(bindings) as ControlAction[]) {
    if (bindings[action] === code) return action;
  }
  return null;
}

export function requiredQuality(quality: Quality, mode: DeviceMode): "low" | "medium" | "high" | "ultra" {
  if (quality !== "auto") return quality;
  return mode === "mobile" ? "medium" : "high";
}
