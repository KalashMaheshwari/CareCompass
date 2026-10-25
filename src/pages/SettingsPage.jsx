import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Users, UserPlus, Edit2, Check, CheckCircle2, 
  Volume2, VolumeX, Languages, Sliders, ShieldCheck, Activity, 
  ChevronRight, Sparkles, RotateCcw, ArrowRight, ArrowLeft, Lock,
  Play, Square, Globe, Radio, FileText, IndianRupee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { dataService } from '../services/supabase';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const SettingsPage = ({ defaultTab = 'profile' }) => {
  const { 
    language, 
    setLanguage, 
    fontSize, 
    setFontSize, 
    readAloud, 
    setReadAloud, 
    speechRate, 
    setSpeechRate,
    user, 
    setUser, 
    members, 
    loadMembers, 
    activePatient, 
    setActivePatient, 
    navigate, 
    hasConsented, 
    setConsent, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSelectPatient = (member) => {
    setActivePatient(member);
  };

  const handleTestAudio = () => {
    if (isPlayingSample) {
      speechService.stopSpeaking();
      setIsPlayingSample(false);
      return;
    }

    const sampleText = t('audio_sample_text') || 
      (language === 'hi' 
        ? 'नमस्ते! केयरकम्पास आपकी और आपके परिवार की स्वास्थ्य सुरक्षा और सही डॉक्टर तक पहुंचने में तुरंत सहायता करता है।'
        : (language === 'hinglish' 
          ? 'Hello! CareCompass aapki aur aapki family ki safe healthcare aur doctor consultation mein help karta hai.'
          : 'Hello! CareCompass helps navigate you and your family to the safest clinical care pathway immediately.'));

    setIsPlayingSample(true);
    speechService.speak(sampleText, {
      language: language === 'hi' ? 'hi' : 'en',
      rate: speechRate || 1.0,
      onStart: () => setIsPlayingSample(true),
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false)
    });
  };

  const handleQuickDemoUser = (persona = 'rohit') => {
    const loggedUser = dataService.signInDemo(persona);
    setUser(loggedUser);
    loadMembers();
    if (persona === 'sunita') {
      setLanguage('hi');
    } else {
      setLanguage('hinglish');
    }
  };

  const handleResetData = () => {
    localStorage.removeItem('carecompass_members');
    localStorage.removeItem('carecompass_bookings');
    localStorage.removeItem('carecompass_dispatches');
    loadMembers();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  return (
    <div className="stp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .stp-page {
          --stp-ink: #101e33;
          --stp-ink-2: #2d4261;
          --stp-muted: #577094;
          --stp-faint: #8ca2c0;
          --stp-line: #d2e0f0;
          --stp-line-2: #bdd1ea;
          --stp-tint: #edf3fa;
          --stp-accent: #3f64ae;
          --stp-accent-deep: #1b3560;
          --stp-accent-vibrant: #2968db;
          --stp-accent-soft: #edf4fe;
          --stp-red: #b3382c;
          --stp-red-soft: #faf0ed;
          --stp-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 960px;
          margin: 0 auto;
          width: 100%;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--stp-ink);
          -webkit-font-smoothing: antialiased;
        }
        .stp-page button { -webkit-tap-highlight-color: transparent; font-family: inherit; }
        .stp-page ::selection { background: rgba(63, 100, 174, .16); }
        .stp-page :focus-visible { outline: 2px solid var(--stp-accent); outline-offset: 2px; }

        @keyframes stp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes stp-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.75); } }
        @keyframes stp-bar { from { transform: scaleY(.2); } to { transform: scaleY(1); } }

        /* ---------- Top Bar ---------- */
        .stp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
          animation: stp-rise .5s ease both;
        }
        .stp-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--stp-ink-2);
          cursor: pointer;
          transition: all .18s ease;
        }
        .stp-back:hover {
          background: #fdfdfc;
          border-color: var(--stp-line-2);
          color: var(--stp-ink);
          transform: translateX(-2px);
        }
        .stp-patient-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-radius: 999px;
          padding: 5px 14px 5px 6px;
          font-size: 12.5px;
          color: var(--stp-muted);
        }
        .stp-patient-av {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--stp-accent-soft);
          color: var(--stp-accent);
          display: grid;
          place-items: center;
          font-size: 10.5px;
          font-weight: 700;
        }

        /* ---------- Header Block ---------- */
        .stp-head {
          margin-bottom: 28px;
          animation: stp-rise .5s .05s ease both;
        }
        .stp-overline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--stp-accent);
          margin-bottom: 10px;
        }
        .stp-overline::before {
          content: '';
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: var(--stp-accent);
        }
        .stp-h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 32px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -.02em;
          margin: 0 0 8px;
          color: var(--stp-ink);
        }
        .stp-sub {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: var(--stp-ink-2);
          max-width: 65ch;
        }

        /* ---------- Segmented Navigation Tabs ---------- */
        .stp-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--stp-tint);
          border: 1px solid var(--stp-line);
          border-radius: 14px;
          padding: 5px;
          margin-bottom: 28px;
          overflow-x: auto;
        }
        .stp-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--stp-ink-2);
          cursor: pointer;
          transition: all .16s ease;
          white-space: nowrap;
        }
        .stp-tab-btn:hover {
          color: var(--stp-ink);
          background: rgba(255, 255, 255, 0.6);
        }
        .stp-tab-btn.is-active {
          background: #ffffff;
          color: var(--stp-accent);
          box-shadow: 0 2px 6px rgba(28, 36, 32, .06);
        }
        .stp-pill-badge {
          font-family: var(--stp-mono);
          font-size: 10.5px;
          padding: 2px 7px;
          border-radius: 999px;
          background: var(--stp-accent-soft);
          color: var(--stp-accent);
          font-weight: 700;
        }

        /* ---------- Card Architecture ---------- */
        .stp-card {
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-radius: 20px;
          padding: 30px 32px;
          box-shadow: 0 1px 2px rgba(28, 36, 32, .05), 0 16px 40px -20px rgba(28, 36, 32, .14);
          margin-bottom: 24px;
          animation: stp-rise .55s ease both;
        }
        .stp-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .stp-card-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--stp-ink);
        }
        .stp-card-desc {
          margin: 0;
          font-size: 13.5px;
          color: var(--stp-muted);
          line-height: 1.5;
        }

        /* ---------- Active Patient Spotlight Hero Card ---------- */
        .stp-spotlight {
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-left: 4px solid var(--stp-accent);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 26px;
          animation: stp-rise .5s .08s ease both;
        }
        .stp-spotlight-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .stp-spotlight-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--stp-accent);
          background: var(--stp-accent-soft);
          padding: 5px 12px;
          border-radius: 999px;
        }
        .stp-dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--stp-accent);
          animation: stp-pulse 1.8s ease-in-out infinite;
        }
        .stp-spotlight-body {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .stp-spotlight-av {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #3f64ae;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .stp-spotlight-main {
          flex: 1;
          min-width: 240px;
        }
        .stp-spotlight-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 6px;
          color: var(--stp-ink);
        }
        .stp-spotlight-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          margin-bottom: 12px;
        }
        .stp-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid var(--stp-line);
          color: var(--stp-ink-2);
        }
        .stp-spotlight-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .stp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #3f64ae;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
        }
        .stp-btn-primary:hover {
          background: #34579d;
          transform: translateY(-1px);
        }
        .stp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          color: var(--stp-ink-2);
          border: 1px solid var(--stp-line);
          border-radius: 12px;
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
        }
        .stp-btn-secondary:hover {
          background: var(--stp-tint);
          border-color: var(--stp-line-2);
          color: var(--stp-ink);
        }

        /* ---------- Family Cards Grid ---------- */
        .stp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .stp-member-card {
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all .18s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .stp-member-card:hover {
          border-color: var(--stp-line-2);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -8px rgba(28, 36, 32, .12);
        }
        .stp-member-card.is-active {
          border-color: var(--stp-accent);
          background: #fdfefd;
          box-shadow: 0 0 0 1px var(--stp-accent), 0 8px 20px -8px rgba(63, 100, 174, .15);
        }
        .stp-member-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }
        .stp-member-av-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stp-member-av {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--stp-tint);
          border: 1px solid var(--stp-line);
          color: var(--stp-ink);
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 14px;
        }
        .stp-member-card.is-active .stp-member-av {
          background: var(--stp-accent-soft);
          color: var(--stp-accent);
          border-color: var(--stp-accent);
        }
        .stp-member-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--stp-ink);
          margin: 0;
        }
        .stp-member-sub {
          font-size: 12px;
          color: var(--stp-muted);
          margin-top: 1px;
        }
        .stp-active-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--stp-accent);
          background: var(--stp-accent-soft);
          padding: 3px 8px;
          border-radius: 999px;
        }
        .stp-member-conds {
          font-size: 12px;
          color: var(--stp-ink-2);
          line-height: 1.5;
          margin: 10px 0;
          background: var(--stp-tint);
          border-radius: 10px;
          padding: 8px 12px;
        }
        .stp-member-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--stp-line);
        }
        .stp-link-btn {
          font-size: 12px;
          color: var(--stp-muted);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color .15s ease;
        }
        .stp-link-btn:hover {
          color: var(--stp-accent);
        }

        .stp-member-add {
          background: var(--stp-tint);
          border: 1px dashed var(--stp-line-2);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          cursor: pointer;
          transition: all .18s ease;
        }
        .stp-member-add:hover {
          background: #ffffff;
          border-color: var(--stp-accent);
          transform: translateY(-2px);
        }
        .stp-add-ic {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--stp-line);
          color: var(--stp-accent);
          display: grid;
          place-items: center;
        }

        /* ---------- Language Cards ---------- */
        .stp-lang-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .stp-lang-card {
          background: #ffffff;
          border: 1px solid var(--stp-line);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all .18s ease;
          position: relative;
        }
        .stp-lang-card:hover {
          border-color: var(--stp-line-2);
          transform: translateY(-2px);
        }
        .stp-lang-card.is-active {
          border-color: var(--stp-accent);
          background: var(--stp-accent-soft);
          box-shadow: 0 0 0 1px var(--stp-accent);
        }
        .stp-lang-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .stp-lang-native {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--stp-ink);
        }
        .stp-lang-label {
          font-size: 13px;
          color: var(--stp-muted);
        }

        /* ---------- Audio / Voice Controls ---------- */
        .stp-voice-box {
          background: var(--stp-tint);
          border: 1px solid var(--stp-line);
          border-radius: 16px;
          padding: 20px 22px;
          margin-top: 14px;
        }
        .stp-row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Custom Switch */
        .stp-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .stp-switch input { opacity: 0; width: 0; height: 0; }
        .stp-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--stp-line-2);
          transition: .2s;
          border-radius: 24px;
        }
        .stp-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .stp-switch input:checked + .stp-slider { background-color: var(--stp-accent); }
        .stp-switch input:checked + .stp-slider:before { transform: translateX(20px); }

        .stp-rates-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stp-rate-chip {
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid var(--stp-line);
          background: #ffffff;
          font-family: var(--stp-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--stp-ink-2);
          cursor: pointer;
          transition: all .15s ease;
        }
        .stp-rate-chip.is-active {
          background: var(--stp-accent);
          color: #ffffff;
          border-color: var(--stp-accent);
        }
        .stp-wave-anim {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 14px;
        }
        .stp-wave-anim span {
          width: 2.5px;
          height: 100%;
          background: #ffffff;
          border-radius: 1.5px;
          animation: stp-bar .5s ease-in-out infinite alternate;
        }
        .stp-wave-anim span:nth-child(2) { animation-delay: .15s; }
        .stp-wave-anim span:nth-child(3) { animation-delay: .3s; }

        /* Mobile Phone Layout Downscale & Spacious Hierarchy */
        @media (max-width: 768px) {
          .stp-page { padding: 0 2px; }
          .stp-topbar { margin-bottom: 10px; }
          .stp-back { padding: 6px 10px; font-size: 11.5px; }
          .stp-patient-badge { padding: 4px 10px 4px 4px; font-size: 11px; }
          .stp-head { margin-bottom: 12px; }
          .stp-overline { font-size: 9px; letter-spacing: .12em; margin-bottom: 4px; }
          .stp-h1 { font-size: 19px; line-height: 1.22; margin-bottom: 4px; }
          .stp-sub { font-size: 11.5px; line-height: 1.42; margin-bottom: 12px; }
          .stp-tabs { gap: 6px; padding: 4px; border-radius: 12px; margin-bottom: 14px; overflow-x: auto; flex-wrap: nowrap; }
          .stp-tab-btn { padding: 7px 12px; font-size: 12px; gap: 6px; border-radius: 9px; white-space: nowrap; }
          .stp-card { padding: 16px 14px 14px; border-radius: 16px; margin-bottom: 14px; }
          .stp-card-head { margin-bottom: 12px; }
          .stp-card-title { font-size: 14px; margin-bottom: 3px; }
          .stp-card-desc { font-size: 11.5px; line-height: 1.4; }
          .stp-btn { height: 34px; font-size: 12px; padding: 0 12px; border-radius: 9px; }
          .stp-member-add { padding: 14px; border-radius: 12px; gap: 6px; }
          .stp-add-ic { width: 34px; height: 34px; }
          .stp-spotlight { padding: 14px 14px 12px 14px; border-radius: 14px; margin-bottom: 14px; }
          .stp-spotlight-av { width: 40px; height: 40px; font-size: 15px; }
          .stp-spotlight-name { font-size: 16px; margin-bottom: 3px; }
          .stp-lang-grid { grid-template-columns: 1fr; gap: 8px; }
          .stp-lang-card { padding: 12px; border-radius: 12px; }
          .stp-row-between { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="stp-topbar">
        <button
          type="button"
          className="stp-back"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>

        {activePatient && (
          <div className="stp-patient-badge">
            <div className="stp-patient-av">
              {getInitials(activePatient.full_name)}
            </div>
            <span>Linked: <strong>{activePatient.full_name}</strong></span>
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="stp-head">
        <div className="stp-overline">Preferences & Clinical Profiles</div>
        <h1 className="stp-h1">{t('settings_title') || 'Settings & Patient Health Records'}</h1>
        <p className="stp-sub">
          {t('settings_subtitle') || 'Manage active patient records, family health profiles, language, voice assistance, and privacy.'}
        </p>
      </div>

      {/* Segmented Tabs Navigation */}
      <div className="stp-tabs" role="tablist">
        <button
          type="button"
          className={`stp-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>Profile & Family Records</span>
          {activePatient && (
            <span className="stp-pill-badge">{activePatient.full_name.split(' ')[0]}</span>
          )}
        </button>

        <button
          type="button"
          className={`stp-tab-btn ${activeTab === 'preferences' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Languages size={16} />
          <span>Language & Voice</span>
          <span className="stp-pill-badge">
            {language === 'hi' ? 'HI' : (language === 'hinglish' ? 'HN' : 'EN')}
          </span>
        </button>

        <button
          type="button"
          className={`stp-tab-btn ${activeTab === 'privacy' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          <ShieldCheck size={16} />
          <span>System & Privacy</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PROFILE & FAMILY
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div>
          {/* Active Patient Spotlight Card */}
          {activePatient && (
            <div className="stp-spotlight">
              <div className="stp-spotlight-top">
                <div className="stp-spotlight-tag">
                  <span className="stp-dot-pulse"></span>
                  <span>Active Patient Spotlight</span>
                </div>
                <span style={{ fontSize: '12px', color: '#3f64ae', fontWeight: 600 }}>
                  Personalized for Symptoms & Doctor Notes
                </span>
              </div>

              <div className="stp-spotlight-body">
                <div className="stp-spotlight-av">
                  {getInitials(activePatient.full_name)}
                </div>

                <div className="stp-spotlight-main">
                  <h2 className="stp-spotlight-name">{activePatient.full_name}</h2>
                  <div className="stp-spotlight-pills">
                    <span className="stp-pill">
                      <strong>Relationship:</strong> {activePatient.relationship || 'Self'}
                    </span>
                    {calculateAge(activePatient.date_of_birth) && (
                      <span className="stp-pill">
                        <strong>Age:</strong> {calculateAge(activePatient.date_of_birth)} yrs
                      </span>
                    )}
                    {activePatient.blood_group && (
                      <span className="stp-pill">
                        <strong>Blood Group:</strong> {activePatient.blood_group}
                      </span>
                    )}
                  </div>

                  {(activePatient.existing_conditions || activePatient.allergies) && (
                    <div style={{ fontSize: '13px', color: '#47534d', lineHeight: '1.5', marginBottom: '6px' }}>
                      {activePatient.existing_conditions && (
                        <span><strong>Conditions:</strong> {activePatient.existing_conditions} </span>
                      )}
                      {activePatient.allergies && (
                        <span>• <strong>Allergies:</strong> {activePatient.allergies}</span>
                      )}
                    </div>
                  )}

                  <div className="stp-spotlight-actions">
                    <button
                      type="button"
                      className="stp-btn-primary"
                      onClick={() => navigate('/describe')}
                    >
                      <Activity size={16} />
                      <span>Check Symptoms for {activePatient.full_name.split(' ')[0]}</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      className="stp-btn-secondary"
                      onClick={() => navigate(`/patients/${activePatient.id}`)}
                    >
                      <Edit2 size={14} />
                      <span>Edit Health Record</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Family Health Records Grid */}
          <div className="stp-card">
            <div className="stp-card-head">
              <div>
                <h3 className="stp-card-title">Family Health Records</h3>
                <p className="stp-card-desc">
                  Select a family member to instantly activate their health context for clinical triage and caregiver booking.
                </p>
              </div>

              <button
                type="button"
                className="stp-btn-primary"
                onClick={() => navigate('/patients/new')}
              >
                <UserPlus size={16} />
                <span>Add Family Member</span>
              </button>
            </div>

            <div className="stp-grid">
              {members.map((m) => {
                const isSelected = activePatient?.id === m.id;
                const age = calculateAge(m.date_of_birth);

                return (
                  <div
                    key={m.id}
                    className={`stp-member-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelectPatient(m)}
                  >
                    <div>
                      <div className="stp-member-top">
                        <div className="stp-member-av-row">
                          <div className="stp-member-av">
                            {getInitials(m.full_name)}
                          </div>
                          <div>
                            <h4 className="stp-member-name">{m.full_name}</h4>
                            <div className="stp-member-sub">
                              {m.relationship} {age ? `• ${age} yrs` : ''} {m.blood_group ? `• ${m.blood_group}` : ''}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="stp-active-tag">
                            <Check size={11} strokeWidth={2.5} />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      {m.existing_conditions && (
                        <div className="stp-member-conds">
                          <strong>Conditions:</strong> {m.existing_conditions}
                        </div>
                      )}
                    </div>

                    <div className="stp-member-foot">
                      <button
                        type="button"
                        className="stp-link-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patients/${m.id}`);
                        }}
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="stp-link-btn"
                        style={{ color: '#3f64ae', fontWeight: 600 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePatient(m);
                          navigate('/describe');
                        }}
                      >
                        <span>Check Symptoms</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Family Member Card */}
              <div
                className="stp-member-add"
                onClick={() => navigate('/patients/new')}
              >
                <div className="stp-add-ic">
                  <UserPlus size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#1c2420' }}>
                  Add Family Member
                </div>
                <div style={{ fontSize: '12px', color: '#7d877f' }}>
                  Store baseline vitals and conditions for parents, children, or spouse.
                </div>
              </div>
            </div>
          </div>

          {/* Account & Evaluation Personas */}
          <div className="stp-card">
            <div className="stp-card-head">
              <div>
                <h3 className="stp-card-title">Account & Demo Personas</h3>
                <p className="stp-card-desc">
                  Switch between seeded clinical testing personas or check authenticated account phone.
                </p>
              </div>
            </div>

            <div className="stp-row-between" style={{ background: '#f7f6f0', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e8e4da' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', display: 'grid', placeItems: 'center', border: '1px solid #e8e4da' }}>
                  <Lock size={18} color="#3f64ae" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#1c2420' }}>{user?.full_name || 'Rohit Sharma (Account Holder)'}</div>
                  <div style={{ fontSize: '12.5px', color: '#7d877f' }}>{user?.phone || '+91 98765 43210'} • Authenticated Demo Profile</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`stp-btn-secondary ${user?.full_name?.toLowerCase().includes('rohit') ? 'is-active' : ''}`}
                  onClick={() => handleQuickDemoUser('rohit')}
                  style={{ fontSize: '12.5px', padding: '7px 14px' }}
                >
                  Rohit (Hinglish)
                </button>
                <button
                  type="button"
                  className={`stp-btn-secondary ${user?.full_name?.toLowerCase().includes('sunita') ? 'is-active' : ''}`}
                  onClick={() => handleQuickDemoUser('sunita')}
                  style={{ fontSize: '12.5px', padding: '7px 14px' }}
                >
                  Sunita (Hindi)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LANGUAGE & VOICE
          ========================================================================= */}
      {activeTab === 'preferences' && (
        <div>
          {/* Language Selection Card */}
          <div className="stp-card">
            <div className="stp-card-head">
              <div>
                <h3 className="stp-card-title">Triage & Application Language</h3>
                <p className="stp-card-desc">
                  Select your primary language. Symptom assessment questions, clinical reasoning, and home remedies update immediately.
                </p>
              </div>
            </div>

            <div className="stp-lang-grid">
              {/* English */}
              <div
                className={`stp-lang-card ${language === 'en' ? 'is-active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                <div className="stp-lang-top">
                  <span className="stp-lang-native">English</span>
                  {language === 'en' && <CheckCircle2 size={18} color="#3f64ae" />}
                </div>
                <div className="stp-lang-label">Clear, empathetic clinical English</div>
              </div>

              {/* Hindi */}
              <div
                className={`stp-lang-card ${language === 'hi' ? 'is-active' : ''}`}
                onClick={() => setLanguage('hi')}
              >
                <div className="stp-lang-top">
                  <span className="stp-lang-native">हिन्दी</span>
                  {language === 'hi' && <CheckCircle2 size={18} color="#3f64ae" />}
                </div>
                <div className="stp-lang-label">शुद्ध व सरल हिन्दी (देवनागरी लिपि)</div>
              </div>

              {/* Hinglish */}
              <div
                className={`stp-lang-card ${language === 'hinglish' ? 'is-active' : ''}`}
                onClick={() => setLanguage('hinglish')}
              >
                <div className="stp-lang-top">
                  <span className="stp-lang-native">Hinglish</span>
                  {language === 'hinglish' && <CheckCircle2 size={18} color="#3f64ae" />}
                </div>
                <div className="stp-lang-label">Natural conversational Roman Hindi</div>
              </div>
            </div>
          </div>

          {/* Voice & Accessibility Assistance */}
          <div className="stp-card">
            <div className="stp-card-head">
              <div>
                <h3 className="stp-card-title">Voice & Read Aloud Engine</h3>
                <p className="stp-card-desc">
                  Automatic speech synthesis reads triage reasoning, caution steps, and emergency instructions aloud for elderly family members.
                </p>
              </div>
            </div>

            <div className="stp-voice-box">
              <div className="stp-row-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#edf3fc', color: '#3f64ae', display: 'grid', placeItems: 'center' }}>
                    {readAloud ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#1c2420' }}>Enable Read Aloud Assistance</div>
                    <div style={{ fontSize: '13px', color: '#7d877f' }}>Automatically play voice audio for questions and clinical advice</div>
                  </div>
                </div>

                <label className="stp-switch">
                  <input
                    type="checkbox"
                    checked={readAloud}
                    onChange={(e) => setReadAloud(e.target.checked)}
                  />
                  <span className="stp-slider"></span>
                </label>
              </div>

              <div className="stp-row-between" style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e8e4da' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#47534d' }}>Speech Rate:</span>
                  <div className="stp-rates-group">
                    {[0.8, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        className={`stp-rate-chip ${speechRate === rate ? 'is-active' : ''}`}
                        onClick={() => setSpeechRate(rate)}
                      >
                        {rate}x {rate === 0.8 ? '(Gentle)' : rate === 1.0 ? '(Normal)' : '(Fast)'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="stp-btn-primary"
                  onClick={handleTestAudio}
                >
                  {isPlayingSample ? (
                    <>
                      <div className="stp-wave-anim">
                        <span></span><span></span><span></span>
                      </div>
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="#ffffff" />
                      <span>Test Voice Assistant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYSTEM & PRIVACY
          ========================================================================= */}
      {activeTab === 'privacy' && (
        <div>
          <div className="stp-card">
            <div className="stp-card-head">
              <div>
                <h3 className="stp-card-title">Digital Personal Data Protection (DPDP)</h3>
                <p className="stp-card-desc">
                  CareCompass is built strictly compliant with India's Digital Personal Data Protection standards.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f7f6f0', border: '1px solid #e8e4da', borderRadius: '14px', padding: '18px' }}>
                <ShieldCheck size={22} color="#3f64ae" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 600 }}>Zero Prescription Mandate</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#7d877f', lineHeight: '1.5' }}>
                  Our AI engine never prescribes schedule drugs or antibiotics. It strictly recommends home comfort care, diagnostic tests, or nurse triage.
                </p>
              </div>

              <div style={{ background: '#f7f6f0', border: '1px solid #e8e4da', borderRadius: '14px', padding: '18px' }}>
                <Lock size={22} color="#3f64ae" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 600 }}>End-to-End Client Encryption</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#7d877f', lineHeight: '1.5' }}>
                  Patient health records and family clinical parameters are encrypted and never shared with third-party advertisers.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e8e4da', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                className="stp-btn-secondary"
                onClick={handleResetData}
                style={{ color: '#b3382c' }}
              >
                <RotateCcw size={14} />
                <span>{resetNotice ? 'Test Data Reset Successfully!' : 'Reset Local Demo Sessions & Cache'}</span>
              </button>

              <span style={{ fontSize: '12.5px', color: '#7d877f' }}>
                CareCompass Clinical Architecture v3.2
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
