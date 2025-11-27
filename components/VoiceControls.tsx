"use client";
import { useEffect, useRef, useState } from "react";

export default function VoiceControls({ onTranscript }: { onTranscript: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (globalThis as any).webkitSpeechRecognition || (globalThis as any).SpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }
        onTranscript(final || interim);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  function toggle() {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  }

  return (
    <button onClick={toggle} disabled={!supported} title={supported ? "" : "Speech recognition unsupported in this browser"}>
      {supported ? (listening ? "Stop Mic" : "Speak") : "No Mic"}
    </button>
  );
}

