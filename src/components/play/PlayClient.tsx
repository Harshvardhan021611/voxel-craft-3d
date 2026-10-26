"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { useDeviceMode } from "@/hooks/useDeviceMode";
import { useGamepadInput, useKeyboardMouseInput } from "@/hooks/useInputAdapters";
import { input, queueAction } from "@/lib/input";
import { useGameStore } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import { WorldEngine } from "@/lib/voxel/world";
import MobileControls from "./MobileControls";
import ControlTutorial from "./ControlTutorial";
import SettingsPanel from "./SettingsPanel";
import InventoryPanel from "./InventoryPanel";
import {
  ActionToast, ControlHints, Crosshair, DeviceLayoutBanner, Hotbar,
  PauseOverlay, PlayTopBar, WorldInfoPanel,
} from "./PlayHud";

const VoxelSandbox = dynamic(() => import("./VoxelSandbox"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-gradient-to-b from-[#0b1224] to-[#16243a]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-cyan" />
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Streaming world</p>
      </div>
    </div>
  ),
});

function readClientId() {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem("voxelcraft-client-id");
  if (existing) return existing;
  const id = `p-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem("voxelcraft-client-id", id);
  window.localStorage.setItem("voxelcraft-player-name", `Explorer-${id.slice(-3).toUpperCase()}`);
  return id;
}

function LookLayer() {
  const mode = useGameStore((s) => s.device.mode);
  const drag = useRef<{ id: number; x: number; y: number; moved: number; type: string } | null>(null);
  const sensitivity = useSettings((s) => s.sensitivity);
  const invertY = useSettings((s) => s.invertY);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!document.pointerLockElement) return;
      const factor = 0.0022 * sensitivity;
      input.mouseLook.x -= event.movementX * factor;
      input.mouseLook.y -= event.movementY * factor * (invertY ? -1 : 1);
      useGameStore.getState().markControl("look");
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!document.pointerLockElement) return;
      const state = useGameStore.getState();
      if (state.paused || (state.overlay && state.overlay !== "tutorial")) return;
      if (event.button === 0) {
        queueAction("mine");
        state.markControl("break");
      }
      if (event.button === 2) {
        queueAction("place");
        state.markControl("place");
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [sensitivity, invertY]);

  useEffect(() => {
    input.touchMove.x = 0;
    input.touchMove.y = 0;
    input.touchLook.x = 0;
    input.touchLook.y = 0;
    if (mode !== "pc" && document.pointerLockElement) document.exitPointerLock();
  }, [mode]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = useGameStore.getState();
      if (state.paused || (state.overlay && state.overlay !== "tutorial")) return;
      if (event.pointerType === "mouse") {
        if (event.button === 2) {
          queueAction("place");
          state.markControl("place");
          return;
        }
        if (mode === "pc" && !document.pointerLockElement) {
          const request = event.currentTarget.requestPointerLock?.bind(event.currentTarget);
          try {
            const result = request?.() as unknown as Promise<void> | undefined;
            if (result && typeof result.catch === "function") result.catch(() => undefined);
          } catch {
            /* drag-look fallback */
          }
        }
      }
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0, type: event.pointerType };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [mode]
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (document.pointerLockElement) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.x = event.clientX;
    current.y = event.clientY;
    current.moved += Math.abs(dx) + Math.abs(dy);
    if (current.moved < 3) return;
    const { sensitivity: sens, invertY: inv } = useSettings.getState();
    const sign = inv ? -1 : 1;
    if (current.type === "mouse") {
      input.mouseLook.x -= dx * 0.0026 * sens;
      input.mouseLook.y -= dy * 0.0026 * sens * sign;
    } else {
      input.touchLook.x -= dx * 0.005 * sens;
      input.touchLook.y -= dy * 0.004 * sens * sign;
    }
    useGameStore.getState().markControl("look");
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current || current.id !== event.pointerId) return;
    const state = useGameStore.getState();
    if (state.paused || (state.overlay && state.overlay !== "tutorial")) return;
    if (current.type === "mouse" && current.moved < 6 && !document.pointerLockElement) {
      queueAction("mine");
      state.markControl("break");
    }
  }, []);

  return (
    <div
      className="absolute inset-0 z-10 touch-none"
      style={{ cursor: mode === "pc" ? "crosshair" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}

function InputWatchers() {
  const paused = useGameStore((s) => s.paused);
  const overlay = useGameStore((s) => s.overlay);
  useDeviceMode();
  useKeyboardMouseInput();
  useGamepadInput();

  useEffect(() => {
    if ((paused || overlay) && document.pointerLockElement) document.exitPointerLock();
  }, [paused, overlay]);

  return null;
}

export default function PlayClient() {
  const device = useGameStore((s) => s.device);
  const detected = useGameStore((s) => s.detected);
  const overlay = useGameStore((s) => s.overlay);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const world = useGameStore((s) => s.world);
  const setWorld = useGameStore((s) => s.setWorld);
  const setMode = useGameStore((s) => s.setMode);
  const players = useGameStore((s) => s.players);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const worldStatus = useGameStore((s) => s.worldStatus);
  const setWorldStatus = useGameStore((s) => s.setWorldStatus);

  const tutorialEnabled = useSettings((s) => s.tutorialEnabled);
  const tutorialDone = useSettings((s) => s.tutorialDone);
  const tutorialOpened = useRef<Set<string>>(new Set());

  const [engine, setEngine] = useState<WorldEngine | null>(null);
  const clientId = useRef("client");
  const worldId = useRef(0);
  const lastSaved = useRef(-1);
  const remoteEditCount = useRef(0);
  const bumpWorldRevision = useGameStore((s) => s.bumpWorldRevision);

  useEffect(() => {
    clientId.current = readClientId();
  }, []);

  // ---- join or create a shared open world (multiplayer + single-player)
  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      const name = window.localStorage.getItem("voxelcraft-player-name") ?? "Explorer";

      // Single-player offline mode: identical infinite generator, stored locally.
      if (window.localStorage.getItem("voxelcraft-offline") === "1") {
        const storedSeed = window.localStorage.getItem("voxelcraft-local-seed");
        const localSeed = storedSeed ?? String(Math.floor(Math.random() * 900000) + 1000);
        window.localStorage.setItem("voxelcraft-local-seed", localSeed);
        const worldEngine = new WorldEngine(localSeed);
        setEngine(worldEngine);
        setWorld({ id: 0, name: "Offline Frontier", seed: localSeed, mode: "survival", public: false });
        setWorldStatus("offline");
        return;
      }

      try {
        const response = await fetch("/api/worlds/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: clientId.current, name, device: device.mode, mode: "survival" }),
        });
        const data = await response.json();
        if (cancelled) return;
        if (!data?.world) throw new Error("no world");
        const worldEngine = new WorldEngine(data.world.seed);
        worldEngine.applyEdits(data.edits ?? {});
        worldId.current = data.world.id;
        setEngine(worldEngine);
        setWorld({
          id: data.world.id,
          name: data.world.name,
          seed: data.world.seed,
          mode: data.world.mode,
          public: data.world.public ?? true,
        });
        setMode(data.world.mode === "creative" ? "creative" : "survival");
        setPlayers(Array.isArray(data.players) ? data.players : []);
        setWorldStatus("ready");
      } catch {
        if (cancelled) return;
        const worldEngine = new WorldEngine(Math.floor(Math.random() * 900000) + 1000);
        setEngine(worldEngine);
        setWorld({ id: 0, name: "Local Frontier", seed: String(worldEngine.seed), mode: "survival", public: false });
        setWorldStatus("offline");
      }
    };
    void join();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- presence heartbeat + throttled autosave of world edits
  useEffect(() => {
    if (!engine) return;
    const timer = window.setInterval(async () => {
      const state = useGameStore.getState();
      if (!state.world || state.world.id === 0) return;
      const telemetry = state.telemetry;
      const editCount = engine.edits.size;
      const shouldSend = lastSaved.current !== editCount;
      try {
        const response = await fetch(`/api/worlds/${state.world.id}/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientId.current,
            name: window.localStorage.getItem("voxelcraft-player-name") ?? "Explorer",
            device: state.device.mode,
            x: telemetry.x,
            y: telemetry.y,
            z: telemetry.z,
            yaw: telemetry.heading,
            edits: shouldSend ? engine.collectEdits(4000) : undefined,
          }),
        });
        const data = await response.json();
        if (Array.isArray(data?.players)) setPlayers(data.players);
        if (shouldSend) lastSaved.current = editCount;
      } catch {
        setWorldStatus("offline");
      }
    }, 3500);
    return () => window.clearInterval(timer);
  }, [engine, setPlayers, setWorldStatus]);

  // ---- pull other explorers' builds so the shared world stays in sync
  useEffect(() => {
    if (!engine) return;
    const timer = window.setInterval(async () => {
      const state = useGameStore.getState();
      if (!state.world || state.world.id === 0) return;
      try {
        const response = await fetch("/api/worlds/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: clientId.current, name: "sync", device: state.device.mode }),
        });
        const data = await response.json();
        if (!data?.edits || data.world?.id !== state.world.id) return;
        const keys = Object.keys(data.edits);
        if (keys.length === remoteEditCount.current) return;
        remoteEditCount.current = keys.length;
        engine.applyEdits(data.edits);
        bumpWorldRevision();
      } catch {
        /* offline — local generation continues */
      }
    }, 12_000);
    return () => window.clearInterval(timer);
  }, [engine, bumpWorldRevision]);

  // ---- first-time tutorial opens automatically, once per input device
  useEffect(() => {
    if (!detected || !tutorialEnabled) return;
    if (tutorialDone[device.mode]) return;
    if (tutorialOpened.current.has(device.mode)) return;
    tutorialOpened.current.add(device.mode);
    setOverlay("tutorial");
  }, [detected, device.mode, tutorialEnabled, tutorialDone, setOverlay]);

  return (
    <div
      className="relative h-[100dvh] w-full touch-none select-none overflow-hidden overscroll-none bg-void"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="absolute inset-0 z-0">
        {engine ? (
          <VoxelSandbox engine={engine} seed={engine.seed} players={players} />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-b from-[#0b1224] to-[#16243a]">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Generating infinite world</p>
              <p className="text-[10px] text-slate-500">Streaming biomes, caves and villages…</p>
            </div>
          </div>
        )}
      </div>

      <InputWatchers />
      {engine && (!overlay || overlay === "tutorial") && <LookLayer />}

      <PlayTopBar />
      <DeviceLayoutBanner />
      <Crosshair />
      <ActionToast />
      <WorldInfoPanel />
      <ControlHints />
      {detected && device.mode === "mobile" && (!overlay || overlay === "tutorial") && <MobileControls />}
      <Hotbar />
      <PauseOverlay />

      {overlay === "tutorial" && <ControlTutorial />}
      {overlay === "settings" && <SettingsPanel />}
      {overlay === "inventory" && <InventoryPanel />}

      {worldStatus === "offline" && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold text-amber-200">
          <WifiOff className="h-3 w-3" /> Offline single-player — world keeps generating locally
        </div>
      )}
      {worldStatus === "ready" && world && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 sm:flex">
          <Wifi className="h-3 w-3" /> Shared open world synced
        </div>
      )}
    </div>
  );
}
