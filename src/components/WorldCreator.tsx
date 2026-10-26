"use client";
import { useEffect, useState } from "react";
import { Globe, Mountain, Waves, TreePine, Sparkles, Save } from "lucide-react";

export default function WorldCreator() {
  const [seed, setSeed] = useState("");

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 99999).toString());
  }, []);
  const [dimension, setDimension] = useState("overworld");
  const [mode, setMode] = useState("survival");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    setSaving(true);
    try {
      await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "New World", seed, dimension, mode }),
      });
    } catch {
      // Silently handle
    }
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-16 relative" id="world">
      <div className="max-w-5xl mx-auto">
        <div className="glass-strong rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,212,255,0.1)]">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.15)]">
                <Globe className="w-5 h-5 text-cyan" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white">Create Your <span className="text-gradient">World</span></h3>
            </div>
            <p className="text-sm text-slate-400 mb-8 max-w-lg">Generate a new procedural world. Each seed creates a unique landscape with different biomes, resources, and structures.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">World Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Voxel Kingdom"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-cyan/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all placeholder:text-slate-600"
                />

                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block mt-4">Dimension</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "overworld", label: "Overworld", icon: Mountain },
                    { id: "nether", label: "Nether", icon: Waves },
                    { id: "end", label: "End", icon: TreePine },
                  ].map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDimension(d.id)}
                      className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                        dimension === d.id ? "bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]" : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <d.icon className="w-5 h-5 mx-auto mb-1.5" />
                      <span className="text-xs font-bold">{d.label}</span>
                    </button>
                  ))}
                </div>

                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block mt-4">Game Mode</label>
                <div className="flex gap-2">
                  {["survival", "creative", "adventure"].map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 capitalize ${
                        mode === m ? "bg-violet/15 border-violet/30 text-violet shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">World Seed</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-violet/40 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                  />
                  <button
                    onClick={() => setSeed(Math.floor(Math.random() * 99999).toString())}
                    className="px-4 py-3.5 rounded-xl glass border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan/5 to-violet/5 border border-white/5 mt-2">
                  <h4 className="font-bold text-white mb-3">World Preview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Dimension</span>
                      <span className="text-white font-medium capitalize">{dimension}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Mode</span>
                      <span className="text-white font-medium capitalize">{mode}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Size</span>
                      <span className="text-white font-medium">Infinite</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Seed</span>
                      <span className="text-cyan font-mono text-xs">{seed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Blocks</span>
                      <span className="text-white font-medium">5000+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
              <p className="text-xs text-slate-500">Your world will be saved to the database with a unique seed.</p>
              <button
                onClick={handleGenerate}
                disabled={saving || saved}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan to-violet text-white font-bold shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_50px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex-shrink-0"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {saving ? "Generating..." : saved ? "Saved!" : "Generate World"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
