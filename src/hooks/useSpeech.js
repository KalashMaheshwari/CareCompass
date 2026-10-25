import { useRef, useState, useCallback, useEffect } from "react";

const MAX_MS = 25000;                       // auto-stop, keeps clips under 25s
const API_URL = import.meta.env.VITE_API_URL || "";

export function useSpeech(language = "auto") {
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [status, setStatus] = useState("idle");  // idle | recording | transcribing | error
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const releaseMic = () => {
    clearTimeout(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());   // turns the mic indicator off
    streamRef.current = null;
  };

  const start = useCallback(async () => {
    if (!supported) { setError("unsupported"); setStatus("error"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
        .find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };

      rec.onstop = async () => {
        releaseMic();
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size < 1000) { setError("no-speech"); setStatus("error"); return; }

        setStatus("transcribing");
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 20000);
        try {
          const form = new FormData();
          form.append("audio", blob, type.includes("mp4") ? "speech.m4a" : "speech.webm");
          form.append("language", language);
          const res = await fetch(`${API_URL}/stt`, { method: "POST", body: form, signal: ctrl.signal });
          if (!res.ok) throw new Error("stt_failed");
          const { transcript: text } = await res.json();
          if (!text) { setError("no-speech"); setStatus("error"); return; }
          setTranscript(text);
          setStatus("idle");
        } catch {
          setError("stt_failed");
          setStatus("error");
        } finally {
          clearTimeout(timeout);
        }
      };

      recRef.current = rec;
      setError(null); setTranscript(""); setStatus("recording");
      rec.start();
      timerRef.current = setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, MAX_MS);
    } catch (e) {
      setError(e.name === "NotAllowedError" ? "not-allowed" : "audio-capture");
      setStatus("error");
    }
  }, [language, supported]);

  const stop = useCallback(() => {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }, []);

  useEffect(() => () => {                        // cleanup on unmount
    releaseMic();
    if (recRef.current?.state === "recording") {
      recRef.current.onstop = null;
      recRef.current.stop();
    }
  }, []);

  return { supported, status, transcript, setTranscript, error, start, stop };
}

// Alias for backward compatibility
export const useSarvamSpeech = useSpeech;
