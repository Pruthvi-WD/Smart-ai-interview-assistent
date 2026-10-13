import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, ChevronRight, Loader2, ArrowLeft, RefreshCw, Trophy, ShieldCheck, Sparkles, Layers, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const path = "interviews";
    const q = query(
      collection(db, path),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterviews(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 pt-28">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-sm font-bold text-slate-300 font-heading">Loading past interview records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')} 
            className="mb-2 -ml-2 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-1.5 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Back to Studio Cockpit
          </Button>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-heading">
            Session Records
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Review historical scores, AI STAR rubrics, and executive minutes.</p>
        </div>

        <Button 
          onClick={() => navigate('/dashboard')}
          className="glow-btn-primary rounded-2xl px-6 h-11 text-xs font-black shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Launch New Session
        </Button>
      </div>
      
      {interviews.length === 0 ? (
        <div className="text-center py-24 glass-panel border border-white/10 rounded-3xl p-8 space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-black text-white">No Completed Sessions Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Select your domain discipline and difficulty tier to launch your first AI mock interview.
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={() => navigate('/dashboard')} size="lg" className="glow-btn-primary rounded-2xl px-8 font-black">
              Launch First Session →
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview, i) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/report/${interview.id}`)}
              className="p-6 rounded-3xl glass-panel border border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.04] transition-all cursor-pointer shadow-lg group flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-heading font-black text-lg sm:text-xl text-white group-hover:text-emerald-300 transition-colors">
                    {interview.jobTitle || "Software Engineer"}
                  </span>
                  <Badge className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 ${
                    interview.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    interview.difficulty === "hard" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  }`}>
                    {interview.difficulty || "medium"} Mode
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">{interview.subject || "Software Engineering"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(interview.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    On-Device Confidential
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5 self-end md:self-center">
                {interview.overallScore !== undefined && (
                  <div className="text-right">
                    <div className="text-2xl font-black font-heading text-emerald-400">
                      {interview.overallScore}%
                    </div>
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                      Composite Score
                    </div>
                  </div>
                )}
                
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 group-hover:border-emerald-400/40 transition-all">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
