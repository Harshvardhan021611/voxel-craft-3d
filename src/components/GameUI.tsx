"use client";
import { useState, useEffect } from "react";
import { Sparkles, Shield, Palette, Globe, Zap, Trophy, Crown, Users, Box, Mountain, TreePine, Sword, Building2, Gem, ArrowRight, Gamepad2 } from "lucide-react";

export default function GameUI() {
  const [hoverMode, setHoverMode] = useState<string | null>(null);
  const [stats, setStats] = useState({ online: 48239, worlds: 128430, blocks: 5000 });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(s => ({ ...s, online: s.online + Math.floor(Math.random() * 30 - 10) }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const modes = [
    { id: "survival", label: "Survival Mode", desc: "Gather resources, survive monsters, build a life.", icon: Shield, color: "from-amber-500/20 to-orange-600/20", glow: "shadow-amber-500/20", border: "border-amber-500/20" },
    { id: "creative", label: "Creative Mode", desc: "Unlimited blocks, fly freely, build anything.", icon: Palette, color: "from-violet-500/20 to-purple-600/20", glow: "shadow-violet-500/20", border: "border-violet-500/20" },
    { id: "multiplayer", label: "Multiplayer", desc: "Join global servers with friends. Cross-play enabled.", icon: Globe, color: "from-cyan-500/20 to-blue-600/20", glow: "shadow-cyan-500/20", border: "border-cyan-500/20" },
  ];

  const features = [
    { label: "Infinite Worlds", value: "Procedurally Generated", icon: Mountain },
    { label: "Block Types", value: "5,000+ Unique", icon: Box },
    { label: "Daily Quests", value: "AI Generated", icon: Zap },
    { label: "Achievements", value: "200+ Unlocks", icon: Trophy },
    { label: "Online Now", value: `${stats.online.toLocaleString()} Players`, icon: Users },
    { label: "Active Worlds", value: `${stats.worlds.toLocaleString()}`, icon: Globe },
  ];

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="w-full pt-8 pb-4 px-6 md:px-12 lg:px-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl glass-strong flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)] animate-pulse-glow">
            <Box className="w-6 h-6 text-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">VOXEL<span className="text-cyan">CRAFT</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">3D Sandbox</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Open World", href: "#openworld" },
            { label: "Controls", href: "#controls" },
            { label: "Features", href: "#features" },
            { label: "Multiplayer", href: "#multiplayer" },
          ].map((item) => (
            <a key={item.label} href={item.href} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-300">
              {item.label}
            </a>
          ))}
          <a href="/play" className="ml-3 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan/80 to-violet/80 text-white shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-300 hover:-translate-y-0.5">
            Play Now
          </a>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 relative">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet/10 rounded-full blur-[120px] -z-10" />

        <div className="text-center max-w-5xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/5 mb-8 text-xs font-semibold text-cyan tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Voxel Engine — Cross-Platform
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-6">
            BUILD BEYOND
            <br />
            <span className="text-gradient">THE HORIZON</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            An infinite procedural sandbox combining the simplicity of classic voxel games with AAA graphics, AI-driven worlds, and true cross-platform multiplayer.
          </p>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-3 gap-4 mb-14 max-w-4xl mx-auto">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = hoverMode === m.id;
              return (
                <button
                  key={m.id}
                  onMouseEnter={() => setHoverMode(m.id)}
                  onMouseLeave={() => setHoverMode(null)}
                  className={`relative group text-left p-6 rounded-3xl glass-strong border transition-all duration-500 overflow-hidden ${
                    isActive ? `scale-[1.03] ${m.glow} shadow-xl ${m.border}` : "hover:scale-[1.02] hover:shadow-lg hover:border-white/10"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-white/15 transition-colors`}>
                      <Icon className="w-6 h-6 text-cyan group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{m.label}</h3>
                    <p className="text-sm text-slate-400">{m.desc}</p>
                  </div>
                  <div className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-cyan to-violet scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </button>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            {features.map((f) => (
              <div key={f.label} className="glass rounded-2xl px-5 py-3 md:px-6 md:py-4 flex flex-col items-center min-w-[130px] hover:scale-105 transition-transform duration-300">
                <f.icon className="w-5 h-5 text-cyan mb-2 opacity-80" />
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{f.label}</span>
                <span className="text-sm md:text-base font-bold text-white">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/play"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan to-violet text-sm font-bold text-white shadow-[0_0_34px_rgba(0,212,255,0.3)] hover:shadow-[0_0_54px_rgba(0,212,255,0.45)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Enter the Sandbox
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#controls"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl glass border border-white/10 text-sm font-bold text-slate-200 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <Gamepad2 className="w-4 h-4 text-cyan" />
              Controls auto-detect
            </a>
          </div>
        </div>
      </main>

      {/* Feature Showcase Section */}
      <section className="w-full px-6 md:px-16 lg:px-24 py-24 relative" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">Everything You Can <span className="text-gradient">Imagine</span></h3>
            <p className="text-slate-400 max-w-xl mx-auto">From simple houses to entire cities, from peaceful farming to intense boss battles — build your story.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Procedural Worlds", desc: "Infinite terrain generated in real-time with unique biomes, caves, and structures.", icon: Mountain },
              { title: "5,000+ Blocks", desc: "Decorative, structural, and functional blocks with realistic physics.", icon: Box },
              { title: "AI Quest System", desc: "Dynamic storylines that adapt to your playstyle and world state.", icon: Zap },
              { title: "Cross-Platform", desc: "Play seamlessly across mobile, PC, console, and web browsers.", icon: Globe },
              { title: "Survival & Creative", desc: "Switch modes anytime. Build peacefully or survive the night.", icon: Palette },
              { title: "Blueprints", desc: "Save, share, and paste complex structures instantly with copy-paste tools.", icon: Building2 },
              { title: "Farming & Breeding", desc: "Plant crops, raise animals, and grow your own food ecosystem.", icon: TreePine },
              { title: "Boss Dungeons", desc: "Procedurally generated dungeons with unique loot and AI-driven bosses.", icon: Sword },
            ].map((feat) => (
              <div key={feat.title} className="group glass rounded-3xl p-6 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-shadow">
                  <feat.icon className="w-5 h-5 text-cyan" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{feat.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Graphics Showcase */}
      <section className="w-full px-6 md:px-16 lg:px-24 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-[150px]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-violet/10 rounded-full blur-[150px]" />
          <div className="glass-strong rounded-[3rem] overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">Ultra HD Graphics</h3>
                <ul className="space-y-4">
                  {[
                    "Dynamic Shadow Mapping (PC + Mobile)",
                    "Realistic Water & Volumetric Clouds",
                    "HDR Skybox with Day/Night Cycle",
                    "Real-Time Ray Tracing (High-End)",
                    "Smooth 60 FPS on Mobile / 120+ FPS on PC",
                    "Adaptive Quality Scaling (Low to Ultra)",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0 shadow-[0_0_6px_#00d4ff]" />
                      <span className="text-sm md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex gap-3">
                  {["Low", "Medium", "High", "Ultra"].map(level => (
                    <span key={level} className={`px-3 py-1 rounded-full text-xs font-bold border ${level === "Ultra" ? "border-cyan/40 text-cyan bg-cyan/10" : "border-white/10 text-slate-400 bg-white/5"}`}>
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-[400px] lg:h-auto bg-gradient-to-br from-deep via-deep-2 to-deep-3 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" alt="Voxel landscape" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-2/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan font-bold mb-1">Performance</p>
                  <div className="flex gap-6">
                    <div><p className="text-2xl font-black text-white">60 FPS</p><p className="text-xs text-slate-400">Mobile Target</p></div>
                    <div><p className="text-2xl font-black text-white">120+</p><p className="text-xs text-slate-400">PC Target</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace / Monetization */}
      <section className="w-full px-6 md:px-16 lg:px-24 py-24 relative">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-4">Market & <span className="text-gradient">Customizations</span></h3>
          <p className="text-slate-400 max-w-lg mx-auto">Support the game and express yourself. 100% cosmetic — zero pay-to-win.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { title: "Cosmetic Skins", desc: "Character and block texture skins from common to legendary rarity.", price: "Free — Premium", icon: Gem },
            { title: "Building Packs", desc: "Curated architecture sets: castles, modern cities, space stations.", price: "$2.99 — $14.99", icon: Building2 },
            { title: "Premium Pass", desc: "Daily rewards, exclusive AI quests, cloud saves, and private worlds.", price: "$4.99 / month", icon: Crown },
          ].map(card => (
            <div key={card.title} className="glass-strong rounded-3xl p-8 border border-white/5 hover:border-cyan/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,212,255,0.1)] group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="w-7 h-7 text-cyan" />
              </div>
              <h4 className="text-xl font-black text-white mb-3">{card.title}</h4>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">{card.desc}</p>
              <span className="text-2xl font-black text-gradient">{card.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 md:px-16 lg:px-24 py-12 border-t border-white/5 glass">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg glass-strong flex items-center justify-center">
              <Box className="w-5 h-5 text-cyan" />
            </div>
            <span className="font-black text-lg text-white">VOXEL<span className="text-cyan">CRAFT</span></span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 uppercase tracking-wider font-medium">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
          </div>
          <p className="text-xs text-slate-600">Built for the future of voxel gaming.</p>
        </div>
      </footer>
    </div>
  );
}
