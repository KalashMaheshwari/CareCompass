import React, { useState } from 'react';
import { Mic, MicOff, Keyboard, ArrowRight, ShieldCheck, Activity, Stethoscope, Clock, CheckCircle2, ChevronRight, FileText, UserCheck, PhoneCall, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';

export const LandingPage = () => {
  const { t, language, setLanguage, navigate, setTriageData, autoSpeak, activePatient } = useApp();
  const [typedInput, setTypedInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleVoice = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechService.startListening({
        language: language === 'hi' ? 'hi' : 'en',
        onResult: ({ transcript, isFinal }) => {
          setTypedInput(transcript);
          if (isFinal) {
            setIsRecording(false);
          }
        },
        onError: () => setIsRecording(false),
        onEnd: () => setIsRecording(false)
      });
    }
  };

  const handleIntakeSubmit = (e) => {
    if (e) e.preventDefault();
    if (!typedInput.trim()) return;
    setTriageData(prev => ({
      ...prev,
      user_input: typedInput.trim(),
      conversation_history: [],
      latest_response: null
    }));
    navigate('/describe', { presetText: typedInput.trim() });
  };

  const loadBenchmarkCase = (caseText) => {
    setTriageData(prev => ({
      ...prev,
      user_input: caseText,
      conversation_history: [],
      latest_response: null
    }));
    navigate('/describe', { presetText: caseText });
  };

  return (
    <div>
      {/* 1. HERO SHOWCASE (Matches GeneX Top Corridor Hero) */}
      <section className="hero-showcase">
        <div className="hero-gradient-overlay"></div>
        <div className="hero-content-inner">
          <div className="hero-kicker">
            <Sparkles size={14} color="#38bdf8" />
            <span>CLINICAL CARE NAVIGATION · REAL-TIME DISPATCH</span>
          </div>
          <h1 className="hero-headline">
            Your Multilingual<br />Care Navigation Strategy
          </h1>
          <p className="hero-description">
            Advanced voice-first triage, clinical urgency evaluation, and verified caregiver dispatch designed to route the safest care pathway immediately in Hindi, English, and Hinglish.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-hero-white"
              onClick={() => navigate('/describe', { startListening: true })}
            >
              <Mic size={18} color="#0284c7" />
              <span>Start Voice Assessment</span>
              <span className="pill-arrow-icon" style={{ background: '#090e17' }}>
                <ArrowRight size={12} color="#ffffff" />
              </span>
            </button>

            <button
              type="button"
              className="btn-hero-glass"
              onClick={() => {
                const el = document.getElementById('intake-console-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Keyboard size={18} />
              <span>Type Symptoms Instead</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Flow Padding Container */}
      <div className="main-content-flow">
        {/* 2. INTERACTIVE CLINICAL INTAKE SURFACE */}
        <section id="intake-console-anchor" className="triage-console-surface">
          <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.08em' }}>
                LIVE SYMPTOM INTAKE CONSOLE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#090e17', margin: '4px 0 0 0' }}>
                Describe What The Patient Is Experiencing
              </h2>
            </div>

            {activePatient && (
              <div
                className="nav-patient-badge"
                style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                onClick={() => navigate('/patients')}
              >
                <span className="patient-pulse-dot"></span>
                <span>Patient: <strong>{activePatient.full_name}</strong> ({activePatient.relationship}) • Switch</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
            CareCompass routes only. Never guesses condition names or prescribes medications. Speak naturally in Hindi, English, or Hinglish.
          </p>

          {/* Audio Frequency Bar */}
          <div className="triage-audio-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="audio-frequency-bars">
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
                <div className={`audio-frequency-bar ${isRecording ? 'listening' : ''}`}></div>
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                  {isRecording ? 'Listening... Speak symptoms clearly' : 'Voice-First Audio Ready (hi-IN / en-IN)'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {isRecording ? 'Tap mic to stop recording' : 'Web Speech API active'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary-pill"
              style={{ background: isRecording ? '#dc2626' : '#0284c7', padding: '9px 20px', fontSize: '0.88rem' }}
              onClick={handleToggleVoice}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{isRecording ? 'Stop Recording' : 'Start Mic Recording'}</span>
            </button>
          </div>

          {/* Text Input & Submit */}
          <form onSubmit={handleIntakeSubmit}>
            <textarea
              className="form-input-clean"
              rows={3}
              style={{ resize: 'vertical', minHeight: '90px', marginBottom: '14px' }}
              placeholder="Or type patient symptoms here (e.g. 'Papa ko do din se bukhar hai aur khansi bhi hai')..."
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
            />

            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Clinical benchmark presets:</span>
                <button
                  type="button"
                  className="clinical-preset-pill"
                  onClick={() => loadBenchmarkCase('Papa ko do din se bukhar hai aur khansi bhi')}
                >
                  <span className="preset-dot dot-blue"></span>
                  <span>Fever & Cough (Hinglish)</span>
                </button>
                <button
                  type="button"
                  className="clinical-preset-pill"
                  onClick={() => loadBenchmarkCase('Halka bukhar hai, saans lene mein koi dikkat nahi hai')}
                >
                  <span className="preset-dot dot-green"></span>
                  <span>Negation Check (Routine)</span>
                </button>
                <button
                  type="button"
                  className="clinical-preset-pill red-flag"
                  onClick={() => loadBenchmarkCase('Saans nahi aa rahi, behosh ho rahe hain')}
                >
                  <span className="preset-dot dot-red"></span>
                  <span>Emergency Red Flag (112)</span>
                </button>
              </div>

              <button
                type="submit"
                className="btn-cta-pill"
                disabled={!typedInput.trim()}
              >
                <span>Run Clinical Triage</span>
                <span className="pill-arrow-icon">
                  <ArrowRight size={12} color="#ffffff" />
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* 3. HEALTH PROGRAMS -> CLINICAL CARE PATHWAYS (Matches GeneX 6-Card Grid) */}
        <section>
          <h2 className="section-title-center">Health Programs</h2>
          <p className="section-subtitle-center">
            Evidence-based clinical routing connecting patients to verified nearby medical responders across routine, same-day, and immediate urgency tiers.
          </p>

          <div className="program-cards-grid">
            {/* Card 1: Nurse Home Visit */}
            <div className="program-card">
              <div className="program-card-header">
                <h3>Basic Diagnostics</h3>
                <div className="program-who-for">
                  <strong>Who it's for:</strong> Individuals who want to assess their current health status, check vitals, or identify early markers of fever or viral illness.
                </div>
                <div className="program-details-box">
                  <strong>What's included:</strong> Full vitals panel, blood pressure, SPO2, bedside clinical assessment, and direct caregiver handoff summary.
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">~45m</span>
                  <span className="program-price-sub">Arrival Window</span>
                </div>
                <button
                  type="button"
                  className="program-learn-pill"
                  onClick={() => navigate('/caregivers')}
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 2: 3D Molecular Spheres Graphic Card (Exact match to GeneX Card 2) */}
            <div className="program-card program-card-pattern" style={{ padding: '24px 20px', minHeight: '300px' }}>
              <svg width="100%" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 8px auto' }}>
                <defs>
                  <radialGradient id="molSphereA" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#7dd3fc" />
                    <stop offset="85%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </radialGradient>
                  <radialGradient id="molSphereB" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#bae6fd" />
                    <stop offset="90%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </radialGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.25" />
                  </filter>
                </defs>
                {/* DNA wave curve */}
                <path d="M 15 130 Q 75 30, 140 90 T 265 50" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
                <path d="M 15 50 Q 75 140, 140 80 T 265 120" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
                {/* Molecular bonds */}
                <line x1="55" y1="115" x2="105" y2="75" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
                <line x1="105" y1="75" x2="175" y2="95" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
                <line x1="175" y1="95" x2="225" y2="45" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />
                <line x1="105" y1="75" x2="135" y2="30" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" />
                {/* 3D Molecular spheres */}
                <circle cx="55" cy="115" r="20" fill="url(#molSphereA)" filter="url(#softGlow)" />
                <circle cx="105" cy="75" r="28" fill="url(#molSphereB)" filter="url(#softGlow)" />
                <circle cx="175" cy="95" r="24" fill="url(#molSphereA)" filter="url(#softGlow)" />
                <circle cx="225" cy="45" r="18" fill="url(#molSphereB)" filter="url(#softGlow)" />
                <circle cx="135" cy="30" r="13" fill="url(#molSphereA)" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#090e17', fontWeight: 800, marginBottom: '4px' }}>
                  Verified Provider Fleet
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                  Over 140 registered RNs, EMTs, and teleconsultation general physicians active in Delhi-NCR.
                </p>
              </div>
            </div>

            {/* Card 3: Complete Longevity Program */}
            <div className="program-card">
              <div className="program-card-header">
                <h3>Complete Longevity Program</h3>
                <div className="program-who-for">
                  <strong>Who it's for:</strong> People who want a full personalized longevity strategy based on advanced diagnostics and medical expertise.
                </div>
                <div className="program-details-box">
                  <strong>What's included:</strong> Full biomarker audit, comprehensive medical history analysis, and personalized clinician check-ins.
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">₹2,800</span>
                  <span className="program-price-sub">per year</span>
                </div>
                <button
                  type="button"
                  className="program-learn-pill"
                  onClick={() => navigate('/caregivers')}
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 4: 3D Molecular Spheres Graphic Card 2 (Exact match to GeneX Card 4) */}
            <div className="program-card program-card-pattern" style={{ padding: '24px 20px', minHeight: '300px' }}>
              <svg width="100%" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 8px auto' }}>
                <defs>
                  <radialGradient id="molSphereC" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#5eead4" />
                    <stop offset="85%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </radialGradient>
                  <radialGradient id="molSphereD" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#a7f3d0" />
                    <stop offset="90%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </radialGradient>
                </defs>
                {/* DNA wave curve */}
                <path d="M 20 80 Q 80 140, 140 80 T 260 80" stroke="#99f6e4" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
                <path d="M 20 80 Q 80 20, 140 80 T 260 80" stroke="#99f6e4" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.6" />
                {/* Bonds */}
                <line x1="50" y1="60" x2="110" y2="100" stroke="#99f6e4" strokeWidth="5" strokeLinecap="round" />
                <line x1="110" y1="100" x2="170" y2="60" stroke="#99f6e4" strokeWidth="5" strokeLinecap="round" />
                <line x1="170" y1="60" x2="230" y2="110" stroke="#99f6e4" strokeWidth="5" strokeLinecap="round" />
                {/* Spheres */}
                <circle cx="50" cy="60" r="22" fill="url(#molSphereC)" />
                <circle cx="110" cy="100" r="26" fill="url(#molSphereD)" />
                <circle cx="170" cy="60" r="24" fill="url(#molSphereC)" />
                <circle cx="230" cy="110" r="19" fill="url(#molSphereD)" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.15rem', color: '#090e17', fontWeight: 800, marginBottom: '4px' }}>
                  Zero Under-Triage Risk
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
                  Emergency recall calibrated at 98.5% with strict safety margins to eliminate missed critical risks.
                </p>
              </div>
            </div>

            {/* Card 5: VIP Longevity Program */}
            <div className="program-card">
              <div className="program-card-header">
                <h3>VIP Longevity Program</h3>
                <div className="program-who-for">
                  <strong>Who it's for:</strong> Individuals seeking a premium, highly personalized longevity program with continuous medical support.
                </div>
                <div className="program-details-box">
                  <strong>What's included:</strong> 24/7 dedicated physician liaison, priority EMT dispatch standby, and quarterly metabolic mapping.
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">₹6,500</span>
                  <span className="program-price-sub">per year</span>
                </div>
                <button
                  type="button"
                  className="program-learn-pill"
                  onClick={() => navigate('/caregivers')}
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 6: Online Health Monitoring */}
            <div className="program-card">
              <div className="program-card-header">
                <h3>Online Health Monitoring</h3>
                <div className="program-who-for">
                  <strong>Who it's for:</strong> Patients who want ongoing medical guidance and health tracking from anywhere.
                </div>
                <div className="program-details-box">
                  <strong>What's included:</strong> Real-time teleconsultation, remote vitals sync, and automated medication-safe navigation alerts.
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">₹120</span>
                  <span className="program-price-sub">per month</span>
                </div>
                <button
                  type="button"
                  className="program-learn-pill"
                  onClick={() => navigate('/caregivers')}
                >
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW YOUR PERSONALIZED PLAN IS BUILT (Matches GeneX 3-Step Cards with Photos) */}
        <section className="how-it-works-section">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2.4rem', color: '#090e17', margin: 0, letterSpacing: '-0.03em' }}>
                How Your Personalized<br />Plan Is Built
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '520px' }}>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Your progress is continuously monitored, and the plan is reviewed and adjusted to ensure the safest care pathway for your long-term health and vitality.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  ←
                </button>
                <button
                  type="button"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: '#090e17', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff' }}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="how-it-works-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-card-image-box">
                <img src="/step-voice-intake.jpg" alt="Data Collection" />
                <span className="step-card-badge">Step 1</span>
              </div>
              <div className="step-card-body">
                <h4>Data Collection</h4>
                <p>
                  Comprehensive health intake, multilingual voice analysis, and clinical biomarker screening to get a complete picture of patient condition.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-card-image-box">
                <img src="/step-medical-analysis.jpg" alt="Medical Analysis" />
                <span className="step-card-badge">Step 2</span>
              </div>
              <div className="step-card-body">
                <h4>Medical Analysis</h4>
                <p>
                  Our triage engine evaluates symptoms to identify hidden risks, metabolic indicators, red flags, and the safest urgency classification.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-card-image-box" style={{ background: 'linear-gradient(135deg, #090e17 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#ffffff', padding: '20px' }}>
                  <Clock size={40} color="#38bdf8" style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Personalized Routing</div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Automated T+2h Clinical Surveillance</div>
                </div>
                <span className="step-card-badge">Step 3</span>
              </div>
              <div className="step-card-body">
                <h4>Personalized Plan</h4>
                <p>
                  We dispatch verified nurses, paramedics, or GP teleconsultations directly, continuously monitoring symptom stabilization until help arrives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS SECTION (Matches GeneX Bottom Team Section) */}
        <section style={{ margin: '48px 0 24px 0' }}>
          <h2 className="section-title-center" style={{ marginBottom: '28px' }}>How it works</h2>
          
          <div
            className="surface-card"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafd 100%)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <ShieldCheck size={16} />
                <span>CLINICAL GOVERNANCE</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#090e17', marginBottom: '10px' }}>
                Zero Guesswork. Deterministic Safety.
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55 }}>
                CareCompass strictly routes healthcare needs without ever guessing condition diagnoses or prescribing pharmaceuticals. Designed specifically for Indian family care dynamics with full Hindi, English, and Hinglish speech processing.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#090e17', margin: 0 }}>Verified Sector Fleet</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Registered nurses, certified paramedics, and MBBS doctors verified with credential checks.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  !
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#090e17', margin: 0 }}>Instant Emergency 112 Redirection</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Any cardiac, respiratory, or unconsciousness red flags trigger immediate single-tap 112 escalation.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  ★
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#090e17', margin: 0 }}>DPDP Act 2023 Compliant</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Strict consent mechanisms and immediate record purge options with complete audit logging.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Canvas Clean Footer */}
      <footer className="canvas-footer">
        <div className="canvas-footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/compass-logo.svg" alt="CareCompass" style={{ width: '24px', height: '24px' }} />
            <span>CareCompass Medical Navigator · All patient data processed under DPDP Act 2023.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a onClick={() => navigate('/dashboard')}>Clinical Metrics</a>
            <a onClick={() => navigate('/call-sim')}>IVR Gateway</a>
            <a onClick={() => navigate('/privacy')}>Data Privacy</a>
            <a onClick={() => navigate('/emergency')} style={{ color: '#ef4444', fontWeight: 700 }}>Emergency (112)</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
