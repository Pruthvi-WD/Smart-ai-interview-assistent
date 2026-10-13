import { useState, useEffect, useCallback, useRef } from "react";

export interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Prefer modern natural English voices (Google US English, Samantha, Daniel, Natural, etc.)
      const naturalVoice = availableVoices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Premium") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Karen"))
      ) || availableVoices.find((v) => v.lang.startsWith("en")) || availableVoices[0];
      
      setSelectedVoice(naturalVoice || null);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void, options?: SpeechSynthesisOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      // Clean up text for natural pronunciation (remove markdown/symbols)
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanText) {
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options?.rate ?? 0.95; // Slightly measured executive cadence
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (activeCallbackRef.current) {
          activeCallbackRef.current();
          activeCallbackRef.current = null;
        }
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setIsSpeaking(false);
        setIsPaused(false);
        if (activeCallbackRef.current) {
          activeCallbackRef.current();
          activeCallbackRef.current = null;
        }
        onEnd?.();
      };

      activeCallbackRef.current = onEnd || null;
      utteranceRef.current = utterance;

      // Chrome bug workaround: ensure synth doesn't get garbage collected
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      if (activeCallbackRef.current) {
        activeCallbackRef.current();
        activeCallbackRef.current = null;
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}
