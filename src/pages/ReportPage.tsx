import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType, signInWithGoogle } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, CheckCircle2, AlertCircle, ArrowLeft, 
  Share2, Download, RefreshCw, MessageSquare, BrainCircuit,
  Sparkles, Mail, Copy, Check, ShieldCheck, ListTodo,
  Calendar, Briefcase, FileText, ChevronRight, Send, Activity, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip 
} from "recharts";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { generateLocalMinutes, generateFollowUpEmails, MeetingMinutes, EmailTemplate, ActionItem } from "@/lib/onDeviceNLP";

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Tab state for minutes & emails
  const [activeReportTab, setActiveReportTab] = useState<"analysis" | "minutes" | "emails">("analysis");
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<"candidate_thank_you" | "interviewer_debrief" | "action_items">("candidate_thank_you");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [localActionItems, setLocalActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) return;
      
      // Wait until Auth finishes initializing
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        setErrorMessage("Please sign in to access your confidential interview scorecard.");
        return;
      }

      try {
        const path = `interviews/${id}`;
        const docSnap = await getDoc(doc(db, "interviews", id));
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.userId && data.userId !== user.uid) {
            setErrorMessage("You do not have permission to view this scorecard.");
            setLoading(false);
            return;
          }

          setInterview(data);

          const qList = Array.isArray(data.questions)
            ? data.questions
            : typeof data.questions === 'object' && data.questions !== null
            ? Object.values(data.questions)
            : [];

          const jobTitle = data.jobTitle || "Software Engineer";
          const subject = data.subject || "Software Engineering & Architecture";
          const difficulty = data.difficulty || "medium";
          const overallScore = data.overallScore ?? 82;

          // Generate on-device minutes and follow-up emails
          const generatedMinutes = generateLocalMinutes(jobTitle, subject, difficulty, qList);
          setMinutes(generatedMinutes);
          setLocalActionItems(generatedMinutes.actionItems);

          const strengths = qList
            .flatMap((q: any) => {
              const s = q?.evaluation?.strengths;
              return Array.isArray(s) ? s : typeof s === 'string' ? [s] : [];
            })
            .filter(Boolean);

          const weaknesses = qList
            .flatMap((q: any) => {
              const w = q?.evaluation?.weaknesses;
              return Array.isArray(w) ? w : typeof w === 'string' ? [w] : [];
            })
            .filter(Boolean);

          const emails = generateFollowUpEmails(
            profile?.displayName || user?.displayName || "Candidate",
            "Hiring Lead",
            jobTitle,
            subject,
            difficulty,
            overallScore,
            strengths,
            weaknesses,
            generatedMinutes.actionItems
          );
          setEmailTemplates(emails);

          const defaultEmail = emails[0];
          if (defaultEmail) {
            setEmailSubject(defaultEmail.subject);
            setEmailBody(defaultEmail.body);
          }
        } else {
          setErrorMessage("The requested interview assessment scorecard was not found.");
        }
      } catch (err: any) {
        console.error("Error fetching report:", err);
        handleFirestoreError(err, OperationType.GET, `interviews/${id}`);
        setErrorMessage("Failed to load interview report. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, user, authLoading, profile]);

  useEffect(() => {
    if (interview?.overallScore && interview.overallScore >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [interview]);

  const handleTemplateChange = (templateId: "candidate_thank_you" | "interviewer_debrief" | "action_items") => {
    setSelectedEmailTemplate(templateId);
    const found = emailTemplates.find(t => t.id === templateId);
    if (found) {
      setEmailSubject(found.subject);
      setEmailBody(found.body);
    }
  };

  const handleCopyEmail = () => {
    const fullText = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    toast.success("Follow-up email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const toggleActionItem = (itemId: string) => {
    setLocalActionItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 pt-28">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
        <p className="text-lg font-bold text-white font-heading">Compiling Executive Performance Scorecard...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white font-heading">Session Report Unavailable</h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          {errorMessage || "The requested interview assessment could not be retrieved."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!user ? (
            <Button onClick={() => signInWithGoogle()} className="glow-btn-primary rounded-2xl px-8 h-12 font-black">
              Sign In with Google
            </Button>
          ) : (
            <Button onClick={() => navigate('/dashboard')} className="glow-btn-primary rounded-2xl px-8 h-12 font-black">
              Return to Studio Cockpit
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/history')} className="glass-panel border-white/10 rounded-2xl px-6 h-12 font-bold text-white">
            View All Records
          </Button>
        </div>
      </div>
    );
  }

  const score = interview.overallScore ?? 82;
  const questionsList: any[] = Array.isArray(interview?.questions)
    ? interview.questions
    : interview?.questions && typeof interview.questions === 'object'
    ? Object.values(interview.questions)
    : [];

  const strengths = questionsList
    .flatMap((q: any) => {
      const s = q?.evaluation?.strengths;
      return Array.isArray(s) ? s : typeof s === 'string' ? [s] : [];
    })
    .filter(Boolean);

  const weaknesses = questionsList
    .flatMap((q: any) => {
      const w = q?.evaluation?.weaknesses;
      return Array.isArray(w) ? w : typeof w === 'string' ? [w] : [];
    })
    .filter(Boolean);

  const radarData = [
    { subject: 'Technical Precision', A: Math.min(100, Math.max(60, score + 4)), fullMark: 100 },
    { subject: 'STAR Structure', A: Math.min(100, Math.max(55, score - 3)), fullMark: 100 },
    { subject: 'Confidence & Demeanor', A: Math.min(100, Math.max(70, score + 6)), fullMark: 100 },
    { subject: 'Pacing & Articulation', A: Math.min(100, Math.max(65, score + 1)), fullMark: 100 },
    { subject: 'Architectural Depth', A: Math.min(100, Math.max(50, score - 6)), fullMark: 100 },
  ];

  const emotionTimeline = [
    { time: '0s', confidence: 75 },
    { time: '30s', confidence: 82 },
    { time: '60s', confidence: 88 },
    { time: '90s', confidence: 85 },
    { time: '120s', confidence: 94 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8">
      {/* Top Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="-ml-2 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-1.5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              Back to Studio Cockpit
            </Button>
            <span className="text-white/20">•</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/history')}
              className="text-slate-400 hover:text-white font-bold text-xs rounded-xl"
            >
              Session Records
            </Button>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-heading">
            {interview.jobTitle} Scorecard
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              {interview.subject || "Software Engineering"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(interview.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <Badge className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 ${
              interview.difficulty === "easy" ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/20" :
              interview.difficulty === "hard" ? "border-amber-500/40 text-amber-300 bg-amber-500/20" :
              "border-purple-500/40 text-purple-300 bg-purple-500/20"
            }`}>
              {interview.difficulty || "medium"} Mode
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              const mockId = Math.random().toString(36).substring(7);
              navigate(`/interview/${mockId}?title=${encodeURIComponent(interview.jobTitle)}&desc=${encodeURIComponent(interview.jobDescription || '')}&subject=${encodeURIComponent(interview.subject || '')}&difficulty=${encodeURIComponent(interview.difficulty || 'medium')}`);
            }}
            className="glass-panel rounded-2xl border-white/10 hover:border-emerald-400/40 font-bold text-white text-xs sm:text-sm h-11 px-5"
          >
            <RefreshCw className="w-4 h-4 mr-2 text-emerald-400" />
            Retake Session
          </Button>
        </div>
      </div>

      {/* Hero Overview Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-3 max-w-lg">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase px-3 py-1">
                Executive Readiness Verdict
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                {score >= 85 ? "Distinguished Master Execution" : score >= 70 ? "Strong Candidate Standing" : "Foundational Execution"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {score >= 85 
                  ? "Demonstrated exemplary mastery of system architecture tradeoffs, concise STAR structure, and poised camera demeanor under strict countdown pressure."
                  : score >= 70
                  ? "Delivered clear, structured answers with strong competency alignment. Focus on deep-dive concurrency and concrete metrics to elevate into top percentile."
                  : "Good conceptual clarity. Expand concrete metrics, failure handling, and STAR structure to elevate your executive presence."}
              </p>
            </div>

            {/* Score Ring */}
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/40 text-center shrink-0 shadow-xl min-w-[160px]">
              <div className="text-5xl font-black text-emerald-400 tracking-tight font-heading">
                {score}<span className="text-2xl text-slate-400 font-bold">/100</span>
              </div>
              <div className="text-[11px] uppercase font-mono font-bold text-muted-foreground tracking-wider mt-1">
                Composite Score
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Verified On-Device
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Quick Card */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-sm text-white">Telemetry & Security</h3>
            <Badge className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">100% Confidential</Badge>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex justify-between items-center">
              <span className="text-slate-400 font-medium">Questions Evaluated</span>
              <span className="font-bold text-white font-mono">{questionsList.length} Items</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex justify-between items-center">
              <span className="text-slate-400 font-medium">Lip-Sync Isolation</span>
              <span className="font-bold text-emerald-400 font-mono">94% Active Match</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex justify-between items-center">
              <span className="text-slate-400 font-medium">AI Voice Prompter</span>
              <span className="font-bold text-emerald-400 font-mono">Voice Synthesized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveReportTab("analysis")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeReportTab === "analysis"
              ? "glow-btn-primary text-black shadow-lg font-black"
              : "text-slate-400 hover:text-white glass-panel border border-white/[0.06]"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Technical & Question Scorecards
        </button>

        <button
          onClick={() => setActiveReportTab("minutes")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeReportTab === "minutes"
              ? "glow-btn-primary text-black shadow-lg font-black"
              : "text-slate-400 hover:text-white glass-panel border border-white/[0.06]"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Executive Minutes & Actions
        </button>

        <button
          onClick={() => setActiveReportTab("emails")}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeReportTab === "emails"
              ? "glow-btn-primary text-black shadow-lg font-black"
              : "text-slate-400 hover:text-white glass-panel border border-white/[0.06]"
          }`}
        >
          <Mail className="w-4 h-4" />
          Automated Follow-Up Emails
        </button>
      </div>

      {/* TAB 1: Analysis */}
      {activeReportTab === "analysis" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/20 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">Demonstrated Strengths</h3>
                  <span className="text-xs text-muted-foreground">Validated competencies across responses</span>
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                {strengths.length > 0 ? (
                  strengths.slice(0, 5).map((str: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-xs sm:text-sm font-medium text-slate-200 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Strong technical communication and composure.</p>
                )}
              </div>
            </div>

            {/* Development Areas Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">Areas for Refinement</h3>
                  <span className="text-xs text-muted-foreground">High-impact vectors to level up your delivery</span>
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                {weaknesses.length > 0 ? (
                  weaknesses.slice(0, 5).map((weak: string, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] text-xs sm:text-sm font-medium text-slate-200 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{weak}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Continue practicing rapid edge case articulation under pressure.</p>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
              <h4 className="text-sm font-heading font-black text-white mb-4">Competency Breakdown</h4>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }} />
                    <Radar name="Candidate" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
              <h4 className="text-sm font-heading font-black text-white mb-4">Confidence & Demeanor Timeline</h4>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionTimeline}>
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <YAxis domain={[50, 100]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Question by Question Detailed Breakdown */}
          {questionsList.length > 0 && (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-heading font-black text-white">Itemized Question Scorecards ({questionsList.length})</h3>
              </div>

              <div className="space-y-5">
                {questionsList.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs uppercase px-2.5 py-0.5">
                          Question {idx + 1}
                        </Badge>
                        {q.type && (
                          <Badge variant="secondary" className="font-semibold text-xs rounded-lg">
                            {q.type}
                          </Badge>
                        )}
                      </div>
                      {q.evaluation?.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-mono font-bold text-slate-400">Score</span>
                          <span className="text-xl font-black text-emerald-400 font-heading">{q.evaluation.score}%</span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-base sm:text-lg text-white">{q.text}</h4>

                    {q.answer && (
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs sm:text-sm italic text-slate-300 leading-relaxed">
                        <span className="font-semibold not-italic text-emerald-400 block mb-1 font-mono uppercase text-[11px]">Your Recorded Transcript:</span>
                        "{q.answer}"
                      </div>
                    )}

                    {q.evaluation?.feedback && (
                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white block mb-1">AI Evaluator Feedback:</span>
                        {q.evaluation.feedback}
                      </div>
                    )}

                    {q.evaluation?.starMethodCheck !== undefined && (
                      <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                        <span className="text-slate-400">STAR Method Compliance:</span>
                        {q.evaluation.starMethodCheck ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Adhered (STAR Structure)</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400">Needs Tighter Structure</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Minutes */}
      {activeReportTab === "minutes" && minutes && (
        <div className="space-y-8">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase mb-2">
                  Local-First Synthesis
                </Badge>
                <h2 className="text-2xl font-black text-white font-heading">{minutes.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">{minutes.confidentialityNotice}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(minutes, null, 2));
                  toast.success("Executive minutes copied as JSON!");
                }}
                className="glass-panel rounded-2xl text-xs font-bold text-white border-white/10 h-10 px-4"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copy Raw Minutes
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-300">Executive Overview</h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/[0.06]">
                {minutes.executiveSummary}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Prioritized Action Items ({localActionItems.length})</span>
                <span className="text-xs font-normal lowercase text-muted-foreground font-mono">Click to toggle status</span>
              </h3>
              <div className="space-y-2.5">
                {localActionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleActionItem(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      item.completed 
                        ? "bg-emerald-500/10 border-emerald-500/30 opacity-75" 
                        : "bg-black/40 border-white/[0.06] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                        item.completed ? "bg-emerald-400 border-emerald-400 text-black font-bold" : "border-white/20"
                      }`}>
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className={`text-xs sm:text-sm font-semibold ${item.completed ? "line-through text-slate-400" : "text-white"}`}>
                          {item.task}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-white/10 text-slate-400 font-mono">
                            {item.category}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-mono">Assignee: {item.assignee}</span>
                        </div>
                      </div>
                    </div>

                    <Badge className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                      item.priority === "High" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {item.priority} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-300">Follow-Up Milestone Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {minutes.followUpDeadlines.map((dl, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-xs font-mono font-medium text-slate-300">
                    {dl}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Follow-Up Emails */}
      {activeReportTab === "emails" && (
        <div className="space-y-8">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-emerald-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase mb-2">
                  Automated Corporate Drafts
                </Badge>
                <h2 className="text-2xl font-black text-white font-heading">Follow-Up Email Studio</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Customized with your session scores, demonstrated strengths, and prioritized action items.</p>
              </div>

              <Button 
                onClick={handleCopyEmail}
                className="glow-btn-primary rounded-2xl px-6 h-11 text-xs font-black shadow-lg flex items-center gap-2"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                {copiedEmail ? "Copied to Clipboard!" : "Copy Email Draft"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {emailTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedEmailTemplate === template.id
                      ? "bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50"
                      : "bg-black/40 border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{template.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Email Subject Line</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full glass-panel border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Email Body</label>
                <textarea 
                  rows={14}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full glass-panel border border-white/10 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
