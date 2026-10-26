"use client";
import { useState } from "react";
import { Box, Hammer, TreePine, Gem, Mountain, Waves, Lock, Check } from "lucide-react";

const blocks = [
  { id: "stone", name: "Stone", quantity: 128, icon: Mountain, color: "text-slate-300", bg: "bg-slate-700/30" },
  { id: "wood", name: "Oak Wood", quantity: 64, icon: TreePine, color: "text-amber-600", bg: "bg-amber-900/20" },
  { id: "grass", name: "Grass Block", quantity: 256, icon: Box, color: "text-emerald-400", bg: "bg-emerald-900/20" },
  { id: "diamond", name: "Diamond", quantity: 12, icon: Gem, color: "text-cyan-300", bg: "bg-cyan-900/20" },
  { id: "glass", name: "Glass", quantity: 32, icon: Waves, color: "text-blue-300", bg: "bg-blue-900/20" },
];

export default function BlockInventory() {
  const [selected, setSelected] = useState("stone");
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-16 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.15)]">
            <Hammer className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Block <span className="text-gradient">Inventory</span></h3>
            <p className="text-xs text-slate-400">Your crafting and building materials</p>
          </div>
        </div>

        <div className="glass-strong rounded-[2rem] p-6 md:p-8 border border-white/5">
          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {blocks.map((b) => {
              const isActive = selected === b.id;
              const isHover = hovered === b.id;
              return (
                <button
                  key={b.id}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(b.id)}
                  className={`relative group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "bg-white/10 border-cyan/40 shadow-[0_0_25px_rgba(0,212,255,0.15)] scale-105"
                      : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/5 hover:-translate-y-1"
                  }`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${b.bg} flex items-center justify-center shadow-inner transition-transform duration-300 ${isActive ? "rotate-3 scale-110" : "group-hover:rotate-6 group-hover:scale-105"}`}>
                    <b.icon className={`w-6 h-6 md:w-7 md:h-7 ${b.color}`} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xs md:text-sm font-bold text-white">{b.name}</h4>
                    <span className="text-[10px] md:text-xs text-slate-400 font-mono">{b.quantity}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-cyan" />
                    </div>
                  )}
                  <div className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-cyan to-violet transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"}`} />
                </button>
              );
            })}
          </div>

          {/* Selected Block Info */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-white">{blocks.find(b => b.id === selected)?.name}</h4>
                <p className="text-xs text-slate-400">A fundamental building block used for structures, decoration, and crafting.</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-sm font-bold text-white hover:bg-white/5 hover:border-cyan/20 transition-all hover:-translate-y-0.5">
                <Lock className="w-3.5 h-3.5 text-cyan" />
                Craft More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
