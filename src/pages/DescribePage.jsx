import React, { useState, useEffect } from 'react';
import {
  RotateCcw, Users, AlertOctagon, Mic, MicOff, ArrowLeft, ArrowRight,
  Phone, ShieldCheck, Languages
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { runTriage, checkClientSideRedFlags } from '../services/triageEngine';
import { supabaseService } from '../services/supabase';

const EXAMPLE_PROMPTS = [
  'Papa ko do din se bukhar hai aur khansi bhi hai',
  'Fever and body ache since last night',
  'Bacche ko subah se pet dard hai'
];

const formatClock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const DescribePage = ({ startListening = false, presetText = '' }) => {
  const {
    t,
    language,
    activePatient,
    triageData,
    setTriageData,
    navigate
  } = useApp();

  const [inputTranscript, setInputTranscript] = useState(presetText || triageData.user_input || '');
  const [micStatus, setMicStatus] = useState('idle');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [clientRedFlag, setClientRedFlag] = useState(null);

  // Presentational only — elapsed recording time shown in the voice module
  const [recSeconds, setRecSeconds] = useState(0);
  useEffect(() => {
    if (micStatus !== 'listening') return;
    setRecSeconds(0);
    const tick = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [micStatus]);

  useEffect(() => {
    if (startListening) {
      handleToggleVoice();
    }
    return () => {
      speechService.stopListening();
    };
  }, [startListening]);

  useEffect(() => {
    const flag = checkClientSideRedFlags(inputTranscript);
    setClientRedFlag(flag);
  }, [inputTranscript]);

  const handleToggleVoice = () => {
    if (micStatus === 'listening') {
      speechService.stopListening();
    } else {
      setMicStatus('listening');
      const activeLang = language || 'en';
      const started = speechService.startListening({
        language: activeLang,
        onResult: ({ transcript, isFinal }) => {
          setInputTranscript(transcript);
          if (isFinal) {
            setMicStatus('idle');
          }
        },
        onTranscribing: (isTranscribing) => {
          setMicStatus(isTranscribing ? 'transcribing' : 'idle');
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
          setMicStatus('idle');
        },
        onEnd: () => {
          setMicStatus('idle');
        }
      });

      if (!started) {
        setMicStatus('idle');
      }
    }
  };

  const handleSendTriage = async (e) => {
    if (e) e.preventDefault();
    if (!inputTranscript.trim()) return;

    speechService.stopListening();
    setIsEvaluating(true);

    try {
      const patientContext = activePatient ? {
        name: activePatient.full_name,
        relationship: activePatient.relationship,
        age: activePatient.date_of_birth
          ? Math.abs(new Date(Date.now() - new Date(activePatient.date_of_birth).getTime()).getUTCFullYear() - 1970)
          : null,
        conditions: activePatient.existing_conditions || ''
      } : null;

      const response = await runTriage({
        user_input: inputTranscript,
        language: language === 'auto' ? 'auto' : language,
        conversation_history: [],
        patient_context: patientContext
      });

      const sessId = `sess-${Date.now()}`;
      setTriageData({
        user_input: inputTranscript,
        detected_language: language,
        conversation_history: [],
        latest_response: response,
        sessionId: sessId
      });

      // Persist session to Supabase tables
      supabaseService.recordTriageSession({
        sessionId: sessId,
        userInput: inputTranscript,
        detectedLanguage: language,
        conversationHistory: [],
        decision: response
      });

      setIsEvaluating(false);

      if (response.requires_emergency_path || response.urgency === 'immediate') {
        navigate('/emergency');
      } else if (response.follow_up_question) {
        navigate('/followup');
      } else {
        navigate('/result');
      }
    } catch (err) {
      console.error('Triage error:', err);
      setIsEvaluating(false);
      alert('Unable to process symptoms. Please check connection or call 112 for emergency help.');
    }
  };

  const wordCount = inputTranscript.trim() ? inputTranscript.trim().split(/\s+/).length : 0;

  const sttHint = micStatus === 'listening'
    ? (language === 'hi'
        ? 'बोलना जारी रखें... समाप्त होने पर टैप करें'
        : (language === 'hinglish'
            ? 'Bolte rahein... bolna khatam hone par tap karein'
            : 'Speak naturally in Hindi or English... tap when finished'))
    : 'Multilingual STT (Hindi & English active)';

  return (
    <div className="dp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .dp-page {
          --dp-ink: #101e33;
          --dp-ink-2: #2d4261;
          --dp-muted: #577094;
          --dp-faint: #8ca2c0;
          --dp-line: #d2e0f0;
          --dp-line-2: #bdd1ea;
          --dp-tint: #edf3fa;
          --dp-accent: #3f64ae;
          --dp-accent-deep: #1b3560;
          --dp-accent-vibrant: #2968db;
          --dp-accent-soft: #edf4fe;
          --dp-red: #dc2626;
          --dp-red-deep: #b91c1c;
          --dp-red-soft: #fef2f2;
          --dp-red-line: #fecaca;
          --dp-amber: #c07a1a;
          --dp-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--dp-ink);
          -webkit-font-smoothing: antialiased;
        }
        .dp-page button { -webkit-tap-highlight-color: transparent; }
        .dp-page ::selection { background: rgba(63, 100, 174, .16); }
        .dp-page :focus-visible { outline: 2px solid var(--dp-accent); outline-offset: 2px; }

        @keyframes dp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes dp-spin { to { transform: rotate(360deg); } }
        @keyframes dp-blink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes dp-bar { from { transform: scaleY(.15); } to { transform: scaleY(1); } }
        @keyframes dp-halo {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, .6); }
          65% { box-shadow: 0 0 0 12px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        @keyframes dp-throb {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, .3); }
          55% { box-shadow: 0 0 0 9px rgba(220, 38, 38, 0); }
        }
        @keyframes dp-scan { from { transform: translateX(-110%); } to { transform: translateX(285%); } }

        /* ---------- Top bar ---------- */
        .dp-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; animation: dp-rise .5s ease both; }
        .dp-back { display: inline-flex; align-items: center; gap: 7px; background: transparent; border: 1px solid transparent; border-radius: 10px; padding: 8px 13px; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--dp-ink-2); cursor: pointer; transition: all .18s ease; }
        .dp-back:hover { background: #fff; border-color: var(--dp-line); color: var(--dp-ink); }
        .dp-back svg { transition: transform .18s ease; }
        .dp-back:hover svg { transform: translateX(-2px); }
        .dp-patient { display: inline-flex; align-items: center; gap: 10px; background: #fff; border: 1px solid var(--dp-line); border-radius: 999px; padding: 5px 14px 5px 5px; font-size: 12.5px; color: var(--dp-muted); min-width: 0; }
        .dp-patient__av { width: 27px; height: 27px; border-radius: 50%; background: var(--dp-accent-soft); color: var(--dp-accent); display: grid; place-items: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .dp-patient__txt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dp-patient strong { color: var(--dp-ink); font-weight: 600; }

        /* ---------- Card ---------- */
        .dp-card { position: relative; overflow: hidden; background: #fff; border: 1px solid var(--dp-line); border-radius: 20px; padding: 32px 36px 28px; box-shadow: 0 1px 2px rgba(16, 30, 51, .04), 0 16px 40px -20px rgba(27, 53, 96, .12); animation: dp-rise .55s .07s ease both; }
        .dp-card.is-busy::before { content: ''; position: absolute; top: 0; left: 0; height: 2px; width: 36%; background: var(--dp-accent); animation: dp-scan 1.15s ease-in-out infinite alternate; }

        /* ---------- Stepper ---------- */
        .dp-steps { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .dp-step { display: flex; align-items: baseline; gap: 7px; white-space: nowrap; }
        .dp-step i { font-style: normal; font-family: var(--dp-mono); font-size: 10.5px; letter-spacing: .04em; color: var(--dp-faint); }
        .dp-step b { font-size: 11px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; color: var(--dp-faint); }
        .dp-step.is-active i { color: var(--dp-accent); font-weight: 700; }
        .dp-step.is-active b { color: var(--dp-ink); }
        .dp-rail { flex: 1; height: 1px; background: var(--dp-line); min-width: 14px; }

        /* ---------- Heading ---------- */
        .dp-overline { display: flex; align-items: center; gap: 10px; font-size: 10.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--dp-accent); margin: 0 0 12px; }
        .dp-overline::before { content: ''; width: 22px; height: 2px; border-radius: 2px; background: var(--dp-accent); }
        .dp-h1 { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 34px; font-weight: 600; line-height: 1.12; letter-spacing: -.018em; margin: 0 0 10px; text-wrap: balance; }
        .dp-sub { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--dp-ink-2); max-width: 54ch; }

        /* ---------- Emergency banner ---------- */
        .dp-alert { display: flex; align-items: flex-start; gap: 15px; background: var(--dp-red-soft); border: 1.5px solid var(--dp-red-line); border-radius: 16px; padding: 18px 20px; margin: 24px 0 4px; animation: dp-rise .5s .12s ease both; }
        .dp-alert__ic { width: 42px; height: 42px; border-radius: 12px; background: #fee2e2; color: #dc2626; display: grid; place-items: center; flex-shrink: 0; animation: dp-throb 2s ease-out infinite; }
        .dp-alert__t { margin: 1px 0 4px; font-size: 14.5px; font-weight: 700; letter-spacing: -.01em; color: #991b1b; }
        .dp-alert__x { margin: 0; font-size: 13px; line-height: 1.55; color: #b91c1c; }
        .dp-alert__cta { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; background: #dc2626; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6), 0 4px 14px rgba(220, 38, 38, 0.4); animation: dp-halo 2s infinite ease-in-out; transition: all .18s ease; }
        .dp-alert__cta:hover { background: #b91c1c; transform: translateY(-1px); }
        .dp-alert__cta:active { transform: translateY(0); }

        /* ---------- Voice module ---------- */
        .dp-voice { display: flex; align-items: center; gap: 24px; background: var(--dp-tint); border: 1px solid var(--dp-line); border-radius: 16px; padding: 18px 22px; margin-top: 24px; }
        .dp-voice-ctl { display: flex; flex-direction: column; align-items: center; gap: 9px; flex-shrink: 0; }
        .dp-mic { width: 62px; height: 62px; border-radius: 50%; border: none; background: #3f64ae; color: #fff; display: grid; place-items: center; cursor: pointer; transition: transform .18s ease, background .2s ease; }
        .dp-mic:hover:not(:disabled) { transform: translateY(-1px); background: #34579d; }
        .dp-mic:active:not(:disabled) { transform: scale(.95); }
        .dp-mic.is-live { background: var(--dp-red); animation: dp-halo 1.9s ease-out infinite; }
        .dp-mic:disabled { background: #b7b2a7; cursor: not-allowed; box-shadow: none; }
        .dp-mic-cap { font-size: 10.5px; font-weight: 600; color: var(--dp-muted); text-align: center; max-width: 88px; line-height: 1.35; }
        .dp-voice-main { flex: 1; min-width: 0; }
        .dp-status { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
        .dp-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dp-faint); flex-shrink: 0; transition: background .2s; }
        .dp-dot.is-live { background: var(--dp-red); animation: dp-blink 1.15s ease-in-out infinite; }
        .dp-dot.is-busy { background: var(--dp-amber); animation: dp-blink .8s ease-in-out infinite; }
        .dp-hint { margin: 5px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--dp-muted); }
        .dp-wave-row { display: flex; align-items: center; gap: 14px; margin-top: 14px; }
        .dp-wave { display: flex; align-items: center; gap: 3px; height: 32px; flex: 1; min-width: 0; overflow: hidden; }
        .dp-wave span { flex: 1 1 3px; min-width: 2px; max-width: 4px; height: 100%; border-radius: 2px; background: var(--dp-faint); opacity: .4; transform: scaleY(.16); transition: transform .4s ease, opacity .4s ease, background .3s ease; }
        .dp-wave.is-live span { background: var(--dp-red); opacity: .9; animation: dp-bar .8s ease-in-out infinite alternate; }
        .dp-timer { font-family: var(--dp-mono); font-size: 12.5px; font-weight: 500; color: var(--dp-red); font-variant-numeric: tabular-nums; letter-spacing: .03em; flex-shrink: 0; }
        .dp-langpill { display: inline-flex; align-items: center; gap: 6px; font-family: var(--dp-mono); font-size: 10.5px; font-weight: 500; letter-spacing: .09em; color: var(--dp-muted); border: 1px solid var(--dp-line); background: #fff; border-radius: 999px; padding: 4px 10px; flex-shrink: 0; }

        /* ---------- Divider ---------- */
        .dp-divider { display: flex; align-items: center; gap: 14px; margin: 24px 0 14px; }
        .dp-divider::before, .dp-divider::after { content: ''; flex: 1; height: 1px; background: var(--dp-line); }
        .dp-divider span { font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--dp-faint); }

        /* ---------- Transcript ---------- */
        .dp-lrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .dp-label { font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--dp-ink-2); }
        .dp-lmeta { display: flex; align-items: center; gap: 10px; }
        .dp-count { font-family: var(--dp-mono); font-size: 10.5px; color: var(--dp-faint); font-variant-numeric: tabular-nums; }
        .dp-clear { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; padding: 4px 8px; border-radius: 7px; font-family: inherit; font-size: 12px; font-weight: 500; color: var(--dp-muted); cursor: pointer; transition: all .15s ease; }
        .dp-clear:hover { color: var(--dp-red); background: var(--dp-red-soft); }
        .dp-input { display: block; width: 100%; box-sizing: border-box; min-height: 150px; resize: vertical; background: #ffffff; border: 1px solid var(--dp-line); border-radius: 14px; padding: 16px 18px; font-family: inherit; font-size: 16px; line-height: 1.6; color: var(--dp-ink); transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
        .dp-input::placeholder { color: #8fa5c2; }
        .dp-input:hover { border-color: var(--dp-line-2); }
        .dp-input:focus { outline: none; border-color: var(--dp-accent); background: #fff; box-shadow: 0 0 0 3.5px rgba(63, 100, 174, .12); }
        .dp-input::-webkit-scrollbar { width: 8px; }
        .dp-input::-webkit-scrollbar-thumb { background: var(--dp-line-2); border-radius: 4px; }

        /* ---------- Example chips ---------- */
        .dp-ex { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; }
        .dp-ex__l { font-size: 12px; color: var(--dp-muted); margin-right: 2px; }
        .dp-chip { background: #fff; border: 1px solid var(--dp-line-2); border-radius: 999px; padding: 6px 13px; font-family: inherit; font-size: 12.5px; color: var(--dp-ink-2); cursor: pointer; transition: all .16s ease; }
        .dp-chip:hover { border-color: var(--dp-accent); color: var(--dp-accent); background: var(--dp-accent-soft); transform: translateY(-1px); }
        .dp-chip:active { transform: translateY(0); }

        /* ---------- Footer ---------- */
        .dp-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--dp-line); }
        .dp-privacy { display: flex; align-items: center; gap: 8px; font-size: 12.5px; line-height: 1.45; color: var(--dp-muted); max-width: 300px; }
        .dp-privacy svg { color: var(--dp-accent); flex-shrink: 0; }
        .dp-submit { display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 50px; padding: 0 26px; background: #2b4984; color: #fff; border: none; border-radius: 13px; font-family: inherit; font-size: 15px; font-weight: 600; letter-spacing: -.01em; cursor: pointer; transition: transform .18s ease, background .18s ease; }
        .dp-submit:hover:not(:disabled) { background: #223c6e; transform: translateY(-1px); }
        .dp-submit:active:not(:disabled) { transform: translateY(0) scale(.985); }
        .dp-submit:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
        .dp-submit svg { transition: transform .18s ease; }
        .dp-submit:hover:not(:disabled) svg { transform: translateX(3px); }
        .dp-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, .35); border-top-color: #fff; animation: dp-spin .7s linear infinite; flex-shrink: 0; }

        /* ---------- Emergency footnote ---------- */
        .dp-em { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 20px 0 0; font-size: 12px; color: var(--dp-faint); animation: dp-rise .6s .16s ease both; }
        .dp-em a { color: var(--dp-red); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(179, 56, 44, .35); transition: text-decoration-color .15s; }
        .dp-em a:hover { text-decoration-color: var(--dp-red); }

        /* ---------- Responsive Phone Optimization ---------- */
        @media (max-width: 768px) {
          .dp-page { padding: 0 2px; }
          .dp-topbar { flex-wrap: wrap; margin-bottom: 10px; gap: 8px; }
          .dp-back { padding: 6px 10px; font-size: 11.5px; }
          .dp-patient { padding: 4px 10px 4px 4px; font-size: 11px; }
          .dp-patient__av { width: 22px; height: 22px; font-size: 9px; }
          .dp-card { padding: 16px 14px 14px; border-radius: 16px; box-shadow: 0 4px 16px rgba(16, 30, 51, .06); }
          .dp-steps { margin-bottom: 12px; gap: 8px; }
          .dp-step b { display: none; }
          .dp-step i { font-size: 9.5px; }
          .dp-overline { font-size: 9px; letter-spacing: .15em; margin: 0 0 6px; }
          .dp-overline::before { width: 16px; height: 2px; }
          .dp-h1 { font-size: 19px; line-height: 1.2; margin-bottom: 4px; }
          .dp-sub { font-size: 12px; line-height: 1.42; margin-bottom: 6px; }
          .dp-voice { flex-direction: column; align-items: stretch; gap: 10px; padding: 11px 12px; margin-top: 10px; border-radius: 12px; }
          .dp-voice-ctl { flex-direction: row; align-items: center; gap: 10px; }
          .dp-mic { width: 38px; height: 38px; }
          .dp-mic svg { width: 18px; height: 18px; }
          .dp-mic-cap { max-width: none; text-align: left; font-size: 9.5px; }
          .dp-status { font-size: 12.5px; }
          .dp-hint { font-size: 11px; margin-top: 2px; }
          .dp-wave-row { margin-top: 8px; }
          .dp-wave { height: 22px; }
          .dp-divider { margin: 12px 0 8px; }
          .dp-divider span { font-size: 9px; letter-spacing: .12em; }
          .dp-lrow { margin-bottom: 6px; }
          .dp-label { font-size: 9.5px; letter-spacing: .12em; }
          .dp-count { font-size: 9.5px; }
          .dp-input { min-height: 72px; font-size: 13px; line-height: 1.45; padding: 8px 10px; border-radius: 10px; }
          .dp-ex { gap: 6px; margin-top: 8px; }
          .dp-ex__l { font-size: 11px; }
          .dp-chip { font-size: 11px; padding: 3px 8px; }
          .dp-footer { flex-direction: column-reverse; align-items: stretch; gap: 10px; margin-top: 14px; padding-top: 12px; }
          .dp-privacy { max-width: none; justify-content: center; text-align: center; font-size: 10.5px; line-height: 1.35; }
          .dp-submit { width: 100%; height: 36px; font-size: 12.5px; padding: 0 14px; border-radius: 9px; }
          .dp-em { margin: 12px 0 0; font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dp-page *, .dp-page *::before, .dp-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Top bar — back + patient context */}
      <div className="dp-topbar">
        <button type="button" className="dp-back" onClick={() => navigate('/')}>
          <ArrowLeft size={15} />
          <span>{t('back_to_overview')}</span>
        </button>

        {activePatient ? (
          <div className="dp-patient">
            <span className="dp-patient__av">{getInitials(activePatient.full_name)}</span>
            <span className="dp-patient__txt">
              {t('target_patient')} <strong>{activePatient.full_name}</strong> ({activePatient.relationship})
            </span>
          </div>
        ) : (
          <div className="dp-patient">
            <span className="dp-patient__av"><Users size={13} /></span>
            <span className="dp-patient__txt">{t('anonymous_intake')}</span>
          </div>
        )}
      </div>

      {/* Main clinical intake surface */}
      <div className={`dp-card ${isEvaluating ? 'is-busy' : ''}`}>
        {/* Flow stepper */}
        <div className="dp-steps" aria-hidden="true">
          <span className="dp-step is-active"><i>01</i><b>Describe</b></span>
          <span className="dp-rail" />
          <span className="dp-step"><i>02</i><b>Assess</b></span>
          <span className="dp-rail" />
          <span className="dp-step"><i>03</i><b>Guidance</b></span>
        </div>

        {/* Heading */}
        <p className="dp-overline">Symptom intake</p>
        <h1 className="dp-h1">{t('describe_heading')}</h1>
        <p className="dp-sub">{t('describe_subheading')}</p>

        {/* Client-side safety net */}
        {clientRedFlag && (
          <div className="dp-alert" role="alert">
            <span className="dp-alert__ic"><AlertOctagon size={22} /></span>
            <div>
              <p className="dp-alert__t">Critical emergency symptom flagged — {clientRedFlag.label}</p>
              <p className="dp-alert__x">
                If the patient is in acute distress, bypass triage and connect to emergency response services immediately.
              </p>
              <button type="button" className="dp-alert__cta" onClick={() => navigate('/emergency')}>
                <Phone size={14} />
                <span>Proceed to Emergency Dispatch (112)</span>
              </button>
            </div>
          </div>
        )}

        {/* Voice module */}
        <div className="dp-voice">
          <div className="dp-voice-ctl">
            <button
              type="button"
              className={`dp-mic ${micStatus === 'listening' ? 'is-live' : ''}`}
              onClick={handleToggleVoice}
              disabled={micStatus === 'transcribing'}
              aria-label={micStatus === 'listening' ? t('finish_speaking') : t('start_recording')}
            >
              {micStatus === 'listening' ? <MicOff size={22} /> : <Mic size={21} />}
            </button>
            <span className="dp-mic-cap">
              {micStatus === 'listening'
                ? t('finish_speaking')
                : (micStatus === 'transcribing' ? 'Transcribing...' : t('start_recording'))}
            </span>
          </div>

          <div className="dp-voice-main">
            <div className="dp-status">
              <span className={`dp-dot ${micStatus === 'listening' ? 'is-live' : ''} ${micStatus === 'transcribing' ? 'is-busy' : ''}`} />
              {micStatus === 'listening'
                ? t('voice_recording')
                : (micStatus === 'transcribing' ? 'Transcribing audio...' : t('voice_ready'))}
            </div>
            <p className="dp-hint">{sttHint}</p>

            <div className="dp-wave-row">
              <div className={`dp-wave ${micStatus === 'listening' ? 'is-live' : ''}`} aria-hidden="true">
                {Array.from({ length: 26 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      animationDelay: `${(i * 137) % 900}ms`,
                      animationDuration: `${520 + ((i * 173) % 480)}ms`
                    }}
                  />
                ))}
              </div>
              {micStatus === 'listening' ? (
                <span className="dp-timer">{formatClock(recSeconds)}</span>
              ) : (
                <span className="dp-langpill"><Languages size={12} />EN · HI</span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="dp-divider"><span>Or type it below</span></div>

        {/* Transcript */}
        <div className="dp-lrow">
          <span className="dp-label">{t('transcript_notes')}</span>
          <span className="dp-lmeta">
            {wordCount > 0 && <span className="dp-count">{wordCount} words</span>}
            {inputTranscript && (
              <button type="button" className="dp-clear" onClick={() => setInputTranscript('')}>
                <RotateCcw size={12} />
                <span>{t('clear_input')}</span>
              </button>
            )}
          </span>
        </div>

        <textarea
          className="dp-input"
          rows={6}
          placeholder={t('symptom_placeholder')}
          value={inputTranscript}
          onChange={(e) => setInputTranscript(e.target.value)}
        />

        {/* Example prompts */}
        <div className="dp-ex">
          <span className="dp-ex__l">Start with an example:</span>
          {EXAMPLE_PROMPTS.map((p) => (
            <button key={p} type="button" className="dp-chip" onClick={() => setInputTranscript(p)}>
              {p}
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div className="dp-footer">
          <span className="dp-privacy">
            <ShieldCheck size={15} />
            <span>Private &amp; confidential — your description is processed securely.</span>
          </span>

          <button
            id="submit-triage-button"
            type="button"
            className="dp-submit"
            disabled={!inputTranscript.trim() || isEvaluating}
            onClick={handleSendTriage}
          >
            {isEvaluating ? (
              <>
                <span className="dp-spinner" />
                <span>{t('evaluating_pathway')}</span>
              </>
            ) : (
              <>
                <span>{t('run_triage_btn')}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emergency footnote */}
      <p className="dp-em">
        <Phone size={11} />
        <span>Life-threatening emergency? Call <a href="tel:112">112</a> immediately.</span>
      </p>
    </div>
  );
};