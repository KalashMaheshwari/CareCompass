import React from 'react';
import { ArrowRight, PhoneCall, User, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalHeader = () => {
  const {
    currentRoute,
    navigate,
    readAloud,
    setReadAloud,
    language,
    setLanguage,
    activePatient
  } = useApp();

  const isEmergency = currentRoute === '/emergency';
  if (isEmergency) return null;

  const navLinks = [
    { path: '/', label: 'Triage Intake' },
    { path: '/caregivers', label: 'Care Pathways' },
    { path: '/patients', label: 'Family Profiles' },
    { path: '/history', label: 'Past Visits' },
    { path: '/dashboard', label: 'Safety Analytics' },
    { path: '/call-sim', label: 'IVR / Chat' }
  ];

  return (
    <header className="global-header-container">
      {/* Floating Pill Navbar (Matches luxury GeneX design) */}
      <nav className="floating-nav-pill" aria-label="Main Navigation">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <img src="/compass-logo.svg" alt="CareCompass Logo" className="nav-brand-logo" />
          <span className="nav-brand-name">CareCompass</span>
        </div>

        {/* Center Menu Links */}
        <div className="nav-menu-links">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.path || (link.path !== '/' && currentRoute.startsWith(link.path));
            return (
              <button
                key={link.path}
                type="button"
                className={`nav-pill-link ${isActive ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Tools & Actions */}
        <div className="nav-right-actions">
          {/* Active Target Patient Chip */}
          {activePatient && (
            <button
              type="button"
              className="nav-patient-badge"
              onClick={() => navigate('/patients')}
              title="Click to switch active family member"
            >
              <span className="patient-pulse-dot"></span>
              <span className="patient-name">{activePatient.full_name}</span>
              <span className="patient-rel">({activePatient.relationship})</span>
            </button>
          )}

          {/* Language Switcher Dropdown / Pills */}
          <div className="nav-lang-dropdown">
            <button
              type="button"
              className={`nav-lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`nav-lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`nav-lang-btn ${language === 'hinglish' ? 'active' : ''}`}
              onClick={() => setLanguage('hinglish')}
            >
              Hinglish
            </button>
          </div>

          {/* Read Aloud Toggle */}
          <button
            type="button"
            className={`nav-icon-btn ${readAloud ? 'active' : ''}`}
            onClick={() => setReadAloud(!readAloud)}
            title={readAloud ? 'Speech Read-Aloud is ON' : 'Turn Speech Read-Aloud ON'}
          >
            {readAloud ? <Volume2 size={16} color="#0284c7" /> : <VolumeX size={16} />}
          </button>

          {/* User Profile Pill */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => navigate('/login')}
            title="User Profile & Login"
          >
            <User size={16} />
          </button>

          {/* High-Contrast Emergency 112 CTA Pill */}
          <button
            id="global-emergency-button"
            type="button"
            className="btn-emergency-pill"
            onClick={() => navigate('/emergency')}
          >
            <PhoneCall size={14} />
            <span>Emergency 112</span>
            <span className="pill-arrow-icon">
              <ArrowRight size={12} color="#ffffff" />
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
};
