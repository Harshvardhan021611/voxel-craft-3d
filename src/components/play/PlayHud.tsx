"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Compass, Eye, Gamepad2, Gem, Globe2, HelpCircle, MapPin, Monitor,
  Package, Pause, Pickaxe, Play, Settings2, Smartphone, Sparkles, Users,
  Blocks, ArrowUp, MousePointerClick, Crosshair as CrosshairIcon, Wind, Mountain,
} from "lucide-react";
import { BLOCKS, PALETTE_IDS, blockInfo } from "@/lib/blocks";
import { BIOMES } from "@/lib/voxel/world";
import { useGameStore } from "@/lib/store";
import { keyLabel, useSettings, type ControlAction } from "@/lib/settings";
import type { DeviceMode } from "@/lib/device";

export function DeviceBadge({ compact = false }: { compact?: boolean }) {
  const device = useGameStore((s) => s.device);
  const detected = useGameStore((s) => s.detected);
  const Icon = device.mode === "mobile" ? Smartphone : device.mode === "controller" ? Gamepad2 : Monitor;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 glass-strong px-3 py-2">
      <div className="relative">
        <Icon className="h-4 w-4 text-cyan" />
        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
      </div>
      <div className="leading-tight">
        <p className="text-[11px] font-bold capitalize text-white">
          {detected ? (device.mode === "pc" ? "Keyboard + Mouse" : device.mode) : "Detecting…"}
        </p>
        {!compact && (
          <p className="text-[9px] text-slate-400">
            {device.mode === "controller" && device.gamepadName
              ? device.gamepadName
              : `${device.platform} • auto-detected`}
          </p>
        )}
      </div>
      <Sparkles className="ml-1 h-3 w-3 text-violet" />
    </div>
  );
}

export function PlayTopBar() {
  const fps = useGameStore((s) => s.fps);
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const world = useGameStore((s) => s.world);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const showFps = useSettings((s) => s.showFps);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2.5 sm:p-4">
      <div className="pointer-events-auto flex min-w-0 items-center gap-2">
        <Link
          href="/"
          className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 glass-strong px-2.5 text-[11px] font-bold text-slate-200 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Hub</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 glass-strong px-2.5 py-2">
          <span className="text-[11px] font-black tracking-tight text-white">
            VOXEL<span className="text-cyan">CRAFT</span>
          </span>
          <span className="hidden max-w-[150px] truncate text-[9px] uppercase tracking-[0.14em] text-slate-400 sm:inline">
            {world?.name ?? "Connecting…"}
          </span>
        </div>
        <button
          onClick={() => setMode(mode === "creative" ? "survival" : "creative")}
          className={`hidden h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[10px] font-bold capitalize transition-colors sm:flex ${
            mode === "creative"
              ? "border-violet/40 bg-violet/15 text-violet"
              : "border-white/10 bg-white/5 text-slate-300"
          }`}
          title="Switch game mode"
        >
          <Gem className="h-3.5 w-3.5" /> {mode}
        </button>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5">
        {showFps && (
          <span className="hidden rounded-lg border border-white/10 bg-black/30 px-2 py-1 font-mono text-[10px] text-emerald-400 sm:inline">
            {fps} FPS
          </span>
        )}
        <button
          onClick={() => setOverlay("inventory")}
          aria-label="Inventory"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 glass-strong text-slate-200 hover:text-white"
        >
          <Package className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOverlay("settings")}
          aria-label="Settings and controls"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 glass-strong text-slate-200 hover:text-white"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOverlay("tutorial")}
          aria-label="Controls guide"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 glass-strong text-slate-200 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="hidden md:block">
          <DeviceBadge />
        </div>
        <button
          onClick={() => setPaused(!paused)}
          aria-label="Pause"
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 glass-strong text-slate-200 hover:text-white"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function WorldInfoPanel() {
  const telemetry = useGameStore((s) => s.telemetry);
  const players = useGameStore((s) => s.players);
  const world = useGameStore((s) => s.world);
  const biome = BIOMES[telemetry.biome] ?? BIOMES[2];
  const angle = telemetry.landmark ? (telemetry.landmark.x - telemetry.x) : 0;
  const dz = telemetry.landmark ? (telemetry.landmark.z - telemetry.z) : 0;
  const bearing = telemetry.landmark ? (Math.atan2(angle, -dz) * 180) / Math.PI : 0;

  return (
    <div className="pointer-events-none absolute left-2.5 top-16 z-20 w-[196px] space-y-1.5 sm:left-4 sm:top-20">
      <div className="rounded-xl border border-white/10 glass-strong p-2.5">
        <div className="flex items-center gap-2">
          <Mountain className="h-3.5 w-3.5" style={{ color: biome.color }} />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-white">{biome.name}</p>
            <p className="font-mono text-[9px] text-slate-400">
              {telemetry.x} / {telemetry.y} / {telemetry.z}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5">
          <span className="flex items-center gap-1 text-[9px] text-slate-400">
            <Users className="h-3 w-3 text-cyan" /> {players.length + 1} online
          </span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[8px] text-slate-400">
            seed {world?.seed?.slice(0, 8) ?? "…"}
          </span>
        </div>
      </div>

      {telemetry.landmark && telemetry.landmark.distance < 120 && (
        <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 p-2.5">
          <div className="relative grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gold/15">
            <Compass className="h-3.5 w-3.5 text-gold" />
            <span
              className="absolute h-0.5 w-3 origin-left rounded bg-gold"
              style={{ transform: `rotate(${bearing}deg)` }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold text-gold">{telemetry.landmark.name}</p>
            <p className="text-[9px] text-gold/70">{telemetry.landmark.distance}m away</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Crosshair() {
  const mode = useGameStore((s) => s.device.mode);
  const paused = useGameStore((s) => s.paused);
  const overlay = useGameStore((s) => s.overlay);
  if (paused || overlay) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-7 w-7">
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(0,212,255,0.9)]" />
        {mode !== "mobile" && (
          <>
            <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-white/60" />
            <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-white/60" />
            <span className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-white/60" />
            <span className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-white/60" />
          </>
        )}
      </div>
      <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] text-white/45">
        <CrosshairIcon className="mr-1 inline h-2.5 w-2.5" />
        {mode === "controller" ? "Right stick" : mode === "mobile" ? "Swipe" : "Mouse"} to aim
      </span>
    </div>
  );
}

export function Hotbar() {
  const selected = useGameStore((s) => s.selected);
  const setSelected = useGameStore((s) => s.setSelected);
  const inventory = useGameStore((s) => s.inventory);
  const mode = useGameStore((s) => s.mode);
  const device = useGameStore((s) => s.device.mode);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-2.5 sm:pb-4">
      <div className="pointer-events-auto rounded-2xl border border-white/10 glass-strong p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
        <div className="flex items-end gap-1.5">
          {PALETTE_IDS.map((id, index) => {
            const block = blockInfo(id);
            const active = selected === index;
            const count = inventory[id] ?? 0;
            return (
              <button
                key={id}
                onClick={() => setSelected(index)}
                aria-label={block.name}
                title={block.name}
                className={`group relative grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 sm:h-12 sm:w-12 ${
                  active
                    ? "-translate-y-1 border-cyan/60 bg-white/10 shadow-[0_0_20px_rgba(0,212,255,0.35)]"
                    : "border-white/5 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-[5px] transition-transform duration-200 group-hover:scale-110 sm:h-6 sm:w-6"
                  style={{
                    background: `linear-gradient(145deg, ${block.color}, ${block.color}bb)`,
                    boxShadow: active ? `0 0 14px ${block.color}80` : "inset 0 -3px 0 rgba(0,0,0,0.25)",
                  }}
                />
                <span className="absolute left-1 top-0.5 font-mono text-[8px] text-white/45">{index + 1}</span>
                <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-white/70">
                  {mode === "creative" ? "∞" : count}
                </span>
                {active && <span className="absolute -bottom-[3px] left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan" />}
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 px-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
            {blockInfo(PALETTE_IDS[selected] ?? 1).name}
          </span>
          <span className="text-[8px] uppercase tracking-[0.12em] text-slate-500">
            {device === "mobile" ? "Tap a block" : device === "controller" ? "LB / RB" : "1–8 / Scroll"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActionToast() {
  const notice = useGameStore((s) => s.notice);
  const pushNotice = useGameStore((s) => s.pushNotice);

  useEffect(() => {
    if (!notice || !notice.text) return;
    const timer = setTimeout(() => pushNotice(""), 2100);
    return () => clearTimeout(timer);
  }, [notice, pushNotice]);

  if (!notice || !notice.text) return null;

  return (
    <div
      key={notice.id}
      className="pointer-events-none absolute left-1/2 top-[16%] z-20 -translate-x-1/2 animate-fade-in rounded-xl border border-cyan/20 glass-strong px-4 py-2 text-xs font-bold text-white"
    >
      {notice.text}
    </div>
  );
}

export function ControlHints() {
  const device = useGameStore((s) => s.device.mode) as DeviceMode;
  const paused = useGameStore((s) => s.paused);
  const overlay = useGameStore((s) => s.overlay);
  const tutorialDone = useSettings((s) => s.tutorialDone);
  const showHints = useSettings((s) => s.showHints);
  const bindings = useSettings((s) => s.bindings);

  if (paused || overlay || device === "mobile") return null;
  if (!showHints) return null;

  const firstSession = !tutorialDone[device];
  const key = (action: ControlAction) => keyLabel(bindings[action]);

  const hints =
    device === "controller"
      ? [
          { keys: ["L-Stick"], label: "Move" },
          { keys: ["R-Stick"], label: "Look" },
          { keys: ["RT"], label: "Mine" },
          { keys: ["LT"], label: "Place" },
          { keys: ["A"], label: "Jump" },
          { keys: ["X"], label: "Descend" },
          { keys: ["LB/RB"], label: "Select block" },
          { keys: ["Menu"], label: "Inventory" },
        ]
      : [
          { keys: [key("forward"), key("left"), key("back"), key("right")], label: "Move" },
          { keys: ["Mouse"], label: "Look" },
          { keys: ["LMB"], label: "Break / attack" },
          { keys: ["RMB"], label: "Place / use" },
          { keys: [key("jump")], label: "Jump" },
          { keys: [key("sprint")], label: "Sprint" },
          { keys: [key("crouch")], label: "Crouch" },
          { keys: [key("inventory")], label: "Inventory" },
          { keys: [key("interact")], label: "Interact" },
          { keys: [key("drop")], label: "Drop item" },
          { keys: [key("pause")], label: "Pause" },
        ];

  return (
    <div className="pointer-events-none absolute bottom-24 left-2.5 z-20 hidden w-[212px] rounded-2xl border border-white/10 glass-strong p-2.5 sm:left-4 md:block">
      <div className="mb-1.5 flex items-center gap-2 border-b border-white/5 pb-1.5">
        <Monitor className="h-3.5 w-3.5 text-cyan" />
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/80">
          {device === "controller" ? "Controller" : "PC controls"}
        </span>
        {firstSession && <span className="ml-auto rounded bg-cyan/15 px-1.5 py-0.5 text-[8px] font-bold text-cyan">TIPS</span>}
      </div>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
        {hints.map((hint) => (
          <li key={hint.label} className="flex flex-col gap-0.5">
            <div className="flex flex-wrap gap-0.5">
              {hint.keys.map((label) => (
                <kbd key={label} className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 text-[8px] font-bold text-white/80">
                  {label}
                </kbd>
              ))}
            </div>
            <span className="text-[9px] text-slate-400">{hint.label}</span>
          </li>
        ))}
      </ul>
      <Link href="/play" className="mt-1.5 block border-t border-white/5 pt-1 text-[8px] text-slate-500">
        Customise in Settings · auto layout
      </Link>
    </div>
  );
}

export function PauseOverlay() {
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const overlay = useGameStore((s) => s.overlay);
  const device = useGameStore((s) => s.device);
  const mined = useGameStore((s) => s.blocksMined);
  const placed = useGameStore((s) => s.blocksPlaced);
  const world = useGameStore((s) => s.world);
  const players = useGameStore((s) => s.players);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(window.localStorage.getItem("voxelcraft-offline") === "1");
  }, [paused]);

  if (!paused || overlay) return null;

  const layoutLabel =
    device.mode === "controller"
      ? `Controller${device.gamepadName ? ` • ${device.gamepadName}` : ""}`
      : device.mode === "mobile"
        ? "Touch joystick + buttons"
        : "Keyboard + mouse";

  return (
    <div className="absolute inset-0 z-40 grid place-items-center p-4">
      <div className="absolute inset-0 bg-void/75 backdrop-blur-md" onClick={() => setPaused(false)} />
      <div className="relative w-full max-w-md animate-slide-up rounded-3xl border border-white/10 glass-strong p-6 shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan">Paused</p>
        <h2 className="mt-1 truncate text-2xl font-black text-white">{world?.name ?? "Open World"}</h2>
        <p className="mt-1 text-xs text-slate-400">
          Controls: <span className="font-semibold text-white">{layoutLabel}</span> · {players.length + 1} explorers in world
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Mined", value: mined },
            { label: "Built", value: placed },
            { label: "Seed", value: world?.seed?.slice(0, 6) ?? "—" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="truncate font-mono text-sm font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setOverlay("settings")}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-white/10"
          >
            <Settings2 className="h-3.5 w-3.5" /> Settings & keys
          </button>
          <button
            onClick={() => setOverlay("tutorial")}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-white/10"
          >
            <HelpCircle className="h-3.5 w-3.5" /> Control guide
          </button>
          <button
            onClick={() => {
              window.localStorage.setItem("voxelcraft-offline", offline ? "0" : "1");
              window.location.reload();
            }}
            className={`col-span-2 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[11px] font-bold transition-colors ${
              offline
                ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            {offline ? "Offline single-player — tap to go online" : "Shared open world — tap for offline mode"}
          </button>
        </div>

        <button
          onClick={() => setPaused(false)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-violet py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(0,212,255,0.3)] transition-transform hover:-translate-y-0.5"
        >
          <Play className="h-4 w-4" /> Resume exploring
        </button>
        <Link
          href="/"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[11px] font-bold text-slate-300 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to hub
        </Link>
        <p className="mt-3 text-center text-[10px] text-slate-500">
          {device.mode === "controller" ? "Press Start to resume" : device.mode === "mobile" ? "Tap Resume to continue" : "Press Esc to resume"}
        </p>
      </div>
    </div>
  );
}

export function DeviceLayoutBanner() {
  const mode = useGameStore((s) => s.device.mode) as DeviceMode;
  const detected = useGameStore((s) => s.detected);
  const overlay = useGameStore((s) => s.overlay);
  if (!detected || overlay) return null;

  const copy: Record<DeviceMode, string> = {
    pc: "PC detected — WASD + mouse. LMB break · RMB place · E inventory · F interact",
    mobile: "Touch detected — left stick to move, swipe to look",
    controller: "Controller detected — sticks, triggers and menu are live",
  };
  const Icon = mode === "mobile" ? Smartphone : mode === "controller" ? Gamepad2 : Monitor;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[52px] z-20 flex justify-center px-4 sm:top-16">
      <div className="animate-fade-in rounded-full border border-white/5 glass px-3 py-1.5 text-[9px] font-medium tracking-wide text-slate-300">
        <Icon className="mr-1.5 inline h-3 w-3 text-cyan" />
        {copy[mode]}
      </div>
    </div>
  );
}

export const HUD_BLOCK_COUNT = BLOCKS.length;
export const HUD_ICONS = { MapPin, Wind, Pickaxe, Eye, Blocks, ArrowUp, MousePointerClick };
