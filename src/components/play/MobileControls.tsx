"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, Blocks, ChevronsDown, Footprints, Package, Pickaxe, Repeat2, Wind,
} from "lucide-react";
import { input, queueAction } from "@/lib/input";
import { useGameStore } from "@/lib/store";

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const lastSprint = useRef(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      input.touchMove.x = 0;
      input.touchMove.y = 0;
      input.sprintHeld = false;
    };
  }, []);

  const update = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const max = rect.width / 2 - 14;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const length = Math.hypot(dx, dy);
    if (length > max) {
      dx = (dx / length) * max;
      dy = (dy / length) * max;
    }
    setKnob({ x: dx, y: dy });
    const nx = dx / max;
    const ny = dy / max;
    input.touchMove.x = Math.abs(nx) < 0.08 ? 0 : nx;
    input.touchMove.y = Math.abs(ny) < 0.08 ? 0 : -ny;
    const sprinting = Math.hypot(nx, ny) > 0.9;
    input.sprintHeld = sprinting;

    const state = useGameStore.getState();
    if (Math.hypot(nx, ny) > 0.2) state.markControl("move");
    if (sprinting && !lastSprint.current) state.markControl("sprint");
    lastSprint.current = sprinting;
  };

  const release = () => {
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    input.touchMove.x = 0;
    input.touchMove.y = 0;
    input.sprintHeld = false;
  };

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1.5">
      <div
        ref={baseRef}
        onPointerDown={(event) => {
          event.stopPropagation();
          pointerId.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (pointerId.current !== event.pointerId) return;
          event.stopPropagation();
          update(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          release();
        }}
        onPointerCancel={release}
        className="relative h-32 w-32 touch-none rounded-full border border-white/15 bg-black/25 shadow-[inset_0_0_30px_rgba(0,212,255,0.12)] backdrop-blur-md"
      >
        <div className="absolute inset-3 rounded-full border border-dashed border-white/10" />
        <div
          className="absolute left-1/2 top-1/2 grid h-14 w-14 place-items-center rounded-full border border-cyan/40 bg-gradient-to-br from-cyan/30 to-violet/30 shadow-[0_0_20px_rgba(0,212,255,0.35)]"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        >
          <div className="h-4 w-4 rounded-full bg-white/70" />
        </div>
      </div>
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">Move · push to sprint</span>
    </div>
  );
}

function ActionButton({
  onPress, onRelease, icon: Icon, label, tone = "default", size = "normal", hint,
}: {
  onPress: () => void;
  onRelease?: () => void;
  icon: typeof Pickaxe;
  label: string;
  tone?: "default" | "cyan" | "violet" | "gold" | "emerald";
  size?: "normal" | "large";
  hint?: boolean;
}) {
  const tones: Record<string, string> = {
    default: "border-white/15 bg-black/25 text-white",
    cyan: "border-cyan/40 bg-cyan/15 text-cyan shadow-[0_0_18px_rgba(0,212,255,0.25)]",
    violet: "border-violet/40 bg-violet/15 text-violet shadow-[0_0_18px_rgba(139,92,246,0.25)]",
    gold: "border-gold/40 bg-gold/15 text-gold shadow-[0_0_18px_rgba(240,192,80,0.25)]",
    emerald: "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.25)]",
  };
  const dimension = size === "large" ? "h-[68px] w-[68px]" : "h-14 w-14";

  return (
    <button
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress();
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        onRelease?.();
      }}
      onPointerCancel={(event) => {
        event.stopPropagation();
        onRelease?.();
      }}
      onContextMenu={(event) => event.preventDefault()}
      className={`${dimension} relative touch-none select-none rounded-2xl border backdrop-blur-md transition-transform active:scale-90 ${tones[tone]} ${
        hint ? "ring-2 ring-cyan/40 ring-offset-2 ring-offset-transparent" : ""
      }`}
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-0.5">
        <Icon className={size === "large" ? "h-6 w-6" : "h-5 w-5"} />
        <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">{label}</span>
      </div>
    </button>
  );
}

export default function MobileControls() {
  const fly = useGameStore((s) => s.fly);
  const toggleFly = useGameStore((s) => s.toggleFly);
  const cycleSelected = useGameStore((s) => s.cycleSelected);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const overlay = useGameStore((s) => s.overlay);
  const markControl = useGameStore((s) => s.markControl);
  const used = useGameStore((s) => s.controlsUsed);
  const hint = (id: string) => !used[id] && overlay === null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex animate-fade-in items-end justify-between gap-3 p-3 pb-24 sm:p-5">
      <Joystick />

      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <ActionButton
            icon={Repeat2}
            label="Blocks"
            onPress={() => {
              cycleSelected(1);
              markControl("select");
            }}
          />
          <ActionButton
            icon={Package}
            label="Bag"
            tone={hint("inventory") ? "violet" : "default"}
            hint={hint("inventory")}
            onPress={() => {
              markControl("inventory");
              setOverlay("inventory");
            }}
          />
          <ActionButton icon={Wind} label={fly ? "Fly on" : "Fly"} tone={fly ? "violet" : "default"} onPress={toggleFly} />
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            icon={Footprints}
            label="Sprint"
            onPress={() => {
              input.sprintHeld = true;
              markControl("sprint");
            }}
            onRelease={() => {
              input.sprintHeld = false;
            }}
          />
          <ActionButton
            icon={Pickaxe}
            label="Mine"
            tone={hint("break") ? "gold" : "default"}
            hint={hint("break")}
            onPress={() => {
              queueAction("mine");
              markControl("break");
            }}
          />
          <ActionButton
            icon={Blocks}
            label="Build"
            tone={hint("place") ? "cyan" : "default"}
            hint={hint("place")}
            onPress={() => {
              queueAction("place");
              markControl("place");
            }}
          />
        </div>
        <div className="flex items-end gap-2">
          {fly && (
            <ActionButton
              icon={ChevronsDown}
              label="Down"
              onPress={() => {
                input.descendHeld = true;
              }}
              onRelease={() => {
                input.descendHeld = false;
              }}
            />
          )}
          <ActionButton
            icon={ArrowUp}
            label="Jump"
            size="large"
            tone={hint("jump") ? "emerald" : "cyan"}
            hint={hint("jump")}
            onPress={() => {
              input.jumpHeld = true;
              markControl("jump");
            }}
            onRelease={() => {
              input.jumpHeld = false;
            }}
          />
        </div>
      </div>
    </div>
  );
}
