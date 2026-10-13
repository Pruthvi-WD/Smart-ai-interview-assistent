import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Play, History, 
  Code2, BrainCircuit, LineChart, Server, ShieldCheck, 
  Coins, Users, Sparkles, Check, Zap,
  Volume2, Activity,
  ArrowUpRight, ArrowDownRight, Target, Globe, BarChart2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "sonner";

export interface InterviewTrack {
  id: string;
  name: string;
  category: string;
  icon: any;
  defaultTitle: string;
  description: string;
  skills: string[];
}

export const INTERVIEW_TRACKS: InterviewTrack[] = [
  {
    id: "swe",
    name: "Software Engineering & Architecture",
    category: "Engineering",
    icon: Code2,
    defaultTitle: "Senior Full-Stack Architect",
    description: "System design, distributed concurrency, microservices, and database optimization.",
    skills: ["System Design", "Distributed Systems", "API Architecture", "Performance"]
  },
  {
    id: "ai_ml",
    name: "AI, Data Science & Machine Learning",
    category: "AI / Data",
    icon: BrainCircuit,
    defaultTitle: "Lead AI / ML Systems Engineer",
    description: "LLM engineering, model evaluation, MLOps, statistical inference, and vector search.",
    skills: ["LLM Workflows", "MLOps", "Model Fine-Tuning", "Vector DBs"]
  },
  {
    id: "pm",
    name: "Product Management & Strategy",
    category: "Product",
    icon: LineChart,
    defaultTitle: "Principal Product Manager",
    description: "Product discovery, KPI metrics, execution roadmaps, monetization, and UX strategy.",
    skills: ["Product Sense", "Execution Metrics", "Trade-Offs", "User Empathy"]
  },
  {
    id: "cloud_devops",
    name: "Cloud, DevOps & Site Reliability",
    category: "Infrastructure",
    icon: Server,
    defaultTitle: "Senior DevOps / SRE Specialist",
    description: "Kubernetes, CI/CD pipelines, multi-cloud resilience, IAC, and disaster recovery.",
    skills: ["Kubernetes", "AWS / GCP", "Chaos Engineering", "Observability"]
  },
  {
    id: "security",
    name: "Cybersecurity & Cloud Defense",
    category: "Security",
    icon: ShieldCheck,
    defaultTitle: "Lead Information Security Engineer",
    description: "Zero Trust architecture, threat modeling, incident triage, cryptography, and compliance.",
    skills: ["Zero Trust", "Threat Modeling", "Pen Testing", "AppSec"]
  },
  {
    id: "finance",
    name: "Finance, FinTech & Quantitative",
    category: "Finance",
    icon: Coins,
    defaultTitle: "Quantitative Financial Analyst",
    description: "Algorithmic risk modeling, valuation frameworks, compliance, and ledger architectures.",
    skills: ["Risk Modeling", "Valuation", "FinTech APIs", "Ledger Design"]
  },
  {
    id: "leadership",
    name: "Executive Leadership & Behavioral",
    category: "Leadership",
    icon: Users,
    defaultTitle: "Engineering Director / VP",
    description: "Team scaling, cross-functional stakeholder alignment, culture, and conflict resolution.",
    skills: ["STAR Method", "Crisis Management", "Organizational Scaling", "Mentorship"]
  }
];

export type DifficultyLevel = "easy" | "medium" | "hard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { speak, isSpeaking, stop } = useSpeechSynthesis();
  
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>(INTERVIEW_TRACKS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [jobTitle, setJobTitle] = useState(INTERVIEW_TRACKS[0].defaultTitle);
  const [jobDescription, setJobDescription] = useState("");

  const handleTrackSelect = (track: InterviewTrack) => {
    setSelectedTrack(track);
    setJobTitle(track.defaultTitle);
  };

  const testVoiceSynthesis = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak("Welcome to the AI Spotlight Executive Studio. Your voice prompter is fully synchronized.", () => {
        toast.success("Voice test complete! Audio synthesis is operational.");
      });
    }
  };

  const startInterview = () => {
    const mockId = Math.random().toString(36).substring(7);
    const params = new URLSearchParams({
      title: jobTitle,
      desc: jobDescription,
      subject: selectedTrack.name,
      difficulty: difficulty
    });
    navigate(`/interview/${mockId}?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
      {/* 1. Header (Image 2: Welcome back, Alex) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              Welcome back, {profile?.displayName?.split(' ')[0] || "Alex"}
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            What's happening with your AI evaluation studio today
          </p>
        </div>

        {/* Action Filter Pills (Image 2 Top Right) */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-1.5 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            AI Active
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={testVoiceSynthesis}
            className="rounded-full glass-panel border border-white/10 hover:border-purple-400/40 text-xs font-bold text-slate-300 hover:text-white"
          >
            <Volume2 className={`w-3.5 h-3.5 mr-1 text-purple-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
            {isSpeaking ? "Testing Audio..." : "Test Voice"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full glass-panel border border-white/10 hover:border-purple-400/40 text-xs font-bold text-slate-300 hover:text-white" 
            onClick={() => navigate('/history')}
          >
            <History className="w-3.5 h-3.5 mr-1 text-purple-400" />
            Records
          </Button>
        </div>
      </div>

      {/* 2. Four Top Metric Cards with Sparklines (Image 2 Top Grid of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Usage */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <svg className="w-18 h-8 text-amber-400 stroke-current fill-none stroke-[2]" viewBox="0 0 60 25">
              <path d="M0,18 Q15,5 30,15 T60,8" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">AI Usage</div>
            <div className="text-2xl font-black text-white font-heading mt-0.5">24.5K</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +12.5% this month
          </div>
        </div>

        {/* Card 2: Outputs */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <svg className="w-18 h-8 text-purple-400 stroke-current fill-none stroke-[2]" viewBox="0 0 60 25">
              <path d="M0,20 Q15,10 30,12 T60,5" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Outputs</div>
            <div className="text-2xl font-black text-white font-heading mt-0.5">1,847</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +8.2% this month
          </div>
        </div>

        {/* Card 3: Precision */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <svg className="w-18 h-8 text-cyan-400 stroke-current fill-none stroke-[2]" viewBox="0 0 60 25">
              <path d="M0,15 Q15,18 30,8 T60,4" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Precision</div>
            <div className="text-2xl font-black text-white font-heading mt-0.5">98.5%</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +2.1% this month
          </div>
        </div>

        {/* Card 4: Models */}
        <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/30 flex items-center justify-center text-fuchsia-400">
              <Globe className="w-4 h-4" />
            </div>
            <svg className="w-18 h-8 text-fuchsia-400 stroke-current fill-none stroke-[2]" viewBox="0 0 60 25">
              <path d="M0,10 Q15,6 30,14 T60,18" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Models</div>
            <div className="text-2xl font-black text-white font-heading mt-0.5">12</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-fuchsia-400 font-mono">
            <ArrowDownRight className="w-3.5 h-3.5" />
            -1.2% this month
          </div>
        </div>
      </div>

      {/* 3. Middle Section: AI Performance Index & AI Confidence Index (Image 2 Middle Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AI Performance Index Area Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/20 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase font-mono">AI Performance Index</div>
              <div className="text-3xl font-black text-white font-heading mt-1 flex items-center gap-3">
                $64,345
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px] font-mono font-bold">
                  +14.3%
                </Badge>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
              <BarChart2 className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          <div className="h-40 w-full relative pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <rect x="360" y="0" width="40" height="150" fill="rgba(168, 85, 247, 0.08)" rx="8" />
              <path 
                d="M 0,110 Q 70,130 130,80 T 260,70 T 380,30 T 500,45 L 500,150 L 0,150 Z" 
                fill="url(#purpleGlow)" 
              />
              <path 
                d="M 0,110 Q 70,130 130,80 T 260,70 T 380,30 T 500,45" 
                fill="none" 
                stroke="#A855F7" 
                strokeWidth="3.5" 
              />
              <circle cx="380" cy="30" r="5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="3" />
            </svg>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
              <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span className="text-purple-300 font-bold">SEP</span><span>NOV</span>
            </div>
          </div>
        </div>

        {/* Right: AI Confidence Index Semi-Circle Arc / Radial Gauge (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/20 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">AI Confidence Index</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              OPTIMAL
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-1 relative">
            <div className="relative w-44 h-24 overflow-hidden flex items-end justify-center">
              <svg className="w-44 h-44 absolute -top-1" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" strokeDasharray="132 132" strokeDashoffset="0" transform="rotate(180 50 50)" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#arcGradient)" strokeWidth="9" strokeDasharray="110 132" strokeDashoffset="0" transform="rotate(180 50 50)" strokeLinecap="round" />
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="35%" stopColor="#10B981" />
                    <stop offset="70%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center mb-1">
                <span className="text-3xl font-black text-white font-heading">82.5</span>
              </div>
            </div>
            <div className="text-xs font-bold text-purple-300 mt-1">Overall Evaluation Score</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Performance <strong>24%</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Accuracy <strong>32%</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Efficiency <strong>27%</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
              Reliability <strong>17%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Domain Track Selector (Step 1) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/20 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-mono font-black text-sm">
              1
            </div>
            <div>
              <h3 className="text-lg font-heading font-black text-white">Select Domain Track</h3>
              <p className="text-xs text-slate-400">Choose your targeted technical or executive discipline</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-[10px] uppercase">
            {INTERVIEW_TRACKS.length} Calibrated Tracks
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTERVIEW_TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "bg-purple-500/15 border-purple-400 ring-1 ring-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-purple-500/30 text-purple-300 border border-purple-400/50" : "bg-white/05 text-slate-400 border border-white/10"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{track.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{track.description}</p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {track.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-black/40 text-slate-300 border border-white/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Difficulty Tier (Step 2) & Target Role (Step 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty Tier */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 border border-purple-500/20 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-mono font-black text-xs">
              2
            </div>
            <h3 className="text-base font-heading font-black text-white">Difficulty Tier</h3>
          </div>

          <div className="space-y-3">
            {[
              { id: "easy", name: "Easy / Entry", time: "90s limit", desc: "4 Core foundational architecture questions", badge: "text-emerald-300 border-emerald-500/40 bg-emerald-500/20" },
              { id: "medium", name: "Medium / Pro", time: "120s limit", desc: "5 Scenario & high-scale trade-off questions", badge: "text-purple-300 border-purple-500/40 bg-purple-500/20" },
              { id: "hard", name: "Hard / Senior", time: "90s limit", desc: "6 Deep-dive bottleneck & edge-case questions", badge: "text-amber-300 border-amber-500/40 bg-amber-500/20" },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => setDifficulty(mode.id as any)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  difficulty === mode.id
                    ? "bg-purple-500/20 border-purple-400 ring-1 ring-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{mode.name}</span>
                    <Badge className={`text-[9px] font-mono ${mode.badge}`}>{mode.time}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{mode.desc}</p>
                </div>
                {difficulty === mode.id && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Target Role & Launch */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-7 border border-purple-500/20 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 font-mono font-black text-xs">
                3
              </div>
              <h3 className="text-base font-heading font-black text-white">Target Role & Criteria</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono font-bold uppercase text-slate-300">Target Role Title</Label>
              <Input 
                value={jobTitle} 
                onChange={(e) => setJobTitle(e.target.value)}
                className="glass-panel border-white/10 h-12 text-sm rounded-xl text-white font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono font-bold uppercase text-slate-300">Specific Tech Stack (Optional)</Label>
              <Textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. React 19, Go, Kubernetes, Kafka, Distributed Caching..."
                rows={2}
                className="glass-panel border-white/10 rounded-xl text-white text-xs resize-none p-3"
              />
            </div>
          </div>

          <Button 
            onClick={startInterview}
            className="w-full glow-btn-primary h-14 text-base font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl mt-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch {difficulty.toUpperCase()} Studio Session →
          </Button>
        </div>
      </div>
    </div>
  );
}
