import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser environment');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setTranscript(fullTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event warning:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should still be listening (e.g. Chrome 60s pause)
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started error
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // May already be running
        setIsListening(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    // If running, restart instance to clear underlying buffer
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 150);
      } catch (e) {}
    }
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript
  };
};
