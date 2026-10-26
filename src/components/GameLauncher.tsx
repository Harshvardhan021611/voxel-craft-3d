"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Palette, Globe, X, User, Sparkles, Check } from "lucide-react";

export default function GameLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Explorer");
  const [mode, setMode] = useState("survival");

  const steps = [
    { title: "Select Mode", desc: "Choose how you want to play" },
    { title: "Character", desc: "Customize your identity" },
    { title: "Ready", desc: "Launch into the voxel world" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-2xl glass-strong border border-cyan/20 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(0,212,255,0.4)] active:scale-95 md:inline-flex"
      >
        <Sparkles className="w-4 h-4 text-cyan" />
        Quick Launch
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-void/80 backdrop-blur-xl" />
          <div
            className="relative z-10 w-full max-w-lg glass-strong rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,212,255,0.15)] border border-white/10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              {[0, 1, 2].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= step ? "bg-gradient-to-r from-cyan to-violet" : "bg-white/10"}`} />
              ))}
            </div>

            <h2 className="text-3xl font-black text-white mb-1">{steps[step].title}</h2>
            <p className="text-sm text-slate-400 mb-8">{steps[step].desc}</p>

            {step === 0 && (
              <div className="space-y-3">
                {[
                  { id: "survival", label: "Survival Mode", icon: Shield, desc: "Gather, craft, survive monsters" },
                  { id: "creative", label: "Creative Mode", icon: Palette, desc: "Unlimited resources. Build freely." },
                  { id: "multiplayer", label: "Multiplayer", icon: Globe, desc: "Join servers with friends" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setStep(1); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${
                      mode === m.id ? "bg-cyan/10 border-cyan/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]" : "glass border-white/5 hover:border-white/15 hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === m.id ? "bg-cyan/20" : "bg-white/5"}`}>
                      <m.icon className="w-5 h-5 text-cyan" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{m.label}</h4>
                      <p className="text-xs text-slate-400">{m.desc}</p>
                    </div>
                    {mode === m.id && <Check className="w-5 h-5 text-cyan ml-auto" />}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl glass-strong border border-cyan/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                    <User className="w-10 h-10 text-cyan" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">Player Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-cyan/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Explorer", desc: "Balanced starter" },
                    { label: "Architect", desc: "Extra building blocks" },
                    { label: "Warrior", desc: "Combat bonus" },
                  ].map(role => (
                    <button key={role.label} className="p-3 rounded-2xl glass border border-white/5 hover:border-cyan/30 hover:bg-cyan/5 transition-all text-center">
                      <h5 className="text-sm font-bold text-white">{role.label}</h5>
                      <p className="text-[10px] text-slate-400">{role.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto rounded-full glass-strong border border-cyan/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,212,255,0.2)] animate-pulse-glow">
                  <Sparkles className="w-10 h-10 text-cyan animate-float" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">World Ready</h3>
                <p className="text-sm text-slate-400 mb-6">{name} is entering <span className="text-cyan font-bold">{mode}</span> mode.</p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-xl glass border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase">World Type</p>
                    <p className="text-sm font-bold text-white">Procedural</p>
                  </div>
                  <div className="p-3 rounded-xl glass border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase">Size</p>
                    <p className="text-sm font-bold text-white">Infinite</p>
                  </div>
                  <div className="p-3 rounded-xl glass border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase">Players</p>
                    <p className="text-sm font-bold text-white">Up to 20</p>
                  </div>
                  <div className="p-3 rounded-xl glass border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase">Seed</p>
                    <p className="text-sm font-bold text-white">Random</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 rounded-xl glass border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (step < 2) setStep(s => s + 1);
                  else router.push("/play");
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan to-violet shadow-[0_0_25px_rgba(0,212,255,0.25)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all hover:-translate-y-0.5`}
              >
                {step < 2 ? "Continue" : "Launch Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
