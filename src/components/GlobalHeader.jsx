import React from 'react';
import { ArrowRight, PhoneCall, Settings, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalHeader = () => {
  const {
    currentRoute,
    navigate,
    t
  } = useApp();

  const isEmergency = currentRoute === '/emergency';
  if (isEmergency) return null;

  const navLinks = [
    { 
      path: '/describe', 
      label: t('nav_symptoms') || 'Check Symptoms',
      matchRoutes: ['/', '/describe', '/followup', '/result']
    },
    { 
      path: '/caregivers', 
      label: t('nav_find_caregivers') || 'Find Caregivers',
      matchRoutes: ['/caregivers', '/booking']
    },
    { 
      path: '/checkin', 
      label: t('nav_monitor') || 'Health Monitor',
      matchRoutes: ['/checkin', '/history']
    },
    { 
      path: '/dashboard', 
      label: t('nav_safety') || 'Clinical Safety',
      matchRoutes: ['/dashboard']
    },
    { 
      path: '/call-sim', 
      label: t('nav_channels') || 'Phone & WhatsApp',
      matchRoutes: ['/call-sim']
    }
  ];

  return (
    <header className="global-header-container">
      {/* Floating Pill Navbar */}
      <nav className="floating-nav-pill" aria-label="Main Navigation">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <img src="/compass-logo.svg" alt="CareCompass Logo" className="nav-brand-logo" />
          <span className="nav-brand-name">CareCompass</span>
        </div>

        {/* Center Menu Links with Modern, Intuitive Labels */}
        <div className="nav-menu-links">
          {navLinks.map((link) => {
            const isActive = link.matchRoutes 
              ? link.matchRoutes.some(r => currentRoute === r || (r !== '/' && currentRoute.startsWith(r)))
              : (currentRoute === link.path || (link.path !== '/' && currentRoute.startsWith(link.path)));
            
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

        {/* Right Tools & Actions (Cleaned: Ramesh Sharma & Language/Sound moved to Settings) */}
        <div className="nav-right-actions">
          {/* Settings & Profile Quick Button */}
          <button
            type="button"
            className={`nav-settings-pill ${currentRoute === '/settings' || currentRoute.startsWith('/patients') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            title="Open Settings, Patient Profiles, Language & Voice"
          >
            <Settings size={15} />
            <span>{t('nav_settings') || 'Settings'}</span>
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
