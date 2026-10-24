import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Users, 
  UserPlus, 
  Edit2, 
  Check, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Languages, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  HeartHandshake, 
  ArrowRight, 
  Lock,
  Play,
  Square,
  Globe,
  Radio,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { dataService } from '../services/supabase';

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
        ? 'नमस्ते, केयरकम्पास आपकी स्वास्थ्य सुरक्षा और सही डॉक्टर तक पहुंचने में तुरंत सहायता करता है।'
        : (language === 'hinglish' 
          ? 'Hello, CareCompass aapki health safety aur sahi doctor tak pahunchne mein madad karta hai.'
          : 'Hello, CareCompass helps navigate you to the safest clinical care pathway immediately.'));

    setIsPlayingSample(true);
    speechService.speak(sampleText, {
      language: language === 'hi' ? 'hi' : 'en',
      rate: speechRate || 1.0,
      onStart: () => setIsPlayingSample(true),
      onEnd: () => setIsPlayingSample(false)
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
    <div className="settings-page-container">
      {/* Page Header */}
      <div className="settings-header">
        <div className="settings-header-icon">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="settings-page-title">{t('settings_title') || 'Settings & Patient Profile'}</h1>
          <p className="settings-page-subtitle">
            {t('settings_subtitle') || 'Manage active patient records, family health profiles, language, voice assistance, and privacy.'}
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="settings-tab-nav" role="tablist">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
        >
          <User size={18} />
          <span>{t('tab_profile') || 'Profile & Family'}</span>
          {activePatient && (
            <span className="settings-active-pill">
              {activePatient.full_name.split(' ')[0]}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
          role="tab"
          aria-selected={activeTab === 'preferences'}
        >
          <Languages size={18} />
          <span>{t('tab_language_sound') || 'Language & Sound'}</span>
          <span className="settings-lang-indicator">
            {language === 'hi' ? 'हिन्दी' : (language === 'hinglish' ? 'Hinglish' : 'EN')}
          </span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveTab('privacy')}
          role="tab"
          aria-selected={activeTab === 'privacy'}
        >
          <ShieldCheck size={18} />
          <span>{t('tab_privacy') || 'System & Privacy'}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PROFILE & FAMILY (Active Patient Spotlight + Family Grid)
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="settings-tab-content">
          {/* Active Patient Spotlight Hero Card (Moved from Navbar) */}
          {activePatient && (
            <div className="active-patient-spotlight-card">
              <div className="spotlight-header">
                <div className="spotlight-tag-badge">
                  <span className="pulse-dot-green"></span>
                  <span>{t('active_patient_tag') || 'Active Patient Spotlight'}</span>
                </div>
                <span className="spotlight-sync-badge">
                  <CheckCircle size={14} color="#059669" />
                  <span>Linked for Clinical Triage</span>
                </span>
              </div>

              <div className="spotlight-body">
                <div className="spotlight-avatar">
                  {activePatient.full_name ? activePatient.full_name.charAt(0).toUpperCase() : 'P'}
                </div>

                <div className="spotlight-details">
                  <div className="spotlight-name-row">
                    <h2 className="spotlight-name">{activePatient.full_name}</h2>
                    <span className="spotlight-rel-pill">
                      {activePatient.relationship}
                    </span>
                    {calculateAge(activePatient.date_of_birth) && (
                      <span className="spotlight-meta-pill">
                        {calculateAge(activePatient.date_of_birth)} {t('years_old') || 'yrs'}
                      </span>
                    )}
                    {activePatient.blood_group && (
                      <span className="spotlight-blood-pill">
                        Blood Group: <strong>{activePatient.blood_group}</strong>
                      </span>
                    )}
                  </div>

                  <p className="spotlight-desc">
                    {t('active_patient_desc') || 'All symptom triage checks, doctor handoff notes, and caregiver bookings will be personalized for this family member.'}
                  </p>

                  {/* Clinical Indicators */}
                  <div className="spotlight-tags-grid">
                    {activePatient.existing_conditions && (
                      <div className="spotlight-info-tag">
                        <strong>Existing Conditions:</strong> {activePatient.existing_conditions}
                      </div>
                    )}
                    {activePatient.allergies && (
                      <div className="spotlight-info-tag allergy">
                        <strong>Allergies:</strong> {activePatient.allergies}
                      </div>
                    )}
                    {activePatient.current_medications && (
                      <div className="spotlight-info-tag">
                        <strong>Medications:</strong> {activePatient.current_medications}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="spotlight-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/describe')}
                >
                  <Activity size={18} />
                  <span>{t('start_triage_for', { name: activePatient.full_name }) || `Check Symptoms for ${activePatient.full_name}`}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/patients/${activePatient.id}`)}
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Family Health Profiles List */}
          <div className="settings-section">
            <div className="flex-between" style={{ marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="settings-section-title">{t('family_records_title') || 'Family Health Records'}</h3>
                <p className="settings-section-subtitle">
                  {t('family_records_desc') || 'Select a family member to set as active patient, or edit medical conditions and allergies.'}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/patients/new')}
              >
                <UserPlus size={18} />
                <span>Add Family Member</span>
              </button>
            </div>

            <div className="family-members-grid">
              {members.map((m) => {
                const age = calculateAge(m.date_of_birth);
                const isSelected = activePatient?.id === m.id;

                return (
                  <div
                    key={m.id}
                    className={`family-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectPatient(m)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="family-card-top">
                      <div className="family-card-header-left">
                        <div className={`family-card-avatar ${isSelected ? 'active' : ''}`}>
                          {m.full_name ? m.full_name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <h4 className="family-card-name">{m.full_name}</h4>
                          <span className="family-card-sub">
                            {m.relationship} {age !== null ? `• ${age} yrs` : ''} {m.blood_group ? `• ${m.blood_group}` : ''}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="active-badge">
                          <Check size={13} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-select-patient"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPatient(m);
                          }}
                        >
                          Select
                        </button>
                      )}
                    </div>

                    <div className="family-card-medical">
                      {m.existing_conditions && (
                        <div>
                          <strong>Conditions:</strong> {m.existing_conditions}
                        </div>
                      )}
                      {m.allergies && (
                        <div>
                          <strong>Allergies:</strong> {m.allergies}
                        </div>
                      )}
                      {m.medical_notes && (
                        <div className="family-card-notes">
                          "{m.medical_notes}"
                        </div>
                      )}
                    </div>

                    <div className="family-card-actions">
                      <button
                        type="button"
                        className="btn-edit-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patients/${m.id}`);
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        className="btn-triage-direct"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePatient(m);
                          navigate('/describe');
                        }}
                      >
                        <span>Check Symptoms</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Family Member Card */}
              <div
                className="family-card-add"
                onClick={() => navigate('/patients/new')}
                role="button"
                tabIndex={0}
              >
                <div className="family-card-add-icon">
                  <UserPlus size={24} />
                </div>
                <h4>Add Family Member</h4>
                <p>Store medical history and baseline vitals for parents, children, or spouse</p>
              </div>
            </div>
          </div>

          {/* Account & Persona Evaluation Access */}
          <div className="settings-section">
            <h3 className="settings-section-title">Account & Evaluation Persona</h3>
            <p className="settings-section-subtitle">
              Manage phone credentials or switch between seeded clinical demo personas.
            </p>

            <div className="account-card">
              <div className="account-info-left">
                <div className="account-icon-wrap">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="account-name">{user?.full_name || 'Rohit Sharma (Account Manager)'}</h4>
                  <span className="account-phone">{user?.phone || '+91 98765 43210'} • Authenticated</span>
                </div>
              </div>

              <div className="persona-switch-group">
                <span className="persona-switch-label">Switch Persona:</span>
                <button
                  type="button"
                  className={`btn-persona-pill ${user?.full_name?.toLowerCase().includes('rohit') ? 'active' : ''}`}
                  onClick={() => handleQuickDemoUser('rohit')}
                >
                  Rohit (Hinglish)
                </button>
                <button
                  type="button"
                  className={`btn-persona-pill ${user?.full_name?.toLowerCase().includes('sunita') ? 'active' : ''}`}
                  onClick={() => handleQuickDemoUser('sunita')}
                >
                  Sunita (Hindi)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LANGUAGE & SOUND (Language Cards + Voice & Speech Assistant)
          ========================================================================= */}
      {activeTab === 'preferences' && (
        <div className="settings-tab-content">
          {/* Language Selection Section */}
          <div className="settings-section">
            <div className="settings-section-badge">
              <Globe size={15} />
              <span>Multilingual Engine</span>
            </div>
            <h3 className="settings-section-title">Application & Triage Language</h3>
            <p className="settings-section-subtitle">
              Choose your preferred language. Symptom assessment, follow-up questions, audio output, and doctor recommendations will update immediately.
            </p>

            <div className="language-selector-grid">
              {/* Hindi Card */}
              <div
                className={`language-card ${language === 'hi' ? 'selected' : ''}`}
                onClick={() => setLanguage('hi')}
                role="button"
                tabIndex={0}
              >
                <div className="language-card-header">
                  <div>
                    <h4 className="language-native-title">हिन्दी</h4>
                    <span className="language-tag">शुद्ध हिंदी</span>
                  </div>
                  {language === 'hi' && (
                    <div className="language-check-circle">
                      <Check size={16} color="#ffffff" />
                    </div>
                  )}
                </div>
                <p className="language-card-desc">
                  रोग के लक्षण, नैदानिक प्रश्न, घरेलू उपचार और डॉक्टर सुझाव शुद्ध एवं स्पष्ट देवनागरी हिंदी में।
                </p>
                <div className="language-card-footer">
                  <span className="language-feature-pill">पूर्ण हिंदी ऑडियो</span>
                  <span className="language-feature-pill">देवनागरी लिपि</span>
                </div>
              </div>

              {/* Hinglish Card */}
              <div
                className={`language-card ${language === 'hinglish' ? 'selected' : ''}`}
                onClick={() => setLanguage('hinglish')}
                role="button"
                tabIndex={0}
              >
                <div className="language-card-header">
                  <div>
                    <h4 className="language-native-title">Hinglish</h4>
                    <span className="language-tag">Everyday Conversational</span>
                  </div>
                  {language === 'hinglish' && (
                    <div className="language-check-circle">
                      <Check size={16} color="#ffffff" />
                    </div>
                  )}
                </div>
                <p className="language-card-desc">
                  Everyday mix of colloquial Hindi and English words. Natural, easy to read, and fast to understand.
                </p>
                <div className="language-card-footer">
                  <span className="language-feature-pill">Natural Blend</span>
                  <span className="language-feature-pill">Roman Script</span>
                </div>
              </div>

              {/* English Card */}
              <div
                className={`language-card ${language === 'en' ? 'selected' : ''}`}
                onClick={() => setLanguage('en')}
                role="button"
                tabIndex={0}
              >
                <div className="language-card-header">
                  <div>
                    <h4 className="language-native-title">English</h4>
                    <span className="language-tag">Medical Standard</span>
                  </div>
                  {language === 'en' && (
                    <div className="language-check-circle">
                      <Check size={16} color="#ffffff" />
                    </div>
                  )}
                </div>
                <p className="language-card-desc">
                  Standard international clinical terminology, structured recommendations, and professional care navigation.
                </p>
                <div className="language-card-footer">
                  <span className="language-feature-pill">Standard Clinical</span>
                  <span className="language-feature-pill">Global Terms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice & Sound Assistant Section */}
          <div className="settings-section">
            <div className="settings-section-badge">
              <Volume2 size={15} />
              <span>Audio & Voice Assistance</span>
            </div>
            <h3 className="settings-section-title">Sound & Voice Configuration</h3>
            <p className="settings-section-subtitle">
              Configure speech playback and voice speed for seniors, rural households, or low-literacy users.
            </p>

            {/* Read Aloud Toggle Switch Card */}
            <div className="audio-toggle-card">
              <div className="audio-toggle-info">
                <div className={`audio-icon-wrap ${readAloud ? 'active' : ''}`}>
                  {readAloud ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </div>
                <div>
                  <h4 className="audio-toggle-title">{t('read_aloud_title') || 'Read Aloud (Voice Assistant)'}</h4>
                  <p className="audio-toggle-desc">
                    {t('read_aloud_desc') || 'Automatically speak triage questions, care recommendations, and safety precautions aloud.'}
                  </p>
                  <span className={`audio-status-pill ${readAloud ? 'active' : ''}`}>
                    {readAloud ? 'Active · Spoken guidance enabled' : 'Disabled · Visual text only'}
                  </span>
                </div>
              </div>

              <label className="toggle-switch-container">
                <input
                  type="checkbox"
                  checked={readAloud}
                  onChange={(e) => setReadAloud(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Speech Playback Speed Controls */}
            <div className="speech-speed-card">
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {t('voice_speed_title') || 'Voice Speech Rate'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>
                  Current: {speechRate}x
                </span>
              </div>

              <div className="speed-buttons-group">
                <button
                  type="button"
                  className={`speed-btn ${speechRate === 0.85 ? 'active' : ''}`}
                  onClick={() => setSpeechRate(0.85)}
                >
                  <span>0.85x</span>
                  <small>Gentle & Slow (Seniors)</small>
                </button>

                <button
                  type="button"
                  className={`speed-btn ${speechRate === 1.0 ? 'active' : ''}`}
                  onClick={() => setSpeechRate(1.0)}
                >
                  <span>1.0x</span>
                  <small>Normal Pace (Default)</small>
                </button>

                <button
                  type="button"
                  className={`speed-btn ${speechRate === 1.25 ? 'active' : ''}`}
                  onClick={() => setSpeechRate(1.25)}
                >
                  <span>1.25x</span>
                  <small>Brisk / Fast</small>
                </button>
              </div>

              {/* Live Audio Test Button */}
              <div className="audio-test-bar">
                <button
                  type="button"
                  className={`btn-test-audio ${isPlayingSample ? 'playing' : ''}`}
                  onClick={handleTestAudio}
                >
                  {isPlayingSample ? <Square size={16} /> : <Play size={16} />}
                  <span>{isPlayingSample ? (t('test_audio_playing') || 'Playing Audio...') : (t('test_audio_btn') || 'Listen to Sample Audio')}</span>
                </button>

                {isPlayingSample && (
                  <div className="soundwave-animation">
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Speech-to-Text Recognition Diagnostics */}
            <div className="stt-diagnostics-card">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Radio size={20} color="#0284c7" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a' }}>Dual-Engine Voice Recognition (STT)</h5>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time Browser Web Speech API + Groq Whisper Cloud Backup</span>
                  </div>
                </div>
                <span className="stt-status-badge">
                  <span className="pulse-dot-green"></span>
                  <span>Active & Ready</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYSTEM & PRIVACY (Accessibility, DPDP 2023, Reset Data)
          ========================================================================= */}
      {activeTab === 'privacy' && (
        <div className="settings-tab-content">
          {/* Display & Accessibility */}
          <div className="settings-section">
            <h3 className="settings-section-title">Display & Text Accessibility</h3>
            <p className="settings-section-subtitle">
              Adjust typography scale for optimal readability across phones, tablets, and desktops.
            </p>

            <div className="font-size-options-grid">
              <button
                type="button"
                className={`font-size-card ${fontSize === 'normal' ? 'selected' : ''}`}
                onClick={() => setFontSize('normal')}
              >
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Aa</span>
                <span className="font-size-label">Normal (100%)</span>
                <span className="font-size-sub">Standard clinical layout</span>
              </button>

              <button
                type="button"
                className={`font-size-card ${fontSize === 'large' ? 'selected' : ''}`}
                onClick={() => setFontSize('large')}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aa</span>
                <span className="font-size-label">Large (115%)</span>
                <span className="font-size-sub">Recommended for easy reading</span>
              </button>

              <button
                type="button"
                className={`font-size-card ${fontSize === 'xl' ? 'selected' : ''}`}
                onClick={() => setFontSize('xl')}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Aa</span>
                <span className="font-size-label">Extra Large (130%)</span>
                <span className="font-size-sub">High accessibility scale</span>
              </button>
            </div>
          </div>

          {/* DPDP 2023 Digital Personal Data Protection */}
          <div className="settings-section">
            <div className="dpdp-compliance-card">
              <div className="dpdp-header">
                <ShieldCheck size={26} color="#059669" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#065f46' }}>
                    India DPDP 2023 Compliant Health Routing
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: '#047857' }}>
                    Digital Personal Data Protection Act (DPDP Act 2023)
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#065f46', lineHeight: 1.5, marginTop: '10px' }}>
                CareCompass does not sell or distribute personal health information. Symptoms and consultation handoffs are encrypted and stored strictly for your family’s continuity of medical care.
              </p>

              <div className="flex-between" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>
                  Consent Status: {hasConsented ? 'Granted & Active' : 'Active for Demo Session'}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 12px', borderColor: '#a7f3d0' }}
                  onClick={() => navigate('/privacy')}
                >
                  <FileText size={14} />
                  <span>View Privacy Policy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="settings-section">
            <h3 className="settings-section-title">Data Management & Reset</h3>
            <p className="settings-section-subtitle">
              Reset cached triage sessions, test bookings, and restore clean seeded evaluation profiles.
            </p>

            <div className="reset-data-card">
              <div>
                <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>Reset Local Demo Cache</h5>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Restores Ramesh Sharma, Kamla Sharma, and Rohit Sharma baseline records.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={handleResetData}
              >
                <RotateCcw size={15} />
                <span>Reset Demo Records</span>
              </button>
            </div>

            {resetNotice && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.86rem' }}>
                ✓ Demo records reset successfully! Ramesh Sharma active profile restored.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
