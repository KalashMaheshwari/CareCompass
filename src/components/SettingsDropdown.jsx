import React, { useState, useEffect } from 'react';
import {
  Settings, User, Users, Volume2, VolumeX, Play, Square,
  Check, CheckCircle2, ShieldCheck, Sparkles, RotateCcw,
  UserPlus, ExternalLink, Globe, Sliders, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { dataService } from '../services/supabase';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const calculateAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const SettingsDropdown = ({ isOpen, onClose }) => {
  const {
    language,
    setLanguage,
    readAloud,
    setReadAloud,
    speechRate,
    setSpeechRate,
    activePatient,
    setActivePatient,
    members,
    loadMembers,
    user,
    setUser,
    navigate,
    t
  } = useApp();

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    if (isPlayingVoice) {
      speechService.stopSpeaking();
      setIsPlayingVoice(false);
      return;
    }

    const sample = language === 'hi'
      ? 'नमस्ते! केयरकम्पास आपकी और आपके परिवार की स्वास्थ्य सुरक्षा में सहायता करता है।'
      : (language === 'hinglish'
          ? 'Hello! CareCompass aapki aur aapke family ki safe healthcare mein help karta hai.'
          : 'Hello! CareCompass navigates you and your family to the safest clinical care pathway.');

    setIsPlayingVoice(true);
    speechService.speak(sample, {
      language: language === 'hi' ? 'hi' : 'en',
      rate: speechRate || 1.0,
      onStart: () => setIsPlayingVoice(true),
      onEnd: () => setIsPlayingVoice(false),
      onError: () => setIsPlayingVoice(false)
    });
  };

  const handleSwitchPersona = (persona = 'rohit') => {
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
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2500);
  };

  return (
    <div className="sp-dropdown-panel" role="dialog" aria-label="Settings and Profiles">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .sp-dropdown-panel {
          --sp-ink: #101e33;
          --sp-ink-2: #2d4261;
          --sp-muted: #577094;
          --sp-faint: #8ca2c0;
          --sp-line: #d2e0f0;
          --sp-line-2: #bdd1ea;
          --sp-tint: #edf3fa;
          --sp-accent: #3f64ae;
          --sp-accent-deep: #1b3560;
          --sp-accent-vibrant: #2968db;
          --sp-accent-soft: #edf4fe;
          --sp-red: #b3382c;
          --sp-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 385px;
          max-width: calc(100vw - 28px);
          max-height: 84vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: #ffffff;
          border: 1px solid var(--sp-line);
          border-radius: 20px;
          padding: 22px 20px 20px;
          box-shadow: 0 20px 48px -12px rgba(28, 36, 32, 0.22), 0 2px 6px rgba(28, 36, 32, 0.05);
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--sp-ink);
          z-index: 1000;
          animation: sp-drop-rise 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes sp-drop-rise {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .35; transform: scale(.75); }
        }
        @keyframes sp-soundwave {
          from { transform: scaleY(0.2); }
          to { transform: scaleY(1); }
        }

        .sp-dropdown-panel::-webkit-scrollbar { width: 5px; }
        .sp-dropdown-panel::-webkit-scrollbar-thumb { background: var(--sp-line-2); border-radius: 3px; }

        /* ---------- Header ---------- */
        .sp-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--sp-line);
          margin-bottom: 16px;
        }
        .sp-head-left { min-width: 0; }
        .sp-overline {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--sp-accent);
          margin-bottom: 4px;
        }
        .sp-overline::before {
          content: '';
          width: 14px;
          height: 2px;
          border-radius: 2px;
          background: var(--sp-accent);
        }
        .sp-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -.015em;
          margin: 0;
          color: var(--sp-ink);
        }
        .sp-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--sp-line);
          background: var(--sp-tint);
          display: grid;
          place-items: center;
          color: var(--sp-muted);
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .sp-close-btn:hover {
          background: #fff;
          color: var(--sp-ink);
          border-color: var(--sp-line-2);
        }

        /* ---------- Sections ---------- */
        .sp-sec {
          margin-bottom: 16px;
        }
        .sp-sec-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--sp-ink-2);
          margin-bottom: 8px;
        }

        /* ---------- Patient Spotlight Card ---------- */
        .sp-patient-card {
          background: var(--sp-tint);
          border: 1px solid var(--sp-line);
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 10px;
          transition: border-color 0.18s ease;
        }
        .sp-patient-card:hover {
          border-color: var(--sp-line-2);
        }
        .sp-patient-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sp-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--sp-accent-soft);
          color: var(--sp-accent);
          display: grid;
          place-items: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .sp-patient-info {
          flex: 1;
          min-width: 0;
        }
        .sp-patient-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }
        .sp-patient-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--sp-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sp-accent);
          animation: sp-pulse 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }
        .sp-patient-meta {
          font-size: 11.5px;
          color: var(--sp-muted);
          line-height: 1.35;
        }
        .sp-patient-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 8px;
        }
        .sp-patient-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--sp-line-2);
          background: #ffffff;
          color: var(--sp-ink-2);
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .sp-patient-chip:hover {
          border-color: var(--sp-accent);
          color: var(--sp-accent);
          background: var(--sp-accent-soft);
        }
        .sp-patient-chip.is-active {
          background: var(--sp-accent);
          color: #ffffff;
          border-color: var(--sp-accent);
        }
        .sp-add-chip {
          border-style: dashed;
          color: var(--sp-accent);
          background: transparent;
        }

        /* ---------- Segmented Language Control ---------- */
        .sp-segmented {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          background: var(--sp-tint);
          border: 1px solid var(--sp-line);
          border-radius: 12px;
          padding: 3px;
        }
        .sp-seg-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 8px 6px;
          border-radius: 9px;
          border: none;
          background: transparent;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .sp-seg-btn span:first-child {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--sp-ink-2);
        }
        .sp-seg-btn span:last-child {
          font-family: var(--sp-mono);
          font-size: 9.5px;
          color: var(--sp-muted);
          letter-spacing: .06em;
        }
        .sp-seg-btn:hover {
          background: rgba(255, 255, 255, 0.6);
        }
        .sp-seg-btn.is-active {
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(28, 36, 32, 0.08);
        }
        .sp-seg-btn.is-active span:first-child {
          color: var(--sp-accent);
        }
        .sp-seg-btn.is-active span:last-child {
          color: var(--sp-accent);
          font-weight: 700;
        }

        /* ---------- Sound & Voice Assist Row ---------- */
        .sp-tool-card {
          background: #ffffff;
          border: 1px solid var(--sp-line);
          border-radius: 14px;
          padding: 12px 14px;
        }
        .sp-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .sp-toggle-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sp-toggle-ic {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--sp-accent-soft);
          color: var(--sp-accent);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .sp-toggle-t {
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-ink);
        }
        .sp-toggle-d {
          font-size: 11px;
          color: var(--sp-muted);
        }
        .sp-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }
        .sp-switch input { opacity: 0; width: 0; height: 0; }
        .sp-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--sp-line-2);
          transition: .2s;
          border-radius: 22px;
        }
        .sp-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .sp-switch input:checked + .sp-slider { background-color: var(--sp-accent); }
        .sp-switch input:checked + .sp-slider:before { transform: translateX(18px); }

        .sp-voice-subrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--sp-line);
        }
        .sp-rates {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .sp-rate-chip {
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid var(--sp-line);
          background: var(--sp-tint);
          font-family: var(--sp-mono);
          font-size: 10.5px;
          color: var(--sp-ink-2);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sp-rate-chip.is-active {
          background: var(--sp-accent);
          color: #ffffff;
          border-color: var(--sp-accent);
        }
        .sp-play-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 8px;
          background: var(--sp-ink);
          color: #ffffff;
          border: none;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .sp-play-btn:hover {
          background: #28332e;
          transform: translateY(-1px);
        }
        .sp-waves {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 12px;
        }
        .sp-waves span {
          width: 2px;
          height: 100%;
          background: #ffffff;
          border-radius: 1px;
          animation: sp-soundwave 0.5s ease-in-out infinite alternate;
        }
        .sp-waves span:nth-child(2) { animation-delay: 0.15s; }
        .sp-waves span:nth-child(3) { animation-delay: 0.3s; }

        /* ---------- Clinical Demo Persona Row ---------- */
        .sp-persona-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .sp-persona-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--sp-line);
          background: var(--sp-tint);
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: all 0.16s ease;
        }
        .sp-persona-btn:hover {
          border-color: var(--sp-line-2);
          background: #fff;
        }
        .sp-persona-btn.is-active {
          border-color: var(--sp-accent);
          background: var(--sp-accent-soft);
        }
        .sp-persona-av {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--sp-line);
          color: var(--sp-ink);
          font-size: 10.5px;
          font-weight: 700;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .sp-persona-btn.is-active .sp-persona-av {
          background: var(--sp-accent);
          color: #fff;
          border-color: var(--sp-accent);
        }
        .sp-persona-info { min-width: 0; }
        .sp-persona-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--sp-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp-persona-sub {
          font-size: 10px;
          color: var(--sp-muted);
        }

        /* ---------- Footer Action Bar ---------- */
        .sp-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--sp-line);
        }
        .sp-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--sp-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .sp-reset-btn:hover {
          color: var(--sp-red);
          background: #faf0ed;
        }
        .sp-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--sp-accent);
          background: var(--sp-accent-soft);
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .sp-expand-btn:hover {
          background: #d8e8dd;
          transform: translateY(-1px);
        }
        .sp-dpdp-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          color: var(--sp-muted);
          margin-top: 10px;
          text-align: center;
          justify-content: center;
        }
      `}</style>

      {/* Header */}
      <div className="sp-head">
        <div className="sp-head-left">
          <div className="sp-overline">CareCompass System</div>
          <h2 className="sp-title">Preferences & Profile</h2>
        </div>
        <button
          type="button"
          className="sp-close-btn"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X size={14} />
        </button>
      </div>

      {/* 1. Active Patient Spotlight */}
      <div className="sp-sec">
        <div className="sp-sec-title">
          <span>Active Patient</span>
          <span style={{ fontSize: '10px', color: '#3f64ae', fontWeight: 600 }}>Triage Linked</span>
        </div>

        {activePatient ? (
          <div className="sp-patient-card">
            <div className="sp-patient-row">
              <div className="sp-avatar">
                {getInitials(activePatient.full_name)}
              </div>
              <div className="sp-patient-info">
                <div className="sp-patient-name-row">
                  <span className="sp-patient-name">{activePatient.full_name}</span>
                  <span className="sp-live-dot" title="Active for diagnosis"></span>
                </div>
                <div className="sp-patient-meta">
                  {activePatient.relationship || 'Primary'}
                  {calculateAge(activePatient.date_of_birth) ? ` • ${calculateAge(activePatient.date_of_birth)} yrs` : ''}
                  {activePatient.blood_group ? ` • ${activePatient.blood_group}` : ''}
                </div>
              </div>
            </div>

            {/* Quick Switch Family Members */}
            {members && members.length > 1 && (
              <div className="sp-patient-chips">
                {members.map((m) => {
                  const isSelected = activePatient?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`sp-patient-chip ${isSelected ? 'is-active' : ''}`}
                      onClick={() => setActivePatient(m)}
                    >
                      {isSelected && <Check size={11} strokeWidth={2.5} />}
                      <span>{m.full_name.split(' ')[0]}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="sp-patient-chip sp-add-chip"
                  onClick={() => {
                    onClose();
                    navigate('/patients/new');
                  }}
                >
                  <UserPlus size={11} />
                  <span>+ Member</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="sp-patient-card" style={{ textAlign: 'center', padding: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#7d877f' }}>No active patient profile selected.</p>
            <button
              type="button"
              className="sp-expand-btn"
              onClick={() => {
                onClose();
                navigate('/patients/new');
              }}
            >
              <UserPlus size={13} />
              <span>Add First Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Language Selector */}
      <div className="sp-sec">
        <div className="sp-sec-title">
          <span>Triage & App Language</span>
        </div>
        <div className="sp-segmented">
          <button
            type="button"
            className={`sp-seg-btn ${language === 'en' ? 'is-active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            <span>English</span>
            <span>EN</span>
          </button>
          <button
            type="button"
            className={`sp-seg-btn ${language === 'hi' ? 'is-active' : ''}`}
            onClick={() => setLanguage('hi')}
          >
            <span>हिन्दी</span>
            <span>HI</span>
          </button>
          <button
            type="button"
            className={`sp-seg-btn ${language === 'hinglish' ? 'is-active' : ''}`}
            onClick={() => setLanguage('hinglish')}
          >
            <span>Hinglish</span>
            <span>HN</span>
          </button>
        </div>
      </div>

      {/* 3. Audio & Voice Assistance */}
      <div className="sp-sec">
        <div className="sp-sec-title">
          <span>Voice & Audio Assist</span>
        </div>
        <div className="sp-tool-card">
          <div className="sp-toggle-row">
            <div className="sp-toggle-info">
              <div className="sp-toggle-ic">
                {readAloud ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <div className="sp-toggle-t">Read Aloud Engine</div>
                <div className="sp-toggle-d">Speak guidance and doctor notes automatically</div>
              </div>
            </div>
            <label className="sp-switch">
              <input
                type="checkbox"
                checked={readAloud}
                onChange={(e) => setReadAloud(e.target.checked)}
              />
              <span className="sp-slider"></span>
            </label>
          </div>

          <div className="sp-voice-subrow">
            <div className="sp-rates">
              <span style={{ fontSize: '10.5px', color: '#7d877f', marginRight: '4px' }}>Speed:</span>
              {[0.8, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={`sp-rate-chip ${speechRate === rate ? 'is-active' : ''}`}
                  onClick={() => setSpeechRate(rate)}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              type="button"
              className="sp-play-btn"
              onClick={handleTestVoice}
            >
              {isPlayingVoice ? (
                <>
                  <div className="sp-waves">
                    <span></span><span></span><span></span>
                  </div>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play size={11} fill="#ffffff" />
                  <span>Test Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Evaluation Demo Persona */}
      <div className="sp-sec">
        <div className="sp-sec-title">
          <span>Evaluation Demo Personas</span>
        </div>
        <div className="sp-persona-row">
          <button
            type="button"
            className={`sp-persona-btn ${user?.full_name?.toLowerCase().includes('rohit') ? 'is-active' : ''}`}
            onClick={() => handleSwitchPersona('rohit')}
          >
            <div className="sp-persona-av">R</div>
            <div className="sp-persona-info">
              <div className="sp-persona-name">Rohit Sharma</div>
              <div className="sp-persona-sub">Hinglish • 34 yrs</div>
            </div>
          </button>

          <button
            type="button"
            className={`sp-persona-btn ${user?.full_name?.toLowerCase().includes('sunita') ? 'is-active' : ''}`}
            onClick={() => handleSwitchPersona('sunita')}
          >
            <div className="sp-persona-av">S</div>
            <div className="sp-persona-info">
              <div className="sp-persona-name">Sunita Devi</div>
              <div className="sp-persona-sub">हिन्दी • 58 yrs</div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="sp-foot">
        <button
          type="button"
          className="sp-reset-btn"
          onClick={handleResetData}
          title="Reset local triage and dispatch records"
        >
          <RotateCcw size={12} />
          <span>{resetToast ? 'Reset Done!' : 'Reset Demo Data'}</span>
        </button>

        <button
          type="button"
          className="sp-expand-btn"
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
        >
          <span>Full Settings Page</span>
          <ExternalLink size={12} />
        </button>
      </div>

      <div className="sp-dpdp-note">
        <ShieldCheck size={12} color="#3f64ae" />
        <span>DPDP & Safety Protocol Compliant • Encrypted Client Session</span>
      </div>
    </div>
  );
};
