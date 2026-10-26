import { db } from "@/db";
import { achievements } from "@/db/schema";
import { Trophy, Lock } from "lucide-react";

interface AchievementItem {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  unlockedAt: Date | null;
}

export default async function AchievementsPanel() {
  let items: AchievementItem[] = [];
  try {
    const dbItems = await db.select().from(achievements).limit(5);
    items = dbItems.map((item) => ({
      id: item.id || 0,
      code: item.code || "CODE",
      title: item.title || "Achievement",
      description: item.description || "",
      unlockedAt: item.unlockedAt ? new Date(item.unlockedAt) : null,
    }));
  } catch {
    // Fallback sample data
    items = [
      { id: 1, code: "FIRST_BLOCK", title: "First Block", description: "Place your first voxel block.", unlockedAt: new Date() },
      { id: 2, code: "MASTER_BUILDER", title: "Master Builder", description: "Place 10,000 unique blocks.", unlockedAt: new Date() },
      { id: 3, code: "SURVIVOR", title: "Survivor", description: "Survive your first night.", unlockedAt: new Date() },
      { id: 4, code: "DUNGEON_HUNTER", title: "Dungeon Hunter", description: "Defeat a dungeon boss.", unlockedAt: null },
      { id: 5, code: "WORLD_CREATOR", title: "World Creator", description: "Generate a new world.", unlockedAt: new Date() },
    ];
  }

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-16 relative" id="achievements">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center shadow-[0_0_20px_rgba(240,192,80,0.15)]">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Achievements</h3>
            <p className="text-xs text-slate-400">Unlock rewards and track progress</p>
          </div>
          <span className="ml-auto text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full">Live DB</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((ach) => (
            <div
              key={ach.id}
              className={`glass rounded-2xl p-5 border transition-all duration-300 ${
                ach.unlockedAt ? "border-white/10 hover:border-gold/20" : "border-white/5 opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ach.unlockedAt ? "bg-gold/15 text-gold" : "bg-white/5 text-slate-500"}`}>
                  {ach.unlockedAt ? <Trophy className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-mono text-slate-500">{ach.code || "CODE"}</span>
              </div>
              <h4 className="font-bold text-white mb-1">{ach.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{ach.description}</p>
              {ach.unlockedAt && (
                <p className="text-[10px] text-gold font-medium">Unlocked • {new Date(ach.unlockedAt).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
