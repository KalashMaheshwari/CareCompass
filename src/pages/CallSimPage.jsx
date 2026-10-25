import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, MessageSquare, Mic, Send, Volume2, Navigation,
  CheckCheck, Video, MoreVertical, Signal, Wifi, BatteryFull,
  ShieldCheck, Languages, AlertTriangle, ArrowLeft, Smile, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { runTriage } from '../services/triageEngine';

const KEYS = [
  { k: '1', sub: '' }, { k: '2', sub: 'ABC' }, { k: '3', sub: 'DEF' },
  { k: '4', sub: 'GHI' }, { k: '5', sub: 'JKL' }, { k: '6', sub: 'MNO' },
  { k: '7', sub: 'PQRS' }, { k: '8', sub: 'TUV' }, { k: '9', sub: 'WXYZ' },
  { k: '*', sub: '' }, { k: '0', sub: '+' }, { k: '#', sub: '' }
];

const fmtClock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Renders WhatsApp's *bold* markdown visually — same string, richer display
const renderRich = (text) =>
  text.split(/(\*[^*]+\*)/g).map((p, i) =>
    p.startsWith('*') && p.endsWith('*') && p.length > 2
      ? <strong key={i}>{p.slice(1, -1)}</strong>
      : <span key={i}>{p}</span>
  );

export const CallSimPage = () => {
  const { t, language } = useApp();
  const [activeChannel, setActiveChannel] = useState('call');

  // --- Voice Call Simulation State ---
  const [callStep, setCallStep] = useState(0); // 0: Idle, 1: IVR Lang, 2: Listening, 3: Spoken Result
  const [callLang, setCallLang] = useState('hi');
  const [callResult, setCallResult] = useState(null);

  // Presentational only — call duration shown on the phone screen
  const [callClock, setCallClock] = useState(0);
  useEffect(() => {
    if (callStep === 0) { setCallClock(0); return; }
    const tick = setInterval(() => setCallClock((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [callStep]);

  const startPhoneCall = () => {
    setCallStep(1);
    speechService.speak('केयरकम्पास में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। For English, press 2.', {
      language: 'hi'
    });
  };

  const handlePressKey = (key) => {
    if (callStep === 1) {
      if (key === '1') {
        setCallLang('hi');
        setCallStep(2);
        speechService.speak('कृपया अपनी बीमारी या समस्या के बारे में बोलिए। हम सुन रहे हैं।', {
          language: 'hi'
        });
      } else {
        setCallLang('en');
        setCallStep(2);
        speechService.speak('Please describe the health issue in your own words. We are listening.', {
          language: 'en'
        });
      }
    }
  };

  const handleSimulateUserSpeech = async (speechText) => {
    setCallStep(3);
    const triage = await runTriage({
      user_input: speechText,
      language: callLang
    });
    setCallResult(triage);

    const spokenOutput = callLang === 'hi'
      ? `आपके लक्षणों के अनुसार, ${triage.care_type === 'nurse' ? 'एक नर्स आज आपके घर आकर जाँच करेंगी' : 'पैरामेडिक टीम सहायता के लिए उपलब्ध है'}। यदि साँस में तकलीफ़ हो तो तुरंत 112 डायल करें।`
      : `Based on your symptoms, a nurse can visit you at home today. Call 112 immediately if breathing becomes difficult.`;

    speechService.speak(spokenOutput, { language: callLang });
  };

  const hangUpCall = () => {
    speechService.stopSpeaking();
    setCallStep(0);
    setCallResult(null);
  };

  // --- WhatsApp Simulation State ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to CareCompass WhatsApp Care Routing. You can type or send voice descriptions in Hindi, English, or Hinglish.',
      time: '10:00 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Presentational only — keep the newest message in view
  const chatScrollRef = useRef(null);
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput('');

    const response = await runTriage({
      user_input: currentInput,
      language: 'auto'
    });

    let botReply = `*${response.urgency === 'immediate' ? 'CRITICAL DISPATCH ESCALATION' : 'Recommended Care Pathway'}*\n\n` +
      `Recommended Care: *${(response.care_type || 'nurse').toUpperCase().replace('_', ' ')}*\n` +
      `Urgency Level: *${(response.urgency || 'same_day').toUpperCase()}*\n\n` +
      `${response.reasoning}\n\n` +
      `*Safety Net:* If breathing becomes difficult or acute chest pain occurs, dial 112 immediately.`;

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Caption text shown on the device screen (strings preserved from the original UI)
  const callCaption = callStep === 1
    ? '"केयरकम्पास में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। For English, press 2."'
    : callStep === 2
      ? '"कृपया अपनी समस्या के बारे में बोलें। हम सुन रहे हैं..."'
      : callStep === 3 && callResult
        ? (callLang === 'hi'
            ? `आपके लक्षणों के अनुसार, ${callResult.care_type === 'nurse' ? 'एक नर्स आज आपके घर आकर जाँच करेंगी' : 'पैरामेडिक टीम सहायता के लिए उपलब्ध है'}।`
            : `A nurse can visit you at home today based on your reported symptoms.`)
        : '';

  return (
    <div className="cs-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .cs-page {
          --cs-ink: #101e33;
          --cs-ink-2: #2d4261;
          --cs-muted: #577094;
          --cs-faint: #8ca2c0;
          --cs-line: #d2e0f0;
          --cs-line-2: #bdd1ea;
          --cs-tint: #edf3fa;
          --cs-accent: #3f64ae;
          --cs-accent-deep: #1b3560;
          --cs-accent-vibrant: #2968db;
          --cs-accent-soft: #edf4fe;
          --cs-red: #b3382c;
          --cs-red-deep: #8a2a20;
          --cs-red-soft: #faf0ed;
          --cs-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 980px;
          margin: 0 auto;
          width: 100%;
          overflow-x: clip;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--cs-ink);
          -webkit-font-smoothing: antialiased;
        }
        .cs-page button { -webkit-tap-highlight-color: transparent; font-family: inherit; }
        .cs-page ::selection { background: rgba(63, 100, 174, .16); }
        .cs-page :focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px; }

        @keyframes cs-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes cs-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.78); } }
        @keyframes cs-bar { from { transform: scaleY(.16); } to { transform: scaleY(1); } }
        @keyframes cs-ring { 0% { transform: scale(.9); opacity: .9; } 75%, 100% { transform: scale(1.45); opacity: 0; } }

        /* ---------- Page head ---------- */
        .cs-head { animation: cs-rise .5s ease both; }
        .cs-overline { display: flex; align-items: center; gap: 10px; font-size: 10.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--cs-accent); margin: 0 0 12px; }
        .cs-overline::before { content: ''; width: 22px; height: 2px; border-radius: 2px; background: var(--cs-accent); }
        .cs-h1 { font-family: 'Fraunces', Georgia, serif; font-size: 34px; font-weight: 600; line-height: 1.12; letter-spacing: -.018em; margin: 0 0 10px; }
        .cs-sub { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--cs-ink-2); max-width: 58ch; }

        /* ---------- Segmented channel control ---------- */
        .cs-seg { display: flex; gap: 6px; width: 100%; max-width: 660px; margin: 26px auto 0; background: #fff; border: 1px solid var(--cs-line); border-radius: 16px; padding: 5px; box-shadow: 0 1px 2px rgba(28, 36, 32, .05); }
        .cs-seg-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 9px; border: none; background: transparent; border-radius: 12px; padding: 11px 14px; font-size: 13px; font-weight: 600; color: var(--cs-muted); cursor: pointer; white-space: nowrap; transition: all .18s ease; }
        .cs-seg-btn:hover { color: var(--cs-ink); }
        .cs-seg-btn.active { background: #3f64ae; color: #fff; }

        /* ---------- Split layout ---------- */
        .cs-split { display: grid; grid-template-columns: 318px minmax(0, 1fr); gap: 28px; align-items: start; margin-top: 28px; }
        .cs-phonecol { display: flex; flex-direction: column; align-items: center; animation: cs-rise .55s .07s ease both; }
        .cs-phonecap { margin-top: 14px; font-family: var(--cs-mono); font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--cs-faint); }

        /* ---------- Device frame ---------- */
        .cs-phone { position: relative; width: 318px; }
        .cs-phone::before { content: ''; position: absolute; inset: -34px -44px; background: radial-gradient(closest-side, rgba(63, 100, 174, .09), transparent 75%); pointer-events: none; }
        .cs-frame { position: relative; background: #171d1a; border: 1px solid #2a332e; border-radius: 50px; padding: 11px; box-shadow: 0 34px 68px -30px rgba(28, 36, 32, .55); }
        .cs-frame::before, .cs-frame::after { content: ''; position: absolute; width: 3px; background: #232b27; border-radius: 3px; }
        .cs-frame::before { right: -2.5px; top: 150px; height: 56px; }
        .cs-frame::after { right: -2.5px; top: 216px; height: 34px; }
        .cs-screen { position: relative; height: 620px; border-radius: 39px; overflow: hidden; background: radial-gradient(120% 90% at 50% 0%, #141b17 0%, #0b100d 75%); display: flex; flex-direction: column; color: #e8ede9; }
        .cs-screen--wa { background: #ece5dd; color: #111b21; }
        .cs-island { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 94px; height: 25px; background: #000; border-radius: 999px; z-index: 8; }
        .cs-statusbar { display: flex; justify-content: space-between; align-items: center; padding: 13px 24px 0; font-family: var(--cs-mono); font-size: 11px; color: #cfd8d2; z-index: 6; flex-shrink: 0; }
        .cs-statusbar__icons { display: inline-flex; align-items: center; gap: 5px; }
        .cs-homebar { position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%); width: 104px; height: 4px; border-radius: 999px; background: rgba(255, 255, 255, .3); z-index: 8; pointer-events: none; }
        .cs-homebar--dark { background: rgba(17, 27, 33, .28); }

        /* ---------- Dialer (idle) ---------- */
        .cs-dial { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 20px; }
        .cs-dial__num { font-family: var(--cs-mono); font-size: 30px; font-weight: 600; letter-spacing: .08em; color: #fff; }
        .cs-dial__sub { font-size: 12px; color: #8fa097; }
        .cs-dial__btn { margin-top: 36px; width: 68px; height: 68px; border-radius: 50%; border: none; background: #3f64ae; color: #fff; display: grid; place-items: center; cursor: pointer; transition: transform .18s ease, background .18s ease; }
        .cs-dial__btn:hover { background: #34579d; transform: translateY(-2px); }
        .cs-dial__btn:active { transform: scale(.94); }
        .cs-dial__hint { margin-top: 14px; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #6d7f76; }

        /* ---------- Active call screen ---------- */
        .cs-call { flex: 1; display: flex; flex-direction: column; min-height: 0; padding: 44px 16px 12px; }
        .cs-call-top { text-align: center; flex-shrink: 0; margin-bottom: 4px; }
        .cs-call__av { width: 56px; height: 56px; border-radius: 50%; background: rgba(255, 255, 255, .07); border: 1px solid rgba(255, 255, 255, .12); color: #3f64ae; display: grid; place-items: center; margin: 0 auto 10px; }
        .cs-call__name { font-size: 17px; font-weight: 600; letter-spacing: -.01em; color: #fff; }
        .cs-call__meta { margin-top: 4px; font-family: var(--cs-mono); font-size: 10px; letter-spacing: .16em; color: #8fa097; font-variant-numeric: tabular-nums; }
        .cs-call-body { flex: 1; min-height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; }
        .cs-call__state { font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9fb3a9; text-align: center; }
        .cs-wave { display: flex; align-items: center; justify-content: center; gap: 3px; height: 40px; width: 82%; }
        .cs-wave span { width: 3px; border-radius: 2px; background: #3f64ae; height: 100%; transform: scaleY(.16); opacity: .85; }
        .cs-wave--live span { animation: cs-bar .7s ease-in-out infinite alternate; }
        .cs-orb { position: relative; width: 76px; height: 76px; border-radius: 50%; background: rgba(63, 100, 174, .15); border: 1.5px solid rgba(63, 100, 174, .45); color: #3f64ae; display: grid; place-items: center; }
        .cs-orb::before, .cs-orb::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(63, 100, 174, .35); animation: cs-ring 2.2s ease-out infinite; }
        .cs-orb::after { animation-delay: 1.1s; }
        .cs-caption { flex-shrink: 0; margin: 8px 2px 8px; background: rgba(255, 255, 255, .055); border: 1px solid rgba(255, 255, 255, .09); border-radius: 12px; padding: 10px 13px 11px; font-size: 12.5px; line-height: 1.6; color: #dbe5de; max-height: 96px; overflow-y: auto; }
        .cs-cap-label { display: flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #7fa392; margin-bottom: 6px; }
        .cs-keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; padding: 2px; flex-shrink: 0; }
        .cs-key { height: 48px; border-radius: 13px; background: rgba(255, 255, 255, .05); border: 1px solid rgba(255, 255, 255, .085); color: #e8ede9; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; transition: background .15s ease, transform .1s ease; }
        .cs-key b { font-size: 18px; font-weight: 600; line-height: 1; }
        .cs-key span { font-size: 8px; font-weight: 700; letter-spacing: .13em; color: #77887e; text-transform: uppercase; min-height: 9px; line-height: 9px; }
        .cs-key:hover { background: rgba(255, 255, 255, .1); }
        .cs-key:active { transform: scale(.92); background: rgba(255, 255, 255, .16); }
        .cs-key--hot { background: rgba(63, 100, 174, .2); border-color: rgba(63, 100, 174, .55); }
        .cs-key--hot span { color: #3f64ae; }
        .cs-call-actions { display: flex; justify-content: center; padding: 8px 0 2px; flex-shrink: 0; }
        .cs-endbtn { width: 56px; height: 56px; border-radius: 50%; border: none; background: #dc2626; color: #fff; display: grid; place-items: center; cursor: pointer; animation: ting-emergency 2s infinite ease-in-out; transition: transform .16s ease, background .16s ease; }
        .cs-endbtn:hover { background: #b91c1c; transform: translateY(-1px); }
        .cs-endbtn:active { transform: scale(.93); }

        /* ---------- Console (right column) ---------- */
        .cs-console { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
        .cs-console .cs-card:nth-child(1) { animation-delay: .1s; }
        .cs-console .cs-card:nth-child(2) { animation-delay: .16s; }
        .cs-card { box-sizing: border-box; background: #fff; border: 1px solid var(--cs-line); border-radius: 20px; padding: 24px 26px; box-shadow: 0 1px 2px rgba(28, 36, 32, .05), 0 16px 40px -24px rgba(28, 36, 32, .14); animation: cs-rise .55s ease both; }
        .cs-card__h { font-family: 'Fraunces', Georgia, serif; font-size: 20px; font-weight: 600; letter-spacing: -.015em; margin: 0 0 8px; }
        .cs-card__p { font-size: 14px; line-height: 1.65; color: var(--cs-ink-2); margin: 0 0 16px; }
        .cs-card__hint { font-size: 12.5px; font-weight: 600; color: var(--cs-muted); margin: 0 0 10px; }
        .cs-card__micro { font-size: 11.5px; color: var(--cs-faint); margin: 12px 0 0; }

        .cs-trackhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .cs-trackhead h3 { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--cs-ink-2); }
        .cs-live { display: inline-flex; align-items: center; gap: 6px; font-family: var(--cs-mono); font-size: 9.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--cs-faint); background: var(--cs-tint); border: 1px solid var(--cs-line); border-radius: 999px; padding: 4px 10px; }
        .cs-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--cs-faint); }
        .cs-live.on { color: var(--cs-accent-deep); background: var(--cs-accent-soft); border-color: #bfdbfe; }
        .cs-live.on i { background: var(--cs-accent); animation: cs-pulse 1.4s ease-in-out infinite; }
        .cs-track { display: flex; align-items: center; gap: 8px; }
        .cs-track__step { display: flex; align-items: center; gap: 7px; }
        .cs-track__step i { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--cs-line-2); display: grid; place-items: center; font-style: normal; font-family: var(--cs-mono); font-size: 9px; font-weight: 700; color: var(--cs-faint); flex-shrink: 0; transition: all .25s ease; }
        .cs-track__step span { font-size: 11px; font-weight: 600; color: var(--cs-faint); white-space: nowrap; }
        .cs-track__step.done i { background: var(--cs-accent-soft); border-color: var(--cs-accent); color: var(--cs-accent); }
        .cs-track__step.done span { color: var(--cs-ink-2); }
        .cs-track__step.cur i { background: var(--cs-accent); border-color: var(--cs-accent); color: #fff; }
        .cs-track__step.cur span { color: var(--cs-ink); font-weight: 700; }
        .cs-track__rail { flex: 1; min-width: 10px; height: 2px; border-radius: 2px; background: var(--cs-line); }
        .cs-track__rail.done { background: var(--cs-accent); }

        .cs-tags { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 18px; }
        .cs-tags span { font-family: var(--cs-mono); font-size: 9.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--cs-muted); background: var(--cs-tint); border: 1px solid var(--cs-line); border-radius: 999px; padding: 4px 10px; }

        .cs-quote { display: flex; gap: 12px; align-items: flex-start; background: var(--cs-tint); border: 1px solid var(--cs-line); border-radius: 13px; padding: 14px 16px; margin: 2px 0 16px; }
        .cs-quote svg { color: var(--cs-accent); flex-shrink: 0; margin-top: 2px; }
        .cs-quote p { margin: 0; font-size: 14.5px; line-height: 1.65; color: var(--cs-ink); }

        .cs-keytags { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .cs-keytag { display: inline-flex; align-items: center; gap: 9px; background: #fff; border: 1px solid var(--cs-line-2); border-radius: 11px; padding: 7px 13px 7px 7px; font-size: 13px; font-weight: 600; color: var(--cs-ink-2); }
        .cs-keytag b { width: 26px; height: 26px; border-radius: 8px; background: var(--cs-accent-soft); color: var(--cs-accent); display: grid; place-items: center; font-family: var(--cs-mono); font-size: 13px; }

        .cs-says { display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px; }
        .cs-say { display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box; text-align: left; background: #fff; border: 1.5px solid var(--cs-line); border-radius: 13px; padding: 12px 14px; font-size: 13.5px; font-weight: 500; color: var(--cs-ink); cursor: pointer; transition: all .16s ease; }
        .cs-say:hover { border-color: var(--cs-ink-2); background: var(--cs-tint); transform: translateY(-1px); }
        .cs-say:active { transform: none; }
        .cs-say__ic { width: 34px; height: 34px; border-radius: 10px; background: var(--cs-accent-soft); color: var(--cs-accent); display: grid; place-items: center; flex-shrink: 0; }
        .cs-say--crit { border-color: #fecaca; background: #fff5f5; }
        .cs-say--crit:hover { border-color: #dc2626; background: #fef2f2; }
        .cs-say__ic--crit { background: #fee2e2; color: #dc2626; }
        .cs-say em { font-style: normal; font-family: var(--cs-mono); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; background: #dc2626; color: #fff; border-radius: 6px; padding: 3px 7px; margin-left: auto; flex-shrink: 0; }

        .cs-resp-label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--cs-accent); margin: 2px 0 10px; }
        .cs-card__resp { font-size: 15px; line-height: 1.65; color: var(--cs-ink); margin: 0 0 14px; }
        .cs-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .cs-chip { font-family: var(--cs-mono); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--cs-accent-deep); background: var(--cs-accent-soft); border: 1px solid #bfdbfe; border-radius: 999px; padding: 5px 11px; }

        .cs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; width: 100%; box-sizing: border-box; height: 47px; padding: 0 18px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; letter-spacing: -.005em; cursor: pointer; transition: transform .16s ease, background .16s ease, border-color .16s ease, color .16s ease; }
        .cs-btn--ink { background: #3f64ae; color: #fff; }
        .cs-btn--ink:hover { background: #34579d; transform: translateY(-1px); }
        .cs-btn--danger { background: #dc2626; color: #fff; animation: ting-emergency 2s infinite ease-in-out; }
        .cs-btn--danger:hover { background: #b91c1c; transform: translateY(-1px); }
        .cs-btn--ghostdanger { background: #fff; border: 1.5px solid #fecaca; color: #dc2626; }
        .cs-btn--ghostdanger:hover { border-color: #dc2626; background: #fef2f2; }

        /* ---------- WhatsApp client ---------- */
        .cs-wa-top { background: #075e54; flex-shrink: 0; }
        .cs-wa-top .cs-statusbar { color: #d3ece4; padding-bottom: 2px; }
        .cs-wa-head { display: flex; align-items: center; gap: 10px; padding: 8px 13px 11px; color: #fff; }
        .cs-wa-back { color: #fff; opacity: .92; flex-shrink: 0; }
        .cs-wa-av { width: 36px; height: 36px; border-radius: 50%; background: #128c7e; display: grid; place-items: center; flex-shrink: 0; }
        .cs-wa-id { flex: 1; min-width: 0; }
        .cs-wa-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cs-wa-sub { font-size: 10.5px; color: #dcf8c6; margin-top: 1px; }
        .cs-wa-icons { display: flex; align-items: center; gap: 15px; color: #fff; opacity: .92; flex-shrink: 0; }
        .cs-wa-chat { flex: 1; min-height: 0; overflow-y: auto; padding: 14px 12px 12px; display: flex; flex-direction: column; gap: 7px; background-color: #ece5dd; background-image: radial-gradient(rgba(0, 0, 0, .035) 1.4px, transparent 1.5px), radial-gradient(rgba(0, 0, 0, .025) 1.4px, transparent 1.5px); background-size: 110px 110px, 70px 70px; background-position: 0 0, 35px 45px; }
        .cs-wa-chat::-webkit-scrollbar { width: 6px; }
        .cs-wa-chat::-webkit-scrollbar-thumb { background: rgba(11, 20, 26, .18); border-radius: 3px; }
        .cs-wa-day { align-self: center; background: rgba(255, 255, 255, .82); color: #51705f; font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; border-radius: 8px; padding: 5px 11px; box-shadow: 0 1px .5px rgba(11, 20, 26, .12); margin-bottom: 4px; }
        .cs-msg { position: relative; max-width: 82%; padding: 8px 10px 6px; border-radius: 9px; font-size: 13px; line-height: 1.48; box-shadow: 0 1px .5px rgba(11, 20, 26, .14); }
        .cs-msg--bot { align-self: flex-start; background: #fff; border-top-left-radius: 2px; }
        .cs-msg--bot::before { content: ''; position: absolute; top: 0; left: -8px; border-top: 8px solid #fff; border-left: 8px solid transparent; }
        .cs-msg--user { align-self: flex-end; background: #dcf8c6; border-top-right-radius: 2px; }
        .cs-msg--user::before { content: ''; position: absolute; top: 0; right: -8px; border-top: 8px solid #dcf8c6; border-right: 8px solid transparent; }
        .cs-msg__text { white-space: pre-line; word-wrap: break-word; }
        .cs-msg__text strong { font-weight: 700; }
        .cs-msg__meta { display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 3px; font-size: 9.5px; color: rgba(17, 27, 33, .45); }
        .cs-msg--user .cs-msg__meta svg { color: #53bdeb; }
        .cs-wa-input { display: flex; align-items: center; gap: 9px; padding: 8px 10px 12px; background: #f0f2f0; flex-shrink: 0; }
        .cs-wa-tool { color: #5f6b66; flex-shrink: 0; }
        .cs-wa-field { flex: 1; min-width: 0; height: 40px; border: none; border-radius: 999px; background: #fff; padding: 0 16px; font-family: inherit; font-size: 13px; color: #111b21; outline: none; box-shadow: 0 1px .5px rgba(11, 20, 26, .1); }
        .cs-wa-field::placeholder { color: #8696a0; }
        .cs-wa-field:focus { box-shadow: 0 0 0 2px rgba(18, 140, 126, .35); }
        .cs-wa-send { width: 40px; height: 40px; border-radius: 50%; border: none; background: #128c7e; color: #fff; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; transition: transform .15s ease, background .15s ease; }
        .cs-wa-send:hover { background: #0d7266; }
        .cs-wa-send:active { transform: scale(.92); }

        /* ---------- Console: notes & prompts ---------- */
        .cs-notes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 13px; }
        .cs-notes li { display: flex; align-items: flex-start; gap: 11px; font-size: 13.5px; line-height: 1.55; color: var(--cs-ink-2); }
        .cs-notes svg { color: var(--cs-accent); flex-shrink: 0; margin-top: 2px; }
        .cs-prompts { display: flex; flex-direction: column; gap: 8px; }
        .cs-prompt { text-align: left; background: #fff; border: 1px solid var(--cs-line-2); border-radius: 11px; padding: 10px 14px; font-size: 13px; color: var(--cs-ink-2); cursor: pointer; transition: all .15s ease; }
        .cs-prompt:hover { border-color: var(--cs-accent); color: var(--cs-accent); background: var(--cs-accent-soft); }

        /* ---------- Responsive ---------- */
        @media (max-width: 920px) {
          .cs-split { grid-template-columns: 1fr; gap: 26px; }
        }
        @media (max-width: 768px) {
          .cs-page { padding: 0 2px; }
          .cs-head { margin-bottom: 12px; }
          .cs-overline { font-size: 9px; letter-spacing: .12em; margin-bottom: 4px; }
          .cs-h1 { font-size: 19px; line-height: 1.22; margin-bottom: 4px; }
          .cs-sub { font-size: 11.5px; line-height: 1.42; margin-bottom: 12px; }
          .cs-seg { max-width: none; margin-bottom: 14px; gap: 6px; padding: 4px; border-radius: 12px; }
          .cs-seg-btn { font-size: 11.5px; padding: 7px 10px; border-radius: 9px; line-height: 1.3; }
          .cs-card { padding: 16px 14px 14px; border-radius: 16px; margin-bottom: 14px; }
          .cs-screen { height: 450px; }
          .cs-track__step span { font-size: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cs-page *, .cs-page *::before, .cs-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Page head */}
      <header className="cs-head">
        <p className="cs-overline">Channel simulator</p>
        <h1 className="cs-h1">Multichannel Triage Simulator</h1>
        <p className="cs-sub">
          Demonstrates reach to feature-phone and low-literacy users via automated Toll-Free IVR and verified WhatsApp Chatbot channels.
        </p>
      </header>

      {/* Channel segmented control */}
      <div className="cs-seg" role="tablist">
        <button
          type="button"
          role="tab"
          aria-pressed={activeChannel === 'call'}
          className={`cs-seg-btn ${activeChannel === 'call' ? 'active' : ''}`}
          onClick={() => {
            speechService.stopSpeaking();
            setActiveChannel('call');
          }}
        >
          <Phone size={15} />
          <span>Interactive Automated IVR (1800-CARE)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-pressed={activeChannel === 'whatsapp'}
          className={`cs-seg-btn ${activeChannel === 'whatsapp' ? 'active' : ''}`}
          onClick={() => {
            speechService.stopSpeaking();
            setActiveChannel('whatsapp');
          }}
        >
          <MessageSquare size={15} />
          <span>WhatsApp Care Dispatch Bot</span>
        </button>
      </div>

      {/* ================= IVR SIMULATOR ================= */}
      {activeChannel === 'call' && (
        <div className="cs-split" key="call">

          {/* The device */}
          <div className="cs-phonecol">
            <div className="cs-phone">
              <div className="cs-frame">
                <div className="cs-screen">
                  <div className="cs-island" />
                  <div className="cs-statusbar">
                    <span>9:41</span>
                    <span className="cs-statusbar__icons">
                      <Signal size={12} /><Wifi size={12} /><BatteryFull size={13} />
                    </span>
                  </div>

                  {callStep === 0 ? (
                    /* Idle dialer */
                    <div className="cs-dial">
                      <div className="cs-dial__num">1800-CARE</div>
                      <div className="cs-dial__sub">CareCompass Tele-Triage</div>
                      <button
                        type="button"
                        className="cs-dial__btn"
                        onClick={startPhoneCall}
                        aria-label="Initiate Call (Dial 1800-CARE)"
                      >
                        <Phone size={25} />
                      </button>
                      <span className="cs-dial__hint">Tap to dial · Toll-free</span>
                    </div>
                  ) : (
                    /* Active call screen */
                    <div className="cs-call">
                      <div className="cs-call-top">
                        <div className="cs-call__av"><Phone size={22} /></div>
                        <div className="cs-call__name">1800-CARE</div>
                        <div className="cs-call__meta">
                          {callStep === 1 ? 'IVR MENU' : callStep === 2 ? 'LISTENING' : 'RESPONDING'} · {fmtClock(callClock)}
                        </div>
                      </div>

                      <div className="cs-call-body">
                        {callStep === 1 && (
                          <>
                            <div className="cs-wave cs-wave--live" aria-hidden="true">
                              {Array.from({ length: 24 }).map((_, i) => (
                                <span
                                  key={i}
                                  style={{ animationDelay: `${(i * 137) % 760}ms`, animationDuration: `${480 + ((i * 173) % 420)}ms` }}
                                />
                              ))}
                            </div>
                            <span className="cs-call__state">Automated IVR speaking</span>
                          </>
                        )}
                        {callStep === 2 && (
                          <>
                            <div className="cs-orb"><Mic size={26} /></div>
                            <span className="cs-call__state">Listening — caller speaking</span>
                          </>
                        )}
                        {callStep === 3 && (
                          <>
                            <div className="cs-wave cs-wave--live" aria-hidden="true">
                              {Array.from({ length: 24 }).map((_, i) => (
                                <span
                                  key={i}
                                  style={{ animationDelay: `${(i * 137) % 760}ms`, animationDuration: `${480 + ((i * 173) % 420)}ms` }}
                                />
                              ))}
                            </div>
                            <span className="cs-call__state">Speaking care guidance</span>
                          </>
                        )}
                      </div>

                      <div className="cs-caption">
                        <span className="cs-cap-label"><Volume2 size={11} /> Live audio</span>
                        {callCaption}
                      </div>

                      {callStep === 1 && (
                        <div className="cs-keypad">
                          {KEYS.map(({ k, sub }) => {
                            const hot = k === '1' || k === '2';
                            return (
                              <button
                                key={k}
                                type="button"
                                className={`cs-key ${hot ? 'cs-key--hot' : ''}`}
                                onClick={() => handlePressKey(k)}
                              >
                                <b>{k}</b>
                                <span>{hot ? (k === '1' ? 'हिन्दी' : 'English') : sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="cs-call-actions">
                        <button type="button" className="cs-endbtn" onClick={hangUpCall} aria-label="End Call">
                          <PhoneOff size={21} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="cs-homebar" />
                </div>
              </div>
            </div>
            <span className="cs-phonecap">Simulated feature phone</span>
          </div>

          {/* The console */}
          <div className="cs-console">
            <section className="cs-card">
              <div className="cs-trackhead">
                <h3>Call flow</h3>
                <span className={`cs-live ${callStep > 0 ? 'on' : ''}`}>
                  <i />{callStep > 0 ? 'Live' : 'Standby'}
                </span>
              </div>
              <div className="cs-track" aria-hidden="true">
                {['Dial-in', 'Language', 'Listening', 'Guidance'].map((label, i) => (
                  <React.Fragment key={label}>
                    {i > 0 && <span className={`cs-track__rail ${callStep >= i ? 'done' : ''}`} />}
                    <span className={`cs-track__step ${callStep === i ? 'cur' : ''} ${callStep > i ? 'done' : ''}`}>
                      <i>{callStep > i ? <Check size={10} strokeWidth={3.5} /> : String(i + 1).padStart(2, '0')}</i>
                      <span>{label}</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </section>

            {callStep === 0 && (
              <section className="cs-card">
                <h2 className="cs-card__h">Feature Phone Tele-Triage</h2>
                <p className="cs-card__p">
                  Simulate a patient or elderly family member dialing into the automated voice routing server from a basic keypad phone.
                </p>
                <div className="cs-tags">
                  <span>Toll-free</span>
                  <span>Keypad-only</span>
                  <span>Voice-first</span>
                </div>
                <button type="button" className="cs-btn cs-btn--ink" onClick={startPhoneCall}>
                  <Phone size={16} />
                  <span>Initiate Call (Dial 1800-CARE)</span>
                </button>
              </section>
            )}

            {callStep === 1 && (
              <section className="cs-card">
                <h2 className="cs-card__h">Select your language</h2>
                <div className="cs-quote">
                  <Volume2 size={17} />
                  <p>"केयरकम्पास में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। For English, press 2."</p>
                </div>
                <p className="cs-card__hint">On the keypad, press:</p>
                <div className="cs-keytags">
                  <span className="cs-keytag"><b>1</b> हिन्दी</span>
                  <span className="cs-keytag"><b>2</b> English</span>
                </div>
                <button type="button" className="cs-btn cs-btn--ghostdanger" onClick={hangUpCall}>
                  <PhoneOff size={15} />
                  <span>End Call</span>
                </button>
              </section>
            )}

            {callStep === 2 && (
              <section className="cs-card">
                <h2 className="cs-card__h">Caller describes symptoms</h2>
                <p className="cs-card__hint">Simulate caller describing their situation:</p>
                <div className="cs-says">
                  <button
                    type="button"
                    className="cs-say"
                    onClick={() => handleSimulateUserSpeech('Papa ko do din se bukhar hai aur khansi bhi')}
                  >
                    <span className="cs-say__ic"><Mic size={15} /></span>
                    <span>"Papa ko do din se bukhar hai aur khansi bhi"</span>
                  </button>
                  <button
                    type="button"
                    className="cs-say cs-say--crit"
                    onClick={() => handleSimulateUserSpeech('Saans nahi aa rahi, behosh ho rahe hain')}
                  >
                    <span className="cs-say__ic cs-say__ic--crit"><AlertTriangle size={15} /></span>
                    <span>"Saans nahi aa rahi, behosh ho rahe hain"</span>
                    <em>Emergency</em>
                  </button>
                </div>
                <button type="button" className="cs-btn cs-btn--ghostdanger" onClick={hangUpCall}>
                  <PhoneOff size={15} />
                  <span>End Call</span>
                </button>
              </section>
            )}

            {callStep === 3 && callResult && (
              <section className="cs-card">
                <span className="cs-resp-label">Automated Voice Synthesizer Response:</span>
                <p className="cs-card__resp">{callCaption}</p>
                <div className="cs-chips">
                  <span className="cs-chip">Care · {(callResult.care_type || 'nurse').toUpperCase()}</span>
                  <span className="cs-chip">Urgency · {(callResult.urgency || 'same_day').toUpperCase()}</span>
                </div>
                <button type="button" className="cs-btn cs-btn--danger" onClick={hangUpCall}>
                  <PhoneOff size={15} />
                  <span>Terminate Call</span>
                </button>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ================= WHATSAPP SIMULATOR ================= */}
      {activeChannel === 'whatsapp' && (
        <div className="cs-split" key="whatsapp">

          {/* The device */}
          <div className="cs-phonecol">
            <div className="cs-phone">
              <div className="cs-frame">
                <div className="cs-screen cs-screen--wa">
                  <div className="cs-island" />

                  <div className="cs-wa-top">
                    <div className="cs-statusbar">
                      <span>9:41</span>
                      <span className="cs-statusbar__icons">
                        <Signal size={12} /><Wifi size={12} /><BatteryFull size={13} />
                      </span>
                    </div>
                    <div className="cs-wa-head">
                      <ArrowLeft size={17} className="cs-wa-back" />
                      <div className="cs-wa-av"><Navigation size={17} /></div>
                      <div className="cs-wa-id">
                        <div className="cs-wa-name">CareCompass Health Navigator</div>
                        <div className="cs-wa-sub">Online · Verified Dispatch Integration</div>
                      </div>
                      <div className="cs-wa-icons">
                        <Video size={16} />
                        <Phone size={15} />
                        <MoreVertical size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="cs-wa-chat" ref={chatScrollRef}>
                    <span className="cs-wa-day">Today</span>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`cs-msg ${msg.sender === 'user' ? 'cs-msg--user' : 'cs-msg--bot'}`}>
                        <div className="cs-msg__text">{renderRich(msg.text)}</div>
                        <div className="cs-msg__meta">
                          <span>{msg.time}</span>
                          {msg.sender === 'user' && <CheckCheck size={13} />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form className="cs-wa-input" onSubmit={handleSendChat}>
                    <Smile size={19} className="cs-wa-tool" />
                    <input
                      type="text"
                      className="cs-wa-field"
                      placeholder="Send message in Hindi, English, or Hinglish..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <Mic size={19} className="cs-wa-tool" />
                    <button type="submit" className="cs-wa-send" aria-label="Send">
                      <Send size={16} />
                    </button>
                  </form>

                  <div className="cs-homebar cs-homebar--dark" />
                </div>
              </div>
            </div>
            <span className="cs-phonecap">Simulated WhatsApp client</span>
          </div>

          {/* The console */}
          <div className="cs-console">
            <section className="cs-card">
              <h2 className="cs-card__h">Verified WhatsApp bot</h2>
              <ul className="cs-notes">
                <li>
                  <Languages size={15} />
                  <span>Hindi, English &amp; Hinglish — auto-detected per message</span>
                </li>
                <li>
                  <Mic size={15} />
                  <span>Accepts typed descriptions or voice notes</span>
                </li>
                <li>
                  <ShieldCheck size={15} />
                  <span>Verified Dispatch Integration</span>
                </li>
                <li>
                  <Phone size={15} />
                  <span>Safety net — red-flag symptoms advise dialling 112</span>
                </li>
              </ul>
            </section>

            <section className="cs-card">
              <h2 className="cs-card__h">Try a quick prompt</h2>
              <div className="cs-prompts">
                {[
                  'Papa ko do din se bukhar hai aur khansi bhi',
                  'Meri maa ko subah se chakkar aa rahe hain',
                  'Chest pain since morning, feeling weak'
                ].map((p) => (
                  <button key={p} type="button" className="cs-prompt" onClick={() => setChatInput(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <p className="cs-card__micro">Prompts prefill the composer — press send to run triage.</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};