"use client";

import Link from "next/link";
import {
  ArrowRight, Castle, Compass, Boxes, Diamond, Gamepad2, Globe2, Keyboard,
  Map, Mountain, Pickaxe, ShieldQuestion, Smartphone, Sparkles, TreePine,
  Waves, Snowflake, Sun, MapPin, Users, Package, MousePointerClick, Footprints, Wind,
} from "lucide-react";

const BIOMES = [
  { name: "Forests", icon: TreePine, color: "text-emerald-400", copy: "Dense oak canopies, logs and village paths." },
  { name: "Deserts", icon: Sun, color: "text-amber-300", copy: "Dunes, cacti and buried treasure." },
  { name: "Mountains", icon: Mountain, color: "text-slate-300", copy: "Ridged peaks with snow caps and cave mouths." },
  { name: "Oceans", icon: Waves, color: "text-cyan", copy: "Endless water, islands and underwater caves." },
  { name: "Snow Biomes", icon: Snowflake, color: "text-sky-200", copy: "Frozen plains, pines and icy lakes." },
  { name: "Caves", icon: Diamond, color: "text-violet", copy: "3D-noise carved tunnels holding gold and crystal." },
];

const DISCOVERIES = [
  { name: "NPC Villages", icon: Castle, copy: "Houses, lamps, gravel roads and chests inside." },
  { name: "Dungeons", icon: ShieldQuestion, copy: "Underground brick rooms with obsidian pillars and loot." },
  { name: "Buried Treasure", icon: MapPin, copy: "Hidden caches you can find via the landmark compass." },
  { name: "Ancient Spires", icon: Sparkles, copy: "Floating crystal landmarks visible across biomes." },
];

export default function OpenWorldShowcase() {
  return (
    <section className="relative w-full px-6 py-20 md:px-16 lg:px-24" id="openworld">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full glass border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
              <Globe2 className="h-3 w-3" /> True open world
            </div>
            <h3 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">
              One infinite world. <span className="text-gradient">No loading screens.</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              Terrain, caves, oceans and villages stream in as you walk. Build anywhere, then share the exact same
              persistent world with friends on mobile, PC, Mac or a controller — the seed and every block you place
              live on the server.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Infinite chunks", icon: Boxes },
              { label: "Cross-platform", icon: Gamepad2 },
              { label: "Persistent edits", icon: Users },
            ].map((pill) => (
              <span key={pill.label} className="inline-flex items-center gap-1.5 rounded-xl glass border border-white/5 px-3 py-2 text-[10px] font-bold text-slate-300">
                <pill.icon className="h-3.5 w-3.5 text-cyan" /> {pill.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {BIOMES.map((biome) => (
            <div key={biome.name} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15">
              <biome.icon className={`mb-3 h-5 w-5 ${biome.color}`} />
              <h4 className="text-sm font-bold text-white">{biome.name}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{biome.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {DISCOVERIES.map((item) => (
            <div key={item.name} className="rounded-2xl border border-gold/15 bg-gold/[0.04] p-4">
              <item.icon className="mb-3 h-5 w-5 text-gold" />
              <h4 className="text-sm font-bold text-white">{item.name}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.copy}</p>
            </div>
          ))}
        </div>

        {/* Tutorial + modalities */}
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 glass-strong p-5 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-cyan" />
              <h4 className="text-sm font-black text-white">First-session tutorial, automatic</h4>
              <span className="ml-auto rounded-full bg-cyan/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan">Interactive</span>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-slate-400">
              The first time you play on a new device the game opens an interactive guide and ticks each step off as
              you actually perform it — no manual setup, no menus to hunt through.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
                  <Keyboard className="h-3 w-3" /> PC / Mac
                </p>
                <ul className="space-y-1 text-[10px] text-slate-300">
                  {[
                    ["W A S D", "Move"], ["Space", "Jump"], ["Shift", "Sprint"], ["Ctrl", "Crouch"],
                    ["LMB", "Break / attack"], ["RMB", "Place / use"], ["Mouse", "Look around"],
                    ["E", "Inventory"], ["F", "Interact"], ["Q", "Drop item"], ["Esc", "Pause menu"],
                  ].map(([key, label]) => (
                    <li key={key} className="flex items-center justify-between gap-2">
                      <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white">{key}</kbd>
                      <span className="text-slate-400">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                  <Smartphone className="h-3 w-3" /> Android / iOS
                </p>
                <ul className="space-y-1.5 text-[10px] text-slate-300">
                  {[
                    { icon: Gamepad2, text: "Virtual joystick to move" },
                    { icon: Compass, text: "Swipe the screen to look" },
                    { icon: Footprints, text: "Jump button" },
                    { icon: Wind, text: "Sprint button / push stick" },
                    { icon: Pickaxe, text: "Attack button to mine" },
                    { icon: Boxes, text: "Build button to place" },
                    { icon: Package, text: "Inventory button" },
                  ].map((row) => (
                    <li key={row.text} className="flex items-center gap-2">
                      <row.icon className="h-3 w-3 text-violet" /> {row.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 glass-strong p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                <Users className="h-4 w-4 text-cyan" /> Two ways to play
              </h4>
              {[
                { title: "Shared open world", copy: "Public server world. Everyone’s blocks persist and players appear live.", icon: Globe2 },
                { title: "Offline single-player", copy: "No connection? The same infinite generator runs locally.", icon: Map },
              ].map((mode) => (
                <div key={mode.title} className="mb-2 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <mode.icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan" />
                  <div>
                    <p className="text-[11px] font-bold text-white">{mode.title}</p>
                    <p className="text-[10px] leading-relaxed text-slate-400">{mode.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-violet/20 bg-violet/[0.07] p-4">
              <h4 className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-white">
                <MousePointerClick className="h-3.5 w-3.5 text-violet" /> Rebind everything
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-400">
                Any key (and sensitivity) can be changed in Settings at any time. Detection still switches layouts
                automatically when you change input hardware.
              </p>
              <Link href="/play?tutorial=1" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan to-violet py-2 text-[11px] font-bold text-white">
                Play the tutorial <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
