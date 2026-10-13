import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { 
  BrainCircuit, Mic, Video, BarChart3, ArrowRight, 
  ShieldCheck, Activity, Mail, CheckCircle2, Sliders, Sparkles, Lock,
  Volume2, Play, ChevronRight, Zap, Code2, LineChart, Server, Layers,
  Compass, Award, CheckSquare, RotateCcw, Trash2, Globe, Cpu, Users
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden pt-24 pb-20">
      {/* Radiant Background Aura and Ambient Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-purple-600/30 via-violet-700/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Pill Badge (Image 3: Take notes using AI / Image 1: Next-Level Business) */}
          <div className="flex justify-center mb-6">
            <div className="glow-pill px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-xl border border-purple-400/40">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span className="text-xs font-bold text-purple-200 tracking-wide font-mono">
                Next-Gen AI Interview Intelligence
              </span>
            </div>
          </div>

          {/* Central Hero Composition with 3D Liquid Chrome Orb & Typography */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            {/* Watermark Typographic Display (Image 1: INTELLIGENT) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden -z-10">
              <span className="text-7xl sm:text-9xl md:text-[13rem] font-black tracking-tighter text-white/[0.035] uppercase font-heading">
                INTELLIGENT
              </span>
            </div>

            {/* Glowing Curved Horizon / Aurora Beam (Image 3) */}
            <div className="w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-xs opacity-70 mb-4" />

            {/* Floating 3D Liquid Orb Graphic (Image 1) */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 my-2 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/30 to-indigo-500/40 blur-2xl animate-pulse" />
              <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full p-[2px] bg-gradient-to-br from-purple-300 via-fuchsia-400 to-indigo-600 shadow-[0_0_60px_rgba(168,85,247,0.55)] animate-orb">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0b0518] via-[#1a0b36] to-[#2e1065] flex items-center justify-center overflow-hidden relative">
                  {/* Chromatic Liquid Highlights */}
                  <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-purple-400/40 to-transparent blur-md" />
                  <div className="absolute bottom-2 right-2 w-28 h-28 rounded-full bg-gradient-to-tl from-fuchsia-500/40 to-transparent blur-md" />
                  <div className="absolute inset-6 rounded-full border border-white/20 blur-[0.5px]" />
                  <Sparkles className="w-12 h-12 text-purple-200 animate-pulse relative z-10" />
                </div>
              </div>
            </div>

            {/* Hero Main Headline (Image 1 & Image 3) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 max-w-4xl"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] font-heading">
                Boost Efficiency, <br />
                <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                  Maximize Interview Mastery.
                </span>
              </h1>
              
              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Use our AI prompter to synthesize spoken questions, isolate active mouth movements in real-time, and auto-compile executive scorecards.
              </p>

              {/* Call-To-Action Pill Cluster (Image 1 & Image 3) */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
                <Link to="/dashboard">
                  <Button className="glow-btn-primary h-13 px-8 text-sm sm:text-base font-black rounded-full flex items-center gap-2.5 shadow-[0_0_35px_rgba(139,92,246,0.6)]">
                    <span>Get Started</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  </Button>
                </Link>

                <Link to="/history">
                  <Button variant="outline" className="glass-panel h-13 px-6 text-sm font-bold rounded-full border-white/15 text-slate-200 hover:text-white hover:border-purple-400/50">
                    <Layers className="w-4 h-4 mr-2 text-purple-400" />
                    View Scorecards
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar Container (Image 1: 125k+ Happy Client | Join Now | 95% Growth | 25 Years | Trusted by...) */}
          <div className="mt-14 max-w-5xl mx-auto glass-panel rounded-full p-2.5 sm:p-3 border border-purple-500/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 px-4 py-1.5">
              <div>
                <div className="text-lg sm:text-xl font-black text-white font-heading">125k+</div>
                <div className="text-[10px] uppercase font-mono text-purple-300/80">Candidates Prepped</div>
              </div>
              <Link to="/dashboard">
                <button className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all">
                  Join Now
                </button>
              </Link>
              <div>
                <div className="text-lg sm:text-xl font-black text-white font-heading">98.5%</div>
                <div className="text-[10px] uppercase font-mono text-purple-300/80">Precision Rating</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg sm:text-xl font-black text-white font-heading">100%</div>
                <div className="text-[10px] uppercase font-mono text-purple-300/80">On-Device Privacy</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 text-xs text-slate-400 border-l border-white/10 font-mono">
              <span className="text-slate-300 font-semibold">Trusted by:</span>
              <span className="text-purple-300 font-bold">Profound</span> • 
              <span className="text-purple-300 font-bold">Upstash</span> • 
              <span className="text-purple-300 font-bold">OpenRouter</span> • 
              <span className="text-purple-300 font-bold">Consensus</span>
            </div>
          </div>

          {/* 4 Feature Suite Cards (Image 2 bottom row: AI Image Generator, Text Generator, Data Analyzer, Code Assistant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
            {[
              {
                icon: Volume2,
                title: "AI Voice Prompter",
                desc: "Spoken technical scenarios articulated aloud before answering timer starts.",
                badge: "Synthesized"
              },
              {
                icon: Activity,
                title: "Lip-Sync Isolation",
                desc: "Real-time computer vision isolates active speaker from background noise.",
                badge: "On-Device"
              },
              {
                icon: Trash2,
                title: "1-Click Answer Reset",
                desc: "Instant transcript purging to restart answers with zero latency.",
                badge: "Instant"
              },
              {
                icon: Mail,
                title: "Executive Scorecards",
                desc: "Local synthesis generating meeting minutes and hiring committee emails.",
                badge: "Automated"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-3xl glass-panel border border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-500/[0.04] transition-all shadow-lg group space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}
