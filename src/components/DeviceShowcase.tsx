"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Gamepad2, Monitor, Smartphone, ArrowRight, Sparkles, Check, Wifi,
  Move, Eye, MousePointerClick, Hand,
} from "lucide-react";
import { useDeviceMode } from "@/hooks/useDeviceMode";
import type { DeviceMode } from "@/lib/device";

const DEVICE_CARDS: Array<{
  id: DeviceMode;
  name: string;
  subtitle: string;
  icon: typeof Monitor;
  accent: string;
  actions: string[];
}> = [
  {
    id: "pc",
    name: "PC / Mac",
    subtitle: "Keyboard + mouse",
    icon: Monitor,
    accent: "cyan",
    actions: ["WASD to move", "Mouse to look", "LMB mine / RMB place", "1–8, scroll, F, Esc"],
  },
  {
    id: "mobile",
    name: "Android / iOS",
    subtitle: "Touch screen",
    icon: Smartphone,
    accent: "violet",
    actions: ["Left thumb-stick", "Swipe right side to look", "Mine / place buttons", "Jump + fly controls"],
  },
  {
    id: "controller",
    name: "Controller",
    subtitle: "Cross-platform pad",
    icon: Gamepad2,
    accent: "gold",
    actions: ["Sticks move + aim", "RT mine / LT place", "A jump, B fly, X descend", "LB / RB cycle blocks"],
  },
];

const ACCENTS: Record<string, { ring: string; text: string; bg: string; glow: string; dot: string }> = {
  cyan: {
    ring: "border-cyan/50",
    text: "text-cyan",
    bg: "bg-cyan/10",
    glow: "shadow-[0_24px_70px_rgba(0,212,255,0.18)]",
    dot: "bg-cyan",
  },
  violet: {
    ring: "border-violet/50",
    text: "text-violet",
    bg: "bg-violet/10",
    glow: "shadow-[0_24px_70px_rgba(139,92,246,0.18)]",
    dot: "bg-violet",
  },
  gold: {
    ring: "border-gold/50",
    text: "text-gold",
    bg: "bg-gold/10",
    glow: "shadow-[0_24px_70px_rgba(240,192,80,0.18)]",
    dot: "bg-gold",
  },
};

export default function DeviceShowcase() {
  const { device, detected } = useDeviceMode();
  const [counts, setCounts] = useState({ pc: 18422, mobile: 32011, controller: 6754 });

  useEffect(() => {
    fetch("/api/device-sessions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.counts) setCounts(data.counts);
      })
      .catch(() => undefined);
  }, []);

  const active = detected ? device.mode : null;

  return (
    <section className="relative w-full px-6 py-20 md:px-16 lg:px-24" id="controls">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full glass border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
              <Sparkles className="h-3 w-3" /> Zero setup
            </div>
            <h3 className="text-3xl font-black text-white md:text-5xl">
              Your controls, <span className="text-gradient">detected live</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              The sandbox fingerprints your active input on load and keeps listening. Touch the screen, press a key, or
              plug in a controller and the entire HUD swaps instantly — no setup menus, ever.
            </p>
          </div>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan to-violet px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,212,255,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(0,212,255,0.4)]"
          >
            Launch sandbox <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Live detection strip */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl glass-strong border border-white/10 px-4 py-3">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" /> Listening
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-xs text-white">
            {detected ? (
              <>
                Active layout: <span className="font-bold capitalize">{active === "pc" ? "Keyboard + Mouse" : active}</span>
                {device.gamepadName ? <span className="text-slate-400"> • {device.gamepadName}</span> : null}
                <span className="text-slate-400"> • {device.platform}</span>
              </>
            ) : (
              "Detecting input device…"
            )}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {device.touch && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet/25 bg-violet/10 px-2.5 py-1 text-[10px] font-semibold text-violet">
                <Smartphone className="h-3 w-3" /> touch capable
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                device.gamepad
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              <Gamepad2 className="h-3 w-3" /> {device.gamepad ? "controller connected" : "no controller"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan/25 bg-cyan/10 px-2.5 py-1 text-[10px] font-semibold text-cyan">
              <Check className="h-3 w-3" /> auto
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {DEVICE_CARDS.map((card) => {
            const Icon = card.icon;
            const tone = ACCENTS[card.accent];
            const isActive = active === card.id;
            return (
              <div
                key={card.id}
                className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${
                  isActive
                    ? `${tone.ring} ${tone.bg} ${tone.glow} -translate-y-1`
                    : "border-white/5 bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/15"
                }`}
              >
                {isActive && (
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white">
                    <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${tone.dot}`} /> Detected
                  </div>
                )}
                <div
                  className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl border transition-colors ${
                    isActive ? `${tone.ring} ${tone.bg}` : "border-white/10 bg-white/5"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? tone.text : "text-slate-300"}`} />
                </div>
                <h4 className="text-lg font-black text-white">{card.name}</h4>
                <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isActive ? tone.text : "text-slate-500"}`}>
                  {card.subtitle}
                </p>
                <ul className="mt-4 space-y-2">
                  {card.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <Move className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-600" />
                      {action}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Sessions detected</span>
                  <span className="font-mono text-xs font-bold text-white">{counts[card.id].toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: MousePointerClick, title: "Plug & play", copy: "Gamepad API + pointer media queries run in the background." },
            { icon: Eye, title: "Mid-session swaps", copy: "Switch input at any time — HUD, hints and sensitivity follow." },
            { icon: Hand, title: "No menus", copy: "Detection is confirmed by real input, not device strings alone." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl glass border border-white/5 p-4">
              <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan" />
              <div>
                <p className="text-xs font-bold text-white">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
