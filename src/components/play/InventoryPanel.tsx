"use client";

import { ArrowLeftRight, Box, Check, Package, X } from "lucide-react";
import { BLOCKS, PALETTE_IDS, blockInfo } from "@/lib/blocks";
import { useGameStore } from "@/lib/store";

export default function InventoryPanel() {
  const inventory = useGameStore((s) => s.inventory);
  const mode = useGameStore((s) => s.mode);
  const selected = useGameStore((s) => s.selected);
  const setSelected = useGameStore((s) => s.setSelected);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const dropSelected = useGameStore((s) => s.dropSelected);
  const mined = useGameStore((s) => s.blocksMined);
  const placed = useGameStore((s) => s.blocksPlaced);

  const paletteIndex = (id: number) => PALETTE_IDS.indexOf(id);

  return (
    <div className="absolute inset-0 z-50 grid place-items-center p-3 sm:p-5">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md" onClick={() => setOverlay(null)} />
      <div className="relative w-full max-w-xl animate-slide-up overflow-hidden rounded-3xl glass-strong border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet/15 text-violet">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Inventory</h2>
              <p className="text-[11px] text-slate-400">
                {mode === "creative" ? "Creative — unlimited blocks" : "Survival — mined resources"} · {mined} mined / {placed} placed
              </p>
            </div>
          </div>
          <button
            onClick={() => setOverlay(null)}
            aria-label="Close inventory"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin max-h-[54vh] overflow-y-auto p-5">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {BLOCKS.filter((block) => block.id !== 0).map((block) => {
              const count = inventory[block.id] ?? 0;
              const slot = paletteIndex(block.id);
              const active = slot >= 0 && slot === selected;
              return (
                <button
                  key={block.id}
                  onClick={() => slot >= 0 && setSelected(slot)}
                  disabled={slot < 0}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                    active
                      ? "border-cyan/50 bg-cyan/10 shadow-[0_0_18px_rgba(0,212,255,0.2)]"
                      : slot >= 0
                        ? "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/25"
                        : "cursor-default border-white/5 bg-white/[0.01] opacity-70"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-md"
                    style={{
                      background: `linear-gradient(145deg, ${block.color}, ${block.color}aa)`,
                      boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.25), 0 0 10px ${block.color}40`,
                    }}
                  />
                  <span className="text-[9px] font-bold leading-tight text-white">{block.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {mode === "creative" ? "∞" : count}
                  </span>
                  {active && <Check className="absolute right-1 top-1 h-3 w-3 text-cyan" />}
                  {slot >= 0 && (
                    <span className="absolute left-1 top-1 text-[8px] font-mono text-white/40">{slot + 1}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-white">
              <Box className="h-3.5 w-3.5 text-cyan" /> How to get more
            </p>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Mine blocks with the left mouse button / pickaxe, or find buried treasure and dungeons — chests contain
              rare blocks. Press <span className="text-cyan font-bold">F</span> or the interact button on a chest to loot it.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 p-4">
          <button
            onClick={dropSelected}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> Drop selected ({blockInfo(PALETTE_IDS[selected] ?? 1).name})
          </button>
          <button
            onClick={() => setOverlay(null)}
            className="rounded-xl bg-gradient-to-r from-cyan to-violet px-5 py-2 text-[11px] font-bold text-white"
          >
            Back to world
          </button>
        </div>
      </div>
    </div>
  );
}
