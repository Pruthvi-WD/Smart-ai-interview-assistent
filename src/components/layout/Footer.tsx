import { BrainCircuit, ShieldCheck, Zap, Activity, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/40 backdrop-blur-2xl py-14 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-heading">
                AI<span className="text-emerald-400">SPOTLIGHT</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Enterprise-grade AI mock interview engine featuring spoken voice synthesis, optical lip-motion active speaker isolation, and on-device NLP minutes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Speech Synthesis Online
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-bold text-purple-400">
                <ShieldCheck className="w-3 h-3" />
                100% Local Confidential
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white font-heading">Studio Tracks</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Software Architecture</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">AI / MLOps Systems</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Product & Strategy</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Executive Leadership</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white font-heading">Telemetry & AI</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3 h-3 text-emerald-400" />
                Voice Question Prompter
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Activity className="w-3 h-3 text-emerald-400" />
                Lip-Sync Motion Isolation
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                On-Device Executive Minutes
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider uppercase text-white font-heading">Session Actions</h4>
            <div className="space-y-2">
              <Link 
                to="/dashboard" 
                className="block p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-all text-xs font-bold text-white text-center"
              >
                Launch New Session →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} AI Spotlight Executive Studio. Calibrated for High-Stakes Technical Rounds.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground/80">Local NLP Architecture</span>
            <span>•</span>
            <span className="text-[11px] text-muted-foreground/80">Zero Corporate Audio Logging</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
