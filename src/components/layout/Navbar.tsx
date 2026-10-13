import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogOut, User as UserIcon, ShieldCheck, Layers, Play, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle, logout } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pb-2 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="glass-panel rounded-full px-5 sm:px-7 h-16 sm:h-18 flex items-center justify-between border border-purple-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
          {/* Left: Quick Pill Navigation (like Image 1) */}
          <div className="hidden lg:flex items-center gap-2">
            <Link 
              to="/dashboard"
              className="px-4 py-1.5 rounded-full glass-panel border border-white/10 hover:border-purple-400/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Service</span>
              <span className="text-purple-400 text-sm font-bold">+</span>
            </Link>
            <Link 
              to="/history"
              className="px-4 py-1.5 rounded-full glass-panel border border-white/10 hover:border-purple-400/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Scorecards</span>
              <ArrowRight className="w-3 h-3 text-purple-400" />
            </Link>
          </div>

          {/* Center: Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 via-violet-600/30 to-fuchsia-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.35)] group-hover:scale-105 group-hover:border-purple-300 transition-all">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-400 rounded-full border-2 border-background animate-pulse" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                  AI<span className="text-purple-400">SPOTLIGHT</span>
                </span>
                <span className="hidden sm:inline-flex text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Right Actions (like Image 1 & 2) */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.08]">
              <Link 
                to="/dashboard" 
                className={`text-xs font-bold transition-all px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                  isActive('/dashboard') 
                    ? 'text-white bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cockpit
              </Link>
              
              <Link 
                to="/history" 
                className={`text-xs font-bold transition-all px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                  isActive('/history') 
                    ? 'text-white bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Records
              </Link>
            </nav>
            
            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2 bg-white/[0.03] py-1 px-2.5 rounded-full border border-white/[0.08]">
                  <Avatar className="w-7 h-7 border border-purple-400/40 ring-1 ring-purple-500/20">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-purple-500/30 text-purple-200 text-[10px] font-bold">
                      {profile?.displayName?.slice(0, 2).toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-white max-w-[90px] truncate">
                    {profile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || "Candidate"}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className="hover:bg-rose-500/15 hover:text-rose-400 text-slate-400 rounded-full text-xs font-semibold h-8 px-2.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={signInWithGoogle} 
                className="glow-btn-primary rounded-full px-5 h-9 text-xs font-black shadow-lg"
              >
                Sign In
              </Button>
            )}

            <Link to="/dashboard">
              <Button size="sm" className="glow-btn-primary rounded-full px-5 h-9 text-xs font-black flex items-center gap-1.5 shadow-lg">
                <Play className="w-3 h-3 fill-current" />
                Launch Session
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2.5 text-white bg-white/[0.05] border border-white/10 rounded-full"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 pointer-events-auto max-w-7xl mx-auto"
          >
            <div className="glass-panel rounded-3xl p-5 border border-purple-500/20 space-y-4">
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-white hover:bg-purple-500/15"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Studio Cockpit
              </Link>
              <Link 
                to="/history" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-white hover:bg-purple-500/15"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                Session Records
              </Link>
              
              <div className="pt-2 border-t border-white/10">
                {user ? (
                  <Button variant="outline" className="w-full rounded-2xl font-bold border-white/10" onClick={() => { logout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2 text-rose-400" />
                    Sign Out ({profile?.displayName || "Candidate"})
                  </Button>
                ) : (
                  <Button className="w-full glow-btn-primary rounded-2xl font-bold" onClick={() => { signInWithGoogle(); setIsOpen(false); }}>
                    Sign In With Google
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
