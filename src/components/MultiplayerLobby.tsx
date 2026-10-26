"use client";
import { useState, useEffect } from "react";
import { Users, Globe, Wifi, MessageCircle, UserPlus, Crown } from "lucide-react";

export default function MultiplayerLobby() {
  const [stats, setStats] = useState({ online: 48239, worlds: 128430, servers: 142 });
  const [friends] = useState([
    { name: "PixelCraft", status: "online", world: "Crystal Peaks", level: 42 },
    { name: "BlockQueen", status: "online", world: "Sky Castle", level: 38 },
    { name: "VoxelKing", status: "away", world: "Nether Base", level: 55 },
    { name: "BuilderPro", status: "offline", world: "Overworld Hub", level: 27 },
  ]);
  const [publicWorlds] = useState([
    { name: "Global Arena", players: 120, mode: "Survival", ping: 12 },
    { name: "Creative Hub", players: 456, mode: "Creative", ping: 8 },
    { name: "Dungeon Raid", players: 89, mode: "Adventure", ping: 22 },
    { name: "Farm Life", players: 34, mode: "Survival", ping: 15 },
  ]);

  useEffect(() => {
    fetch("/api/game-stats")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setStats(s => ({ ...s, online: data.playersOnline || s.online, worlds: data.worldsActive || s.worlds }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-16 relative" id="multiplayer">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-5xl font-black text-white mb-4">Global <span className="text-gradient">Multiplayer</span></h3>
          <p className="text-slate-400 max-w-lg mx-auto">Cross-platform servers. Voice chat. Friends system. Play together anywhere.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Stats */}
          <div className="glass-strong rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-[0_20px_60px_rgba(0,212,255,0.08)]">
            <h4 className="font-black text-lg text-white mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan" />
              Network Status
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Online Players", value: stats.online.toLocaleString(), icon: Users },
                { label: "Active Worlds", value: stats.worlds.toLocaleString(), icon: Globe },
                { label: "Global Servers", value: stats.servers.toString(), icon: Wifi },
                { label: "Cross-Play", value: "Enabled", icon: Globe },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <item.icon className="w-5 h-5 text-cyan mb-2 opacity-80" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{item.label}</p>
                  <p className="text-xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Friends */}
          <div className="glass-strong rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-[0_20px_60px_rgba(139,92,246,0.08)]">
            <h4 className="font-black text-lg text-white mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-violet" />
              Friends Online
            </h4>
            <div className="space-y-3">
              {friends.map(friend => (
                <div key={friend.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet/20 transition-all hover:-translate-x-0.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet/20 to-cyan/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-violet">{friend.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-white truncate">{friend.name}</h5>
                      <span className={`w-1.5 h-1.5 rounded-full ${friend.status === "online" ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : friend.status === "away" ? "bg-amber-400" : "bg-slate-500"}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{friend.world} • Level {friend.level}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 rounded-xl glass border border-violet/20 text-violet text-xs font-bold hover:bg-violet/10 transition-colors flex items-center justify-center gap-2">
              <UserPlus className="w-3.5 h-3.5" />
              Add Friend
            </button>
          </div>

          {/* Public Worlds */}
          <div className="glass-strong rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-[0_20px_60px_rgba(240,192,80,0.08)]">
            <h4 className="font-black text-lg text-white mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              Featured Servers
            </h4>
            <div className="space-y-3">
              {publicWorlds.map(world => (
                <a
                  key={world.name}
                  href="#"
                  className="block p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/20 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-white text-sm">{world.name}</h5>
                    <span className="text-[10px] font-mono text-emerald-400">{world.ping}ms</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {world.players}</span>
                    <span className="uppercase tracking-wider">{world.mode}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
