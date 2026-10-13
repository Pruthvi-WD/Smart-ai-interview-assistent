import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Video, VideoOff, 
  ChevronRight, AlertCircle, 
  CheckCircle2, Timer, MessageSquare, Loader2,
  ArrowLeft, ShieldCheck, Activity, FileText, CheckSquare, 
  Sparkles, Sliders, LogOut, Volume2, VolumeX, RotateCcw,
  Trash2, Edit3, Check, Play, Pause, FastForward, Radio
} from "lucide-react";
import CameraPreview from "@/components/interview/CameraPreview";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { generateQuestions, evaluateAnswer } from "@/lib/gemini";
import socket from "@/lib/socket";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

interface Question {
  id: string;
  text: string;
  type: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  starMethodCheck: boolean;
}

export default function InterviewRoom() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const jobTitle = searchParams.get("title") || "Software Engineer";
  const jobDesc = searchParams.get("desc") || "";
  const subject = searchParams.get("subject") || "Software Engineering & Architecture";
  const difficulty = (searchParams.get("difficulty") || "medium") as "easy" | "medium" | "hard";

  const questionTimeLimit = difficulty === "medium" ? 120 : difficulty === "hard" ? 90 : 90;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [timeLeft, setTimeLeft] = useState(questionTimeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "minutes">("transcript");
  const [isLipActive, setIsLipActive] = useState(true);
  const [isManualEditMode, setIsManualEditMode] = useState(false);

  // Audio Hooks
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    clearTranscript, 
    setTranscript 
  } = useSpeechRecognition();

  const {
    speak,
    stop: stopAiSpeech,
    isSpeaking: isAiSpeaking
  } = useSpeechSynthesis();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenQuestionRef = useRef<number | null>(null);

  // Initialize questions
  useEffect(() => {
    const init = async () => {
      try {
        const generated = await generateQuestions(jobTitle, jobDesc, subject, difficulty);
        setQuestions(generated);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to generate questions:", err);
        toast.error("Failed to calibrate interview. Please try again.");
        navigate("/dashboard");
      }
    };

    init();
    socket.emit("join-interview", id);

    socket.on("realtime-feedback", (feedback) => {
      setRealtimeFeedback(feedback.message);
      setTimeout(() => setRealtimeFeedback(null), 3000);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAiSpeech();
      socket.off("realtime-feedback");
    };
  }, [id, jobTitle, jobDesc, subject, difficulty, navigate, stopAiSpeech]);

  // Real-time socket sync
  useEffect(() => {
    if (isListening && transcript) {
      socket.emit("speech-data", { interviewId: id, text: transcript });
    }
  }, [transcript, isListening, id]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Trigger AI Voice reading question before timer starts
  const readCurrentQuestion = useCallback((qIndex: number, questionsList: Question[]) => {
    if (!questionsList || !questionsList[qIndex]) return;
    
    const targetQuestion = questionsList[qIndex];
    hasSpokenQuestionRef.current = qIndex;
    
    // Pause timer and microphone while AI speaks
    setIsTimerRunning(false);
    stopListening();
    setTimeLeft(questionTimeLimit);

    const speechText = `Question ${qIndex + 1}. ${targetQuestion.text}`;
    
    speak(speechText, () => {
      // Callback when AI finishes reading
      toast.info("AI finished reading. Your response timer has started!", { duration: 2500 });
      setIsTimerRunning(true);
      startListening();
    });
  }, [questionTimeLimit, speak, startListening, stopListening]);

  // Replay question audio
  const handleReplayQuestion = () => {
    if (!questions[currentQuestionIndex]) return;
    readCurrentQuestion(currentQuestionIndex, questions);
  };

  // Skip AI question speech to answer immediately
  const handleSkipSpeech = () => {
    stopAiSpeech();
    toast.info("Timer and microphone activated.", { duration: 2000 });
    setIsTimerRunning(true);
    startListening();
  };

  // Handle start session
  const startInterview = async () => {
    if (!user) {
      toast.error("Please sign in to start your interview session.");
      return;
    }

    if (!id || questions.length === 0) {
      toast.error("Session initialization failed. Please try again.");
      return;
    }
    
    try {
      await setDoc(doc(db, "interviews", id), {
        userId: user.uid,
        jobTitle,
        jobDescription: jobDesc,
        subject,
        difficulty,
        createdAt: new Date().toISOString(),
        status: "pending",
        questions: questions.map(q => ({ ...q, answer: "" }))
      });

      setIsStarted(true);
      toast.success(`${difficulty.toUpperCase()} tier interview started! AI interviewer will read the questions.`);
      
      // Start reading question 1
      setTimeout(() => {
        readCurrentQuestion(0, questions);
      }, 500);

    } catch (err) {
      console.error("Error saving interview:", err);
      handleFirestoreError(err, OperationType.WRITE, `interviews/${id}`);
      toast.error("Failed to initialize session. Check your connection.");
    }
  };

  // Clear recorded answer
  const handleClearAnswer = () => {
    clearTranscript();
    toast.success("Recorded answer cleared. Speak or type anew.");
  };

  // Next Question
  const handleNextQuestion = async () => {
    stopAiSpeech();
    setIsTimerRunning(false);
    stopListening();

    const currentQuestion = questions[currentQuestionIndex];
    const finalAnswer = transcript.trim();
    
    if (finalAnswer.length > 10) {
      setIsEvaluating(true);
      try {
        const data = await evaluateAnswer(currentQuestion.text, finalAnswer, difficulty, subject, jobTitle);
        setEvaluations(prev => ({ ...prev, [currentQuestion.id]: data }));
        
        // Update Firestore
        if (id) {
          const interviewDoc = await getDoc(doc(db, "interviews", id));
          if (interviewDoc.exists()) {
            const interviewData = interviewDoc.data();
            const rawQuestions = interviewData.questions;
            const currentList = Array.isArray(rawQuestions)
              ? [...rawQuestions]
              : typeof rawQuestions === 'object' && rawQuestions !== null
              ? Object.values(rawQuestions)
              : [];
            
            currentList[currentQuestionIndex] = {
              ...(currentList[currentQuestionIndex] || {}),
              answer: finalAnswer,
              evaluation: data
            };
            await updateDoc(doc(db, "interviews", id), {
              questions: currentList
            });
          }
        }
      } catch (err) {
        console.error("Evaluation failed:", err);
        toast.error("Failed to analyze answer.");
      } finally {
        setIsEvaluating(false);
      }
    } else if (finalAnswer.length > 0) {
      toast.warning("Answer was very brief; skipping detailed score breakdown.");
    }

    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      clearTranscript();
      setIsManualEditMode(false);
      
      // AI reads the next question
      setTimeout(() => {
        readCurrentQuestion(nextIdx, questions);
      }, 400);

    } else {
      // Final question completed
      if (timerRef.current) clearInterval(timerRef.current);
      if (id) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", id));
          if (interviewDoc.exists()) {
            const interviewData = interviewDoc.data();
            const rawQuestions = interviewData.questions;
            const qList = Array.isArray(rawQuestions)
              ? rawQuestions
              : typeof rawQuestions === 'object' && rawQuestions !== null
              ? Object.values(rawQuestions)
              : [];

            const allScores = qList
              .map((q: any) => q?.evaluation?.score)
              .filter((s: any) => typeof s === 'number');
            
            const avgScore = allScores.length > 0 
              ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) 
              : 0;
            
            await updateDoc(doc(db, "interviews", id), {
              status: "completed",
              overallScore: avgScore
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `interviews/${id}`);
        }
      }
      toast.success("Interview completed! Compiling your executive scorecard...");
      setTimeout(() => navigate(`/report/${id}`), 1800);
    }
  };

  const handleExitInterview = () => {
    stopAiSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    stopListening();
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] space-y-6 pt-24">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full shadow-[0_0_35px_rgba(16,185,129,0.4)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <p className="text-2xl font-black text-white font-heading tracking-tight">Calibrating {difficulty.toUpperCase()} Studio</p>
          <p className="text-xs font-mono text-emerald-400">Track: {subject}</p>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 pt-2">
            <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>Configuring AI Voice Synthesis & Optical Lip-Sync</span>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const timerPercentage = (timeLeft / questionTimeLimit) * 100;
  const isTimeCritical = timeLeft <= 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-6">
      {/* Top Session Navigation Bar */}
      <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-lg">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowExitConfirm(true)}
          className="text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 hover:bg-white/[0.05] rounded-xl h-9"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Exit Studio
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 hidden md:inline-block">
            {subject}
          </span>
          <Badge className={`font-mono text-xs font-bold uppercase px-3 py-1 ${
            difficulty === "easy" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
            difficulty === "hard" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
            "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          }`}>
            {difficulty} Tier
          </Badge>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel-glow border border-emerald-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 text-destructive font-black text-lg font-heading">
                <AlertCircle className="w-6 h-6 shrink-0" />
                Leave Active Interview Session?
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Are you sure you want to exit? Your completed answers are saved in your session record, but the active timer and question will terminate.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="rounded-xl font-bold border-white/10 text-white">
                  Resume Session
                </Button>
                <Button variant="destructive" onClick={handleExitInterview} className="rounded-xl font-black">
                  Exit to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isStarted ? (
        <div className="max-w-3xl mx-auto text-center py-16 px-6 sm:px-10 glass-panel-glow rounded-3xl border border-emerald-500/30 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-8">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 relative z-10"
          >
            <div className="w-20 h-20 bg-emerald-500/15 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-400/40 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
              <Video className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading">
                Ready for your {jobTitle} Evaluation?
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                Track: <span className="text-white font-bold">{subject}</span> • Mode: <span className="text-emerald-400 font-bold uppercase">{difficulty}</span>
              </p>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-lg mx-auto pt-2 text-left">
              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-[11px] uppercase">
                  <Volume2 className="w-4 h-4" />
                  AI Voice
                </div>
                <div className="text-sm font-bold text-white mt-1">Spoken Questions</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Timer starts after AI reads</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-[11px] uppercase">
                  <Activity className="w-4 h-4" />
                  Lip-Sync Sync
                </div>
                <div className="text-sm font-bold text-white mt-1">Active Isolation</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Zero background crosstalk</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-[11px] uppercase">
                  <Timer className="w-4 h-4" />
                  {questionTimeLimit}s Limit
                </div>
                <div className="text-sm font-bold text-white mt-1">{questions.length} Questions</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">STAR method rubric</div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={startInterview} 
                size="lg" 
                className="glow-btn-primary px-12 py-7 text-lg font-black rounded-2xl shadow-2xl group"
              >
                <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-110 transition-transform" />
                Begin {difficulty.toUpperCase()} Interview →
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <CameraPreview 
              isListening={isListening}
              onLipActivityDetect={(speaking) => setIsLipActive(speaking)}
            />
            
            {/* Audio & Timer Action Cockpit */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Microphone Toggle & Status */}
                <div className="flex items-center gap-4">
                  <Button 
                    variant={isListening ? "destructive" : "default"} 
                    size="icon" 
                    className={`rounded-2xl w-14 h-14 shadow-lg transition-all ${
                      isListening ? 'ring-4 ring-destructive/30' : 'glow-btn-primary'
                    }`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAiSpeaking}
                  >
                    {isListening ? (
                      <Mic className="w-6 h-6 animate-pulse" />
                    ) : (
                      <MicOff className="w-6 h-6 text-black" />
                    )}
                  </Button>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {isAiSpeaking ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                          <Volume2 className="w-4 h-4 animate-bounce" />
                          AI Interviewer Speaking...
                        </span>
                      ) : isListening ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Microphone Capturing Voice
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">Microphone Paused</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isAiSpeaking 
                        ? "Timer will start automatically once reading ends."
                        : isListening 
                        ? "Optical lip-sync validating active speaker." 
                        : "Click microphone to record your response."}
                    </div>
                  </div>
                </div>

                {/* Question Timer with Ring Indicator */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5 glass-panel border border-white/10 px-4 py-2.5 rounded-2xl shadow-inner">
                    <Timer className={`w-5 h-5 ${isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
                    <div className="text-right">
                      <div className={`text-2xl font-black font-mono leading-none ${isTimeCritical ? 'text-rose-500' : 'text-white'}`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-[9px] uppercase font-mono font-bold text-muted-foreground tracking-wider mt-0.5">
                        {isAiSpeaking ? "Waiting" : "Remaining"}
                      </div>
                    </div>
                  </div>

                  {/* Next / Submit Button */}
                  <Button 
                    onClick={handleNextQuestion} 
                    disabled={isEvaluating}
                    className="glow-btn-primary rounded-2xl h-12 px-6 text-sm font-black shadow-lg"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin text-white" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        {currentQuestionIndex === questions.length - 1 ? "Submit & Debrief" : "Next Question"}
                        <ChevronRight className="ml-1.5 w-4 h-4 text-white" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Bar for Timer */}
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/[0.08]">
                <motion.div 
                  className={`h-full ${
                    isTimeCritical 
                      ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                      : isAiSpeaking 
                      ? "bg-emerald-400/50 animate-pulse" 
                      : "bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-400"
                  }`}
                  animate={{ width: isAiSpeaking ? '100%' : `${timerPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Real-time Evaluation Alert */}
            <AnimatePresence>
              {realtimeFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-5 py-3.5 rounded-2xl flex items-center gap-3 font-semibold text-xs shadow-md"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{realtimeFeedback}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Question Card & Answer Studio (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Question Prompter Card */}
            <div className="glass-panel-glow rounded-3xl border border-emerald-500/30 overflow-hidden relative shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase font-bold">
                  {currentQ?.type || "Core Competency"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-heading font-black leading-snug text-white">
                {currentQ?.text}
              </h2>

              {/* AI Voice State & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  {isAiSpeaking ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      {/* Animated Soundwave Visualizer */}
                      <div className="flex items-center gap-1 h-4">
                        <span className="soundwave-bar" style={{ animationDelay: '0.1s' }} />
                        <span className="soundwave-bar" style={{ animationDelay: '0.3s' }} />
                        <span className="soundwave-bar" style={{ animationDelay: '0.2s' }} />
                        <span className="soundwave-bar" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="font-mono font-bold">AI Voice Reading Question...</span>
                    </div>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1.5 text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Question Ready
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isAiSpeaking ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleSkipSpeech}
                      className="rounded-xl text-xs font-mono font-bold h-8 px-3 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-1.5"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      Skip to Answer
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleReplayQuestion}
                      className="rounded-xl text-xs font-mono font-bold h-8 px-3 text-slate-300 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5"
                      title="Replay Question Audio"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      Replay Audio
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {difficulty === "hard" 
                    ? "Focus on concrete architecture metrics, latency tradeoffs, and failure modes."
                    : "Structure your response with Situation, Task, Action, and Measurable Results."}
                </span>
              </div>
            </div>

            {/* Answer Section with Dedicated CLEAR Button */}
            <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl h-[420px] flex flex-col overflow-hidden">
              {/* Answer Header with Tabs & Clear Action */}
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab("transcript")}
                    className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === "transcript" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Recorded Answer
                  </button>
                  <button 
                    onClick={() => setActiveTab("minutes")}
                    className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      activeTab === "minutes" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Live Minutes
                  </button>
                </div>
                
                {/* Clear Answer & Edit Controls */}
                {activeTab === "transcript" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsManualEditMode(!isManualEditMode)}
                      className="h-8 px-2.5 text-xs text-slate-300 hover:text-white rounded-xl"
                      title={isManualEditMode ? "Switch to Speech View" : "Edit Answer Manually"}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      {isManualEditMode ? "Voice View" : "Edit"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAnswer}
                      disabled={!transcript && !isManualEditMode}
                      className="h-8 px-3 text-xs font-mono font-bold text-rose-400 hover:bg-rose-500/20 border-rose-500/40 bg-rose-500/10 rounded-xl flex items-center gap-1.5 transition-all"
                      title="Clear everything recorded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Scrollable Content Area */}
              <ScrollArea className="flex-grow p-6">
                {activeTab === "transcript" ? (
                  isManualEditMode ? (
                    <div className="space-y-3">
                      <textarea
                        rows={10}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Type or edit your answer here..."
                        className="w-full bg-black/40 border border-white/15 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none leading-relaxed"
                      />
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
                        <span>Manual typing & voice synthesis synced</span>
                        <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>
                  ) : transcript ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-white/10">
                        <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          Live Speech Capture Active
                        </span>
                        <span className="font-mono font-bold text-slate-300">
                          {transcript.split(/\s+/).filter(Boolean).length} Words ({transcript.length} Chars)
                        </span>
                      </div>
                      <p className="text-base sm:text-lg leading-relaxed text-white font-medium italic">
                        "{transcript}"
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400">
                        <Mic className="w-7 h-7" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <p className="text-sm font-bold text-white font-heading">No speech recorded yet</p>
                        <p className="text-xs text-muted-foreground">
                          {isAiSpeaking 
                            ? "AI is currently reading the question aloud..." 
                            : "Speak clearly into your microphone. Your answer will appear here in real-time."}
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="font-bold text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        Executive Minutes in Synthesis:
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        • Formulating strategic answers for {currentQ?.type || "core competency"} in {subject}.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Local-First Confidentiality:
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Voice capture, speech recognition, and lip-sync validation operate 100% on your device with zero corporate audio logging.
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
