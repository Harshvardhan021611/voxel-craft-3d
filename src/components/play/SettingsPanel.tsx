"use client";

import { useEffect, useState } from "react";
import { Check, Gamepad2, Monitor, RotateCcw, Sliders, X, Keyboard, Eye, Gauge, HelpCircle } from "lucide-react";
import {
  CONTROL_LABELS, DEFAULT_BINDINGS, keyLabel, useSettings, type ControlAction, type Quality,
} from "@/lib/settings";
import { useGameStore } from "@/lib/store";

const QUALITIES: Quality[] = ["auto", "low", "medium", "high", "ultra"];

export default function SettingsPanel() {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const resetControlsUsed = useGameStore((s) => s.resetControlsUsed);
  const {
    bindings, setBinding, resetBindings, sensitivity, setSensitivity,
    padSensitivity, setPadSensitivity, invertY, setInvertY, quality, setQuality,
    showFps, setShowFps, showHints, setShowHints, tutorialEnabled, setTutorialEnabled,
    resetAll,
  } = useSettings();
  const [listening, setListening] = useState<ControlAction | null>(null);
  const [tab, setTab] = useState<"controls" | "feel" | "graphics">("controls");

  useEffect(() => {
    if (!listening) return;
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.code !== "Escape") setBinding(listening, event.code);
      setListening(null);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [listening, setBinding]);

  return (
    <div className="absolute inset-0 z-50 grid place-items-center p-3 sm:p-5">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={() => setOverlay(null)} />
      <div className="relative w-full max-w-2xl animate-slide-up overflow-hidden rounded-3xl glass-strong border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/15 text-cyan">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Settings &amp; controls</h2>
              <p className="text-[11px] text-slate-400">Customise everything, saved to this device</p>
            </div>
          </div>
          <button
            onClick={() => setOverlay(null)}
            aria-label="Close settings"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-white/5 px-4 pt-3">
          {([
            ["controls", "Controls", Keyboard],
            ["feel", "Feel", Eye],
            ["graphics", "Graphics", Gauge],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                tab === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        <div className="scrollbar-thin max-h-[58vh] overflow-y-auto p-5">
          {tab === "controls" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-[11px] text-slate-300">
                Click a key to rebind, then press any key. Mouse buttons and sticks are fixed so aiming stays consistent.
                <span className="mt-1 block text-slate-500">Mouse: look · LMB break · RMB place</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(CONTROL_LABELS) as ControlAction[]).map((action) => (
                  <div key={action} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                    <div>
                      <p className="text-[11px] font-bold text-white">{CONTROL_LABELS[action]}</p>
                      <p className="text-[9px] uppercase tracking-wider text-slate-500">
                        default {keyLabel(DEFAULT_BINDINGS[action])}
                      </p>
                    </div>
                    <button
                      onClick={() => setListening(listening === action ? null : action)}
                      className={`min-w-[64px] rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${
                        listening === action
                          ? "animate-pulse border-cyan bg-cyan/20 text-cyan"
                          : "border-white/10 bg-white/5 text-white hover:border-cyan/30"
                      }`}
                    >
                      {listening === action ? "Press…" : keyLabel(bindings[action])}
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={resetBindings}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restore default keys
              </button>
            </div>
          )}

          {tab === "feel" && (
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center justify-between text-[11px] font-bold text-white">
                  Mouse / touch sensitivity <span className="font-mono text-cyan">{sensitivity.toFixed(2)}×</span>
                </span>
                <input
                  type="range" min={0.3} max={2.5} step={0.05} value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-cyan"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center justify-between text-[11px] font-bold text-white">
                  Controller sensitivity <span className="font-mono text-cyan">{padSensitivity.toFixed(2)}×</span>
                </span>
                <input
                  type="range" min={0.3} max={2.5} step={0.05} value={padSensitivity}
                  onChange={(e) => setPadSensitivity(Number(e.target.value))}
                  className="w-full accent-cyan"
                />
              </label>
              {[
                { label: "Invert vertical look", value: invertY, set: setInvertY, icon: Gamepad2 },
                { label: "Show FPS counter", value: showFps, set: setShowFps, icon: Gauge },
                { label: "Show on-screen control tips", value: showHints, set: setShowHints, icon: Monitor },
                { label: "Interactive tutorial on new devices", value: tutorialEnabled, set: setTutorialEnabled, icon: HelpCircle },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.set(!item.value)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold text-white">
                    <item.icon className="h-3.5 w-3.5 text-cyan" /> {item.label}
                  </span>
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${item.value ? "bg-cyan/70" : "bg-white/15"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${item.value ? "left-[18px]" : "left-0.5"}`} />
                  </span>
                </button>
              ))}
              <button
                onClick={() => {
                  useSettings.getState().markTutorialDone(useGameStore.getState().device.mode, false);
                  resetControlsUsed();
                  setOverlay("tutorial");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 py-2.5 text-[11px] font-bold text-cyan"
              >
                <HelpCircle className="h-3.5 w-3.5" /> Replay tutorial for this device
              </button>
            </div>
          )}

          {tab === "graphics" && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[11px] font-bold text-white">Graphics quality</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {QUALITIES.map((level) => (
                    <button
                      key={level}
                      onClick={() => setQuality(level)}
                      className={`rounded-lg border py-2 text-[10px] font-bold capitalize transition-all ${
                        quality === level
                          ? "border-cyan/50 bg-cyan/15 text-cyan shadow-[0_0_16px_rgba(0,212,255,0.2)]"
                          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  Auto scales render distance and shadows per device. Higher quality streams more chunks.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "FPS target", value: "60 / 120+" },
                  { label: "Render", value: "Chunked LOD" },
                  { label: "Shadows", value: "Dynamic" },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">{row.label}</p>
                    <p className="text-[11px] font-bold text-white">{row.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { resetAll(); resetControlsUsed(); }}
                className="flex items-center gap-2 rounded-xl border border-rose-400/20 px-3 py-2 text-[11px] font-bold text-rose-300 hover:bg-rose-400/10"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset all settings
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 p-4">
          <p className="flex items-center gap-1 text-[10px] text-emerald-300">
            <Check className="h-3 w-3" /> Saved automatically
          </p>
          <button
            onClick={() => setOverlay(null)}
            className="rounded-xl bg-gradient-to-r from-cyan to-violet px-5 py-2 text-[11px] font-bold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
