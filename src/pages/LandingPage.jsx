import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  PhoneCall, 
  Sparkles,
  AlertOctagon,
  Loader2,
  HeartPulse,
  User,
  Users,
  Phone,
  MessageSquare,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { runTriage, checkClientSideRedFlags } from '../services/triageEngine';
import { supabaseService } from '../services/supabase';
import { GlobalFooter } from '../components/GlobalFooter';

export const LandingPage = () => {
  const { t, language, navigate, setTriageData, activePatient } = useApp();
  const [typedInput, setTypedInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [clientRedFlag, setClientRedFlag] = useState(null);
  const inputRef = useRef(null);

  // Pure language-specific texts for intake box, exclusively controlled by language switcher
  const getIntakeTexts = (lang, recording) => {
    if (lang === 'hi') {
      return {
        cardTitle: 'मरीज़ देखभाल एवं लक्षण मूल्यांकन',
        micMain: recording ? 'सुन रहे हैं... बोलिए' : 'बोलने के लिए दबाएँ',
        micSub: recording ? 'बोलना समाप्त करने के लिए दबाएँ' : 'वॉयस स्पीच प्रोसेसिंग',
        divider: 'या लिखकर बताएँ',
        placeholder: 'मरीज़ के लक्षणों के बारे में विस्तार से लिखें (जैसे तेज़ बुखार, गले में खराश, या साँस लेने में तकलीफ़)...',
        trust: 'अस्पताल-स्तरीय गोपनीयता · DPDP अधिनियम 2023',
        submit: 'क्लिनिकल मूल्यांकन शुरू करें',
        evaluating: 'क्लिनिकल मूल्यांकन जारी है...'
      };
    }
    if (lang === 'hinglish') {
      return {
        cardTitle: 'Patient Care & Symptom Assessment',
        micMain: recording ? 'Sun rahe hain... boliye' : 'Bolne ke liye dabayein',
        micSub: recording ? 'Bolna khatam karne ke liye dabayein' : 'Voice Speech Recognition',
        divider: 'ya likh kar batayein',
        placeholder: 'Patient ke symptoms detail mein likhein (e.g. Papa ko kal raat se tez bukhar hai aur gale mein kharash hai)...',
        trust: 'Hospital-Grade Privacy · DPDP Act 2023',
        submit: 'Clinical Evaluation Shuru Karein',
        evaluating: 'Clinical evaluation chal raha hai...'
      };
    }
    // Default to English
    return {
      cardTitle: 'Patient Care & Symptom Assessment',
      micMain: recording ? 'Listening... Speak now' : 'Tap to Speak',
      micSub: recording ? 'Tap anywhere to finish speaking' : 'Voice Speech Recognition',
      divider: 'or type symptoms',
      placeholder: 'Describe patient symptoms in detail (e.g. High fever, sore throat, or difficulty breathing)...',
      trust: 'Hospital-Grade Confidentiality · DPDP Act 2023',
      submit: 'Begin Clinical Evaluation',
      evaluating: 'Evaluating Clinical Triage...'
    };
  };

  const intakeTexts = getIntakeTexts(language, isRecording);

  // Live red-flag screening as patient types
  useEffect(() => {
    const flag = checkClientSideRedFlags(typedInput);
    setClientRedFlag(flag);
  }, [typedInput]);

  const handleToggleVoice = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const activeLang = language || 'en';
      speechService.startListening({
        language: activeLang,
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

  // Direct Clinical Triage Execution right from the Landing Page
  const executeTriage = async (overrideText) => {
    const symptomText = (overrideText !== undefined ? overrideText : typedInput).trim();
    if (!symptomText) {
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    }

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
        user_input: symptomText,
        language: language === 'auto' ? 'auto' : language,
        conversation_history: [],
        patient_context: patientContext
      });

      const sessId = `sess-${Date.now()}`;
      setTriageData({
        user_input: symptomText,
        detected_language: language,
        conversation_history: [],
        latest_response: response,
        sessionId: sessId
      });

      // Persist session to database records
      supabaseService.recordTriageSession({
        sessionId: sessId,
        userInput: symptomText,
        detectedLanguage: language,
        conversationHistory: [],
        decision: response
      });

      setIsEvaluating(false);

      // Direct navigation without opening /describe
      if (response.requires_emergency_path || response.urgency === 'immediate') {
        navigate('/emergency');
      } else if (response.follow_up_question) {
        navigate('/followup');
      } else {
        navigate('/result');
      }
    } catch (err) {
      console.error('Triage execution failed:', err);
      setIsEvaluating(false);
      navigate('/result');
    }
  };

  const handleIntakeSubmit = (e) => {
    if (e) e.preventDefault();
    executeTriage();
  };

  const handlePresetClick = (presetText) => {
    setTypedInput(presetText);
    executeTriage(presetText);
  };

  return (
    <div className="landing-page-root">
      {/* 1. HERO SHOWCASE WITH ROUNDED CORNERS */}
      <div className="landing-hero-backdrop">
        <section className="hero-showcase">
          <div className="hero-gradient-overlay"></div>

          <div className="hero-split-grid">
            {/* Left Column: Title Only (Clutter-Free) */}
            <div className="hero-brand-col">
              <h1 className="hero-headline">
                Your Personalized<br />
                <span className="hero-headline-highlight">Care Navigation</span> Strategy
              </h1>
            </div>

            {/* Right Column: Minimal, Clutter-Free Clinical Assessment Panel */}
            <div className="hero-intake-card">
              <div className="intake-card-header">
                <h2 className="intake-card-title">
                  {intakeTexts.cardTitle}
                </h2>
              </div>

              {/* Red-Flag Safety Alert Banner (Triggered only on emergency terms) */}
              {clientRedFlag && (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #f87171',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertOctagon size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8rem', color: '#991b1b', lineHeight: 1.35 }}>
                      <strong>Possible Clinical Emergency ({clientRedFlag.label})</strong>: Direct 112 escalation recommended.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ background: '#dc2626', borderColor: '#b91c1c', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, animation: 'ting-emergency 2s infinite ease-in-out' }}
                    onClick={() => navigate('/emergency')}
                  >
                    Call 112
                  </button>
                </div>
              )}

              {/* Direct Minimal Intake Form */}
              <form onSubmit={handleIntakeSubmit}>
                {/* Major Voice Intake Big Button */}
                <button
                  type="button"
                  className={`hero-speech-capsule-btn ${isRecording ? 'is-recording' : ''}`}
                  onClick={handleToggleVoice}
                  disabled={isEvaluating}
                  aria-label={intakeTexts.micMain}
                >
                  <div className="speech-capsule-mic-circle">
                    {isRecording ? <MicOff size={24} color="#ffffff" strokeWidth={2.2} /> : <Mic size={24} color="#ffffff" strokeWidth={2.2} />}
                  </div>
                  <div className="speech-capsule-info">
                    <div className="speech-capsule-main-text">
                      {intakeTexts.micMain}
                    </div>
                    <div className="speech-capsule-sub-text">
                      {intakeTexts.micSub}
                    </div>
                  </div>
                  {isRecording && (
                    <div className="speech-capsule-waves">
                      <span className="wave-bar bar-1"></span>
                      <span className="wave-bar bar-2"></span>
                      <span className="wave-bar bar-3"></span>
                      <span className="wave-bar bar-4"></span>
                      <span className="wave-bar bar-5"></span>
                    </div>
                  )}
                </button>

                {/* Minimal divider */}
                <div style={{ position: 'relative', textAlign: 'center', margin: '14px 0 12px 0' }}>
                  <div style={{ height: '1px', background: '#e2eaf4', width: '100%' }}></div>
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#ffffff',
                    padding: '0 10px',
                    fontSize: '0.73rem',
                    color: '#94a3b8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {intakeTexts.divider}
                  </span>
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #d4e0ee',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  transition: 'border-color 0.2s ease'
                }}>
                  <textarea
                    ref={inputRef}
                    className="form-input-clean"
                    rows={3}
                    style={{
                      resize: 'none',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.92rem',
                      lineHeight: 1.5,
                      color: '#0f172a',
                      padding: 0
                    }}
                    placeholder={intakeTexts.placeholder}
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    disabled={isEvaluating}
                  />
                </div>

                {/* Submission & Trust Row (Icons Only, No Emojis) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b' }}>
                    <ShieldCheck size={15} color="#3f64ae" />
                    <span>{intakeTexts.trust}</span>
                  </div>

                  <button
                    type="submit"
                    className="btn-cta-pill"
                    disabled={!typedInput.trim() || isEvaluating}
                    style={{
                      padding: '10px 22px',
                      background: isEvaluating
                        ? '#94a3b8'
                        : (!typedInput.trim()
                          ? '#94a3b8'
                          : '#2b4984'),
                      cursor: !typedInput.trim() || isEvaluating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>{intakeTexts.evaluating}</span>
                      </>
                    ) : (
                      <>
                        <span>{intakeTexts.submit}</span>
                        <span className="pill-arrow-icon" style={{ background: '#1e3560' }}>
                          <ArrowRight size={12} color="#ffffff" />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Scroll down indicator to explore rest of page */}
          <a
            href="#care-pathways"
            className="hero-scroll-indicator"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('care-pathways');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Explore Clinical Care Pathways &amp; Fleet</span>
            <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
          </a>
        </section>
      </div>

      {/* Main Flow Container for Lower Sections */}
      <div id="care-pathways" className="landing-sections-wrapper">

        {/* 1. CLINICAL CARE PATHWAYS (4 Authentic CareCompass Response Tiers) */}
        <section style={{ marginBottom: '56px' }}>
          <h2 className="section-title-center">Clinical Care Pathways</h2>
          <p className="section-subtitle-center">
            CareCompass determines the safest response tier for your symptoms in seconds — strictly routing without guessing medical diagnoses or prescribing pharmaceuticals.
          </p>

          <div className="program-cards-grid">
            {/* Pathway 1: Registered Nurse Home Visit */}
            <div className="program-card pathway-nurse" onClick={() => navigate('/caregivers')}>
              <div className="program-card-header">
                <div className="program-card-top-meta">
                  <span className="program-status-pill" style={{ color: '#3f64ae' }}>
                    <span className="program-radar-dot"></span>
                    <span>Live in Sector Fleet</span>
                  </span>
                  <Stethoscope size={18} color="#3f64ae" />
                </div>
                <h3>Registered Nurse Home Visit</h3>
                <div className="program-who-for">
                  Bedside clinical checks (BP, SpO2, Temperature), throat inspection, wound dressing, and post-viral monitoring at home.
                </div>
                <div className="program-tags-strip">
                  <span className="program-feature-tag">Portable Vitals Kit</span>
                  <span className="program-feature-tag">Medication Adherence</span>
                  <span className="program-feature-tag">Doctor Memo Review</span>
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">~30–45m</span>
                  <span className="program-price-sub">Arrival Window</span>
                </div>
                <button
                  type="button"
                  className="program-action-btn"
                  onClick={(e) => { e.stopPropagation(); navigate('/caregivers'); }}
                >
                  <span>Dispatch Nurse</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Pathway 2: MBBS Teleconsultation */}
            <div className="program-card pathway-doctor" onClick={() => navigate('/caregivers')}>
              <div className="program-card-header">
                <div className="program-card-top-meta">
                  <span className="program-status-pill" style={{ color: '#2563eb' }}>
                    <span className="program-radar-dot" style={{ background: '#2563eb' }}></span>
                    <span>Licensed MBBS Standby</span>
                  </span>
                  <PhoneCall size={18} color="#2563eb" />
                </div>
                <h3>General Physician Teleconsult</h3>
                <div className="program-who-for">
                  Direct 1-on-1 audio/video review for acute non-emergency symptoms, lab report analysis, and clinical triage verification.
                </div>
                <div className="program-tags-strip">
                  <span className="program-feature-tag">Audio &amp; Video Call</span>
                  <span className="program-feature-tag">Digital Health Memo</span>
                  <span className="program-feature-tag">48h Safety Follow-up</span>
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">&lt; 15m</span>
                  <span className="program-price-sub">Direct Connect</span>
                </div>
                <button
                  type="button"
                  className="program-action-btn"
                  style={{ color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)', background: 'rgba(37, 99, 235, 0.08)' }}
                  onClick={(e) => { e.stopPropagation(); navigate('/caregivers'); }}
                >
                  <span>Consult Doctor</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Pathway 3: Paramedic Rapid Response */}
            <div className="program-card pathway-paramedic" onClick={() => navigate('/caregivers')}>
              <div className="program-card-header">
                <div className="program-card-top-meta">
                  <span className="program-status-pill" style={{ color: '#d97706' }}>
                    <span className="program-radar-dot"></span>
                    <span>Urgent In-Home Fleet</span>
                  </span>
                  <Activity size={18} color="#d97706" />
                </div>
                <h3>Paramedic Rapid Response</h3>
                <div className="program-who-for">
                  Moderate-to-severe symptoms requiring immediate bedside stabilization, oxygen administration, or escalation standby.
                </div>
                <div className="program-tags-strip">
                  <span className="program-feature-tag">SpO2 / ECG Telemetry</span>
                  <span className="program-feature-tag">Nebulizer Kit</span>
                  <span className="program-feature-tag">Hospital Handshake</span>
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val">~15–20m</span>
                  <span className="program-price-sub">Rapid Dispatch</span>
                </div>
                <button
                  type="button"
                  className="program-action-btn"
                  style={{ color: '#d97706', borderColor: 'rgba(217, 119, 6, 0.3)', background: 'rgba(217, 119, 6, 0.08)' }}
                  onClick={(e) => { e.stopPropagation(); navigate('/caregivers'); }}
                >
                  <span>EMT Fleet</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Pathway 4: Emergency 112 Redirection */}
            <div className="program-card pathway-emergency" onClick={() => navigate('/emergency')}>
              <div className="program-card-header">
                <div className="program-card-top-meta">
                  <span className="program-status-pill" style={{ color: '#dc2626', background: '#fee2e2', borderColor: '#fca5a5' }}>
                    <span className="program-radar-dot"></span>
                    <span>Critical Red-Flag</span>
                  </span>
                  <AlertOctagon size={18} color="#dc2626" />
                </div>
                <h3 style={{ color: '#991b1b' }}>Emergency 112 Escalation</h3>
                <div className="program-who-for">
                  Immediate redirection for chest pain, acute shortness of breath, sudden facial droop, or unresponsiveness.
                </div>
                <div className="program-tags-strip">
                  <span className="program-feature-tag" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>Single-Tap 112</span>
                  <span className="program-feature-tag" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>ER Hospital GPS</span>
                  <span className="program-feature-tag" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>Family SMS Beacon</span>
                </div>
              </div>

              <div className="program-card-footer">
                <div className="program-price-eta">
                  <span className="program-price-val" style={{ color: '#dc2626' }}>Instant</span>
                  <span className="program-price-sub">Emergency Escalation</span>
                </div>
                <button
                  type="button"
                  className="program-action-btn"
                  onClick={(e) => { e.stopPropagation(); navigate('/emergency'); }}
                >
                  <span>112 Protocol</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HOW CARECOMPASS WORKS (Bento Journey Cards with Fluid Leak) */}
        <section className="how-it-works-section">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.4rem', fontWeight: 600, color: '#101e33', margin: 0, letterSpacing: '-0.025em' }}>
                How CareCompass Works
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#4a6385', marginTop: '6px' }}>
                From your first spoken word in Hindi or English to verified medical help at your doorstep.
              </p>
            </div>
          </div>

          <div className="how-it-works-grid">
            {/* Step 1: Multilingual Voice Intake */}
            <div className="framed-step-card" onClick={() => navigate('/describe')}>
              <div className="framed-step-media">
                <img src="/step-voice-intake.jpg" alt="Multilingual Voice Symptom Intake" />
              </div>
              <div className="framed-step-body">
                <span className="framed-step-index">01. INTAKE</span>
                <h3>Speak Naturally in Any Language</h3>
                <p>
                  Describe symptoms in your everyday conversational language without navigating rigid dropdown menus or confusing medical forms.
                </p>
              </div>
            </div>

            {/* Step 2: Clinical Safety Triage */}
            <div className="framed-step-card" onClick={() => navigate('/describe')}>
              <div className="framed-step-media">
                <img src="/step-medical-analysis.jpg" alt="Clinical Safety Triage" />
              </div>
              <div className="framed-step-body">
                <span className="framed-step-index">02. TRIAGE</span>
                <h3>Zero-Guesswork Urgency Triage</h3>
                <p>
                  Evaluates urgency and red flags to determine the safest care tier, strictly routing help without guessing diagnoses or prescribing pills.
                </p>
              </div>
            </div>

            {/* Step 3: Verified Proximity Dispatch */}
            <div className="framed-step-card" onClick={() => navigate('/caregivers')}>
              <div className="framed-step-media">
                <img src="/step-proximity-dispatch.jpg" alt="Verified Caregiver Sector Proximity Dispatch" />
              </div>
              <div className="framed-step-body">
                <span className="framed-step-index">03. PROXIMITY</span>
                <h3>Sector Caregiver Matching</h3>
                <p>
                  Matches verified registered nurses, paramedics, and general physicians in your municipal sector ranked by distance, language spoken, and credentials.
                </p>
              </div>
            </div>

            {/* Step 4: Active Post-Booking Check-Ins */}
            <div className="framed-step-card" onClick={() => navigate('/caregivers')}>
              <div className="framed-step-media">
                <img src="/step-active-surveillance.jpg" alt="Active Patient Surveillance and Check-In Loop" />
              </div>
              <div className="framed-step-body">
                <span className="framed-step-index">04. SURVEILLANCE</span>
                <h3>Follow-Up Until Help Arrives</h3>
                <p>
                  CareCompass checks patient stability (Better / Same / Worse) while the responder is en route, auto-escalating to emergency 112 if condition deteriorates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BUILT FOR REAL INDIAN FAMILIES (3 Core Pillars with Fluid Leak) */}
        <section style={{ margin: '48px 0 24px 0' }}>
          <h2 className="section-title-center" style={{ marginBottom: '12px' }}>
            Built for Indian Families &amp; Clinical Safety
          </h2>
          <p className="section-subtitle-center" style={{ marginBottom: '32px' }}>
            Healthcare navigation designed specifically around family care dynamics, multi-channel accessibility, and strict data sovereignty.
          </p>

          <div className="pillars-spec-grid">
            {/* Pillar 1: Multi-Member Family Vault */}
            <div
              className="pillar-spec-card"
              style={{
                '--pillar-leak-origin': '0% 100%',
                '--pillar-leak-color': 'rgba(63, 100, 174, 0.16)',
                '--pillar-accent': '#3f64ae'
              }}
              onClick={() => navigate('/settings')}
            >
              <div className="pillar-spec-card-content">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3f64ae', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Users size={16} />
                  <span>FAMILY HEALTH VAULT</span>
                </div>
                <h3>Manage Papa, Mummy &amp; Children</h3>
                <p>
                  Store chronic conditions (Diabetes, Hypertension, Asthma) for each family member so triage recommendations automatically factor in prior clinical context.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: 600 }}>Papa (62) · Type-2 Diabetes</span>
                  <span style={{ fontSize: '0.74rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: 600 }}>Mummy (58) · HTN</span>
                </div>
              </div>
              <button
                type="button"
                className="program-action-btn"
                onClick={(e) => { e.stopPropagation(); navigate('/settings'); }}
              >
                <span>Manage Family Profiles</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Pillar 2: Phone IVR & WhatsApp Channels */}
            <div
              className="pillar-spec-card"
              style={{
                '--pillar-leak-origin': '50% 100%',
                '--pillar-leak-color': 'rgba(13, 148, 136, 0.16)',
                '--pillar-accent': '#0d9488'
              }}
              onClick={() => navigate('/call-sim')}
            >
              <div className="pillar-spec-card-content">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Phone size={16} />
                  <span>MULTICHANNEL ACCESS</span>
                </div>
                <h3>Toll-Free Phone Call &amp; WhatsApp</h3>
                <p>
                  Elderly relatives without smartphones can dial our toll-free phone number for voice triage in Hindi or English, or interact with our WhatsApp health bot.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#edf4fe', border: '1px solid #c8d9f0', padding: '4px 8px', borderRadius: '6px', color: '#1b3560', fontWeight: 600 }}>1800-CARE-COMPASS</span>
                  <span style={{ fontSize: '0.74rem', background: '#edf4fe', border: '1px solid #c8d9f0', padding: '4px 8px', borderRadius: '6px', color: '#1b3560', fontWeight: 600 }}>WhatsApp Navigator</span>
                </div>
              </div>
              <button
                type="button"
                className="program-action-btn"
                style={{ color: '#2563eb', borderColor: 'rgba(37, 99, 235, 0.3)', background: 'rgba(37, 99, 235, 0.08)' }}
                onClick={(e) => { e.stopPropagation(); navigate('/call-sim'); }}
              >
                <span>Test Phone &amp; WhatsApp</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Pillar 3: DPDP Act 2023 Compliance */}
            <div
              className="pillar-spec-card"
              style={{
                '--pillar-leak-origin': '100% 100%',
                '--pillar-leak-color': 'rgba(30, 58, 138, 0.16)',
                '--pillar-accent': '#1e3a8a'
              }}
              onClick={() => navigate('/privacy')}
            >
              <div className="pillar-spec-card-content">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <ShieldCheck size={16} />
                  <span>DATA PRIVACY &amp; SAFETY</span>
                </div>
                <h3>DPDP Act 2023 &amp; Local Sovereignty</h3>
                <p>
                  Conforms strictly to India's Digital Personal Data Protection Act 2023. Explicit consent, hospital-grade encryption, zero advertising resale, and single-tap data erasure.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#edf4fe', border: '1px solid #c8d9f0', padding: '4px 8px', borderRadius: '6px', color: '#1b3560', fontWeight: 600 }}>SHA-256 Vault</span>
                  <span style={{ fontSize: '0.74rem', background: '#edf4fe', border: '1px solid #c8d9f0', padding: '4px 8px', borderRadius: '6px', color: '#1b3560', fontWeight: 600 }}>Zero Ad Tracking</span>
                </div>
              </div>
              <button
                type="button"
                className="program-action-btn"
                style={{ color: '#1e3a8a', borderColor: 'rgba(30, 58, 138, 0.3)', background: 'rgba(30, 58, 138, 0.08)' }}
                onClick={(e) => { e.stopPropagation(); navigate('/privacy'); }}
              >
                <span>View Privacy &amp; Consent</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
