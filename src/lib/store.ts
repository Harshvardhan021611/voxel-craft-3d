"use client";

import { create } from "zustand";
import type { DeviceInfo } from "@/lib/device";
import { PALETTE_IDS } from "@/lib/blocks";

export interface Notice {
  text: string;
  id: number;
}

export interface WorldMeta {
  id: number;
  name: string;
  seed: string;
  mode: string;
  public: boolean;
}

export interface RemotePlayer {
  clientId: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  device: string;
}

export interface Telemetry {
  x: number;
  y: number;
  z: number;
  biome: number;
  heading: number;
  underwater: boolean;
  landmark: { name: string; type: string; distance: number; x: number; z: number } | null;
}

export type OverlayId = "inventory" | "settings" | "tutorial" | null;

export interface GameStore {
  detected: boolean;
  device: DeviceInfo;
  setDevice: (info: DeviceInfo) => void;

  mode: "survival" | "creative";
  setMode: (mode: "survival" | "creative") => void;

  world: WorldMeta | null;
  setWorld: (world: WorldMeta | null) => void;
  players: RemotePlayer[];
  setPlayers: (players: RemotePlayer[]) => void;
  worldStatus: "loading" | "ready" | "offline";
  setWorldStatus: (status: "loading" | "ready" | "offline") => void;

  selected: number;
  setSelected: (index: number) => void;
  cycleSelected: (step: number) => void;

  fly: boolean;
  toggleFly: () => void;

  paused: boolean;
  setPaused: (paused: boolean) => void;

  overlay: OverlayId;
  setOverlay: (overlay: OverlayId) => void;

  blocksMined: number;
  blocksPlaced: number;
  registerMine: () => void;
  registerPlace: () => void;

  inventory: Record<number, number>;
  addItem: (blockId: number, quantity?: number) => void;
  consumeItem: (blockId: number, quantity?: number) => boolean;
  dropSelected: () => void;
  resetInventory: () => void;

  chestsOpened: Record<string, boolean>;
  openChest: (key: string) => boolean;

  worldRevision: number;
  bumpWorldRevision: () => void;

  controlsUsed: Record<string, boolean>;
  markControl: (id: string) => void;
  resetControlsUsed: () => void;

  notice: Notice | null;
  pushNotice: (text: string) => void;

  telemetry: Telemetry;
  setTelemetry: (telemetry: Partial<Telemetry>) => void;

  fps: number;
  setFps: (fps: number) => void;
}

function startingInventory(): Record<number, number> {
  const inventory: Record<number, number> = {};
  for (const id of PALETTE_IDS) inventory[id] = 12;
  return inventory;
}

export const useGameStore = create<GameStore>((set, get) => ({
  detected: false,
  device: { mode: "pc", platform: "Unknown", touch: false, gamepad: false, gamepadName: null },
  setDevice: (device) => set({ device, detected: true }),

  mode: "survival",
  setMode: (mode) =>
    set((state) => ({
      mode,
      inventory: mode === "creative" ? { ...state.inventory } : state.inventory,
      fly: mode === "creative" ? state.fly : false,
    })),

  world: null,
  setWorld: (world) => set({ world }),
  players: [],
  setPlayers: (players) => set({ players }),
  worldStatus: "loading",
  setWorldStatus: (worldStatus) => set({ worldStatus }),

  selected: 0,
  setSelected: (selected) => set({ selected }),
  cycleSelected: (step) => set((s) => ({ selected: (s.selected + step + 8) % 8 })),

  fly: false,
  toggleFly: () => {
    const fly = !get().fly;
    set({ fly, notice: { text: fly ? "Creative flight enabled" : "Flight disabled", id: Date.now() } });
  },

  paused: false,
  setPaused: (paused) => set({ paused, overlay: paused ? get().overlay : null }),

  overlay: null,
  setOverlay: (overlay) => set({ overlay }),

  blocksMined: 0,
  blocksPlaced: 0,
  registerMine: () => set((s) => ({ blocksMined: s.blocksMined + 1 })),
  registerPlace: () => set((s) => ({ blocksPlaced: s.blocksPlaced + 1 })),

  inventory: startingInventory(),
  addItem: (blockId, quantity = 1) =>
    set((s) => ({ inventory: { ...s.inventory, [blockId]: (s.inventory[blockId] ?? 0) + quantity } })),
  consumeItem: (blockId, quantity = 1) => {
    if (get().mode === "creative") return true;
    const current = get().inventory[blockId] ?? 0;
    if (current < quantity) return false;
    set((s) => ({ inventory: { ...s.inventory, [blockId]: current - quantity } }));
    return true;
  },
  dropSelected: () => {
    const state = get();
    const id = PALETTE_IDS[state.selected % PALETTE_IDS.length];
    const current = state.inventory[id] ?? 0;
    if (current <= 0) {
      state.pushNotice("Nothing to drop");
      return;
    }
    set({ inventory: { ...state.inventory, [id]: current - 1 } });
    state.pushNotice("Dropped 1 item");
  },
  resetInventory: () => set({ inventory: startingInventory() }),

  worldRevision: 0,
  bumpWorldRevision: () => set((s) => ({ worldRevision: s.worldRevision + 1 })),

  chestsOpened: {},
  openChest: (key) => {
    if (get().chestsOpened[key]) return false;
    set((s) => ({ chestsOpened: { ...s.chestsOpened, [key]: true } }));
    return true;
  },

  controlsUsed: {},
  markControl: (id) => {
    if (get().controlsUsed[id]) return;
    set((s) => ({ controlsUsed: { ...s.controlsUsed, [id]: true } }));
  },
  resetControlsUsed: () => set({ controlsUsed: {} }),

  notice: null,
  pushNotice: (text) => set({ notice: { text, id: Date.now() } }),

  telemetry: {
    x: 0,
    y: 20,
    z: 0,
    biome: 2,
    heading: 0,
    underwater: false,
    landmark: null,
  },
  setTelemetry: (telemetry) => set((s) => ({ telemetry: { ...s.telemetry, ...telemetry } })),

  fps: 0,
  setFps: (fps) => set({ fps }),
}));
