"use client";

import { useMemo } from "react";
import {
  ArrowLeftRight, ArrowUp, Blocks, Check, ChevronRight, Eye, Gamepad2, Hand,
  Monitor, Pickaxe, Move, Settings2, Smartphone, Sparkles, Trophy, X, MousePointerClick, Package, Heart,
} from "lucide-react";
import type { DeviceMode } from "@/lib/device";
import { DEFAULT_BINDINGS, keyLabel, useSettings, type ControlAction } from "@/lib/settings";
import { useGameStore } from "@/lib/store";

interface TutorialStep {
  id: string;
  title: string;
  hint: string;
  icon: typeof Move;
  keys?: string[];
}

function pcSteps(bindings: Record<ControlAction, string>): TutorialStep[] {
  const key = (action: ControlAction) => keyLabel(bindings[action]);
  return [
    { id: "move", title: "Move around", hint: "Walk in any direction", icon: Move, keys: [key("forward"), key("left"), key("back"), key("right")] },
    { id: "look", title: "Look around", hint: "Move the mouse to aim", icon: Eye, keys: ["Mouse"] },
    { id: "jump", title: "Jump", hint: "Hop up one block", icon: ArrowUp, keys: [key("jump")] },
    { id: "sprint", title: "Sprint", hint: "Hold to run faster", icon: Sparkles, keys: [key("sprint")] },
    { id: "crouch", title: "Crouch", hint: "Hold to sneak / descend", icon: Hand, keys: [key("crouch")] },
    { id: "break", title: "Break block / attack", hint: "Aim at a block and click", icon: Pickaxe, keys: ["Left Mouse"] },
    { id: "place", title: "Place block / use item", hint: "Aim at a surface", icon: Blocks, keys: ["Right Mouse"] },
    { id: "inventory", title: "Open inventory", hint: "Browse blocks & loot", icon: Package, keys: [key("inventory")] },
    { id: "interact", title: "Interact", hint: "Open chests, use objects", icon: MousePointerClick, keys: [key("interact")] },
    { id: "drop", title: "Drop item", hint: "Drop the selected block", icon: ArrowLeftRight, keys: [key("drop")] },
    { id: "pause", title: "Pause menu", hint: "Open settings anytime", icon: Settings2, keys: [key("pause")] },
  ];
}

const MOBILE_STEPS: TutorialStep[] = [
  { id: "move", title: "Virtual joystick", hint: "Drag the left stick to walk", icon: Move, keys: ["Left stick"] },
  { id: "look", title: "Swipe to look", hint: "Drag anywhere on the world", icon: Eye, keys: ["Swipe"] },
  { id: "jump", title: "Jump button", hint: "Big button on the right", icon: ArrowUp, keys: ["Jump"] },
  { id: "sprint", title: "Sprint", hint: "Push the stick to the edge", icon: Sparkles, keys: ["Full stick"] },
  { id: "break", title: "Attack / mine", hint: "Tap the pickaxe button", icon: Pickaxe, keys: ["Mine"] },
  { id: "place", title: "Build / place", hint: "Tap the block button", icon: Blocks, keys: ["Build"] },
  { id: "inventory", title: "Inventory", hint: "Open your bags", icon: Package, keys: ["Bag"] },
];

const CONTROLLER_STEPS: TutorialStep[] = [
  { id: "move", title: "Move", hint: "Left analog stick", icon: Move, keys: ["L-Stick"] },
  { id: "look", title: "Look", hint: "Right analog stick", icon: Eye, keys: ["R-Stick"] },
  { id: "jump", title: "Jump", hint: "A / Cross", icon: ArrowUp, keys: ["A"] },
  { id: "sprint", title: "Sprint", hint: "L3 / stick click", icon: Sparkles, keys: ["L3"] },
  { id: "break", title: "Mine", hint: "Right trigger", icon: Pickaxe, keys: ["RT"] },
  { id: "place", title: "Place", hint: "Left trigger", icon: Blocks, keys: ["LT"] },
  { id: "interact", title: "Interact", hint: "X / Square", icon: MousePointerClick, keys: ["X"] },
  { id: "inventory", title: "Inventory", hint: "Menu / Start", icon: Package, keys: ["Menu"] },
  { id: "pause", title: "Pause", hint: "Options / Start", icon: Settings2, keys: ["Options"] },
];

export default function ControlTutorial() {
  const device = useGameStore((s) => s.device.mode) as DeviceMode;
  const used = useGameStore((s) => s.controlsUsed);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setPaused = useGameStore((s) => s.setPaused);
  const pushNotice = useGameStore((s) => s.pushNotice);
  const bindings = useSettings((s) => s.bindings);
  const markTutorialDone = useSettings((s) => s.markTutorialDone);

  const steps = useMemo(
    () => (device === "mobile" ? MOBILE_STEPS : device === "controller" ? CONTROLLER_STEPS : pcSteps(bindings)),
    [device, bindings]
  );

  const done = steps.filter((step) => used[step.id]).length;
  const current = steps.find((step) => !used[step.id]);
  const complete = done === steps.length;
  const Icon = device === "mobile" ? Smartphone : device === "controller" ? Gamepad2 : Monitor;

  const finish = (skipped: boolean) => {
    markTutorialDone(device, true);
    setOverlay(null);
    setPaused(false);
    pushNotice(skipped ? "Tutorial skipped — open controls anytime" : "Controls mastered! 🎉");
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end p-3 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-void/70 via-void/10 to-transparent" />
      <div className="pointer-events-auto relative z-10 flex max-h-full w-full max-w-[380px] flex-col overflow-hidden rounded-3xl glass-strong border border-cyan/20 shadow-[0_30px_90px_rgba(0,212,255,0.18)] animate-slide-up">
        <div className="flex items-start justify-between gap-3 border-b border-white/5 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
              <Icon className="h-3.5 w-3.5" /> Interactive tutorial
            </div>
            <h2 className="text-xl font-black text-white">Learn your controls</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Do each action and it ticks off automatically. Layout:{" "}
              <span className="font-semibold text-white">
                {device === "pc" ? "Keyboard + mouse" : device === "mobile" ? "Touch" : "Controller"}
              </span>
            </p>
          </div>
          <button
            onClick={() => finish(true)}
            aria-label="Skip tutorial"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-400">Progress</span>
            <span className="text-cyan">{done}/{steps.length}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all duration-500"
              style={{ width: `${(done / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto p-4">
          {steps.map((step, index) => {
            const isDone = Boolean(used[step.id]);
            const isCurrent = current?.id === step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-300 ${
                  isDone
                    ? "border-emerald-400/25 bg-emerald-400/5"
                    : isCurrent
                      ? "border-cyan/40 bg-cyan/10 shadow-[0_0_18px_rgba(0,212,255,0.15)]"
                      : "border-white/5 bg-white/[0.02] opacity-70"
                }`}
              >
                <div
                  className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg ${
                    isDone ? "bg-emerald-400/15 text-emerald-300" : isCurrent ? "bg-cyan/20 text-cyan" : "bg-white/5 text-slate-400"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : <step.icon className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[12px] font-bold ${isDone ? "text-emerald-200" : "text-white"}`}>
                    {step.title}
                  </p>
                  <p className="truncate text-[10px] text-slate-400">{step.hint}</p>
                </div>
                {step.keys && (
                  <div className="flex flex-shrink-0 flex-wrap justify-end gap-1">
                    {step.keys.map((label) => (
                      <kbd
                        key={label}
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                          isCurrent ? "border-cyan/40 bg-cyan/15 text-cyan" : "border-white/10 bg-white/5 text-slate-300"
                        }`}
                      >
                        {label}
                      </kbd>
                    ))}
                  </div>
                )}
                {!isDone && !isCurrent && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/5 p-4">
          {complete ? (
            <button
              onClick={() => finish(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan py-3 text-sm font-bold text-white shadow-[0_0_26px_rgba(52,211,153,0.35)] transition-transform hover:-translate-y-0.5"
            >
              <Trophy className="h-4 w-4" /> Start exploring
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-slate-500">
                <Heart className="mr-1 inline h-3 w-3 text-rose-400" />
                Tips stay on screen for your first session.
              </p>
              <button
                onClick={() => finish(true)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_PC_KEYS = DEFAULT_BINDINGS;
