import VoxelWorld from "@/components/VoxelWorld";
import GameUI from "@/components/GameUI";
import GameLauncher from "@/components/GameLauncher";
import AchievementsPanel from "@/components/AchievementsPanel";
import WorldCreator from "@/components/WorldCreator";
import BlockInventory from "@/components/BlockInventory";
import MultiplayerLobby from "@/components/MultiplayerLobby";
import DeviceShowcase from "@/components/DeviceShowcase";
import OpenWorldShowcase from "@/components/OpenWorldShowcase";
import { Sparkles, Trophy } from "lucide-react";

export default async function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-void overflow-hidden">
      {/* 3D Background */}
      <VoxelWorld />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-void/60 via-transparent to-void/90" />
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-void via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Content */}
      <GameUI />

      <GameLauncher />
      <div className="relative z-10">
        <AchievementsPanel />
        <WorldCreator />
        <BlockInventory />
        <OpenWorldShowcase />
        <DeviceShowcase />
        <MultiplayerLobby />
      </div>

      {/* Achievement Toast */}
      <div className="fixed bottom-20 left-6 z-40 hidden md:block">
        <div className="glass-strong rounded-2xl p-5 shadow-[0_20px_60px_rgba(139,92,246,0.15)] border border-violet/20 animate-float w-[260px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet/30 to-violet/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-violet" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Achievement Unlocked</p>
              <p className="text-[10px] text-violet">Master Builder</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Placed 10,000 unique blocks in a single world.</p>
        </div>
      </div>

      {/* Floating Feature Badge */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <div className="glass-strong rounded-2xl px-5 py-4 animate-float shadow-[0_20px_60px_rgba(0,212,255,0.15)] border border-cyan/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI World Generator</p>
              <p className="text-[10px] text-slate-400">Active in your region</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
