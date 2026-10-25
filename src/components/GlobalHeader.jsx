import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingsDropdown } from './SettingsDropdown';

export const GlobalHeader = () => {
  const { currentRoute, navigate, language, setLanguage, t } = useApp();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const langRef = useRef(null);
  const settingsRef = useRef(null);

  const isEmergency = currentRoute === '/emergency';
  if (isEmergency) return null;

  const isLanding = currentRoute === '/' || currentRoute === '';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Restored CareCompass Navigation Links (Home in 1st place, Health Monitor removed)
  const navLinks = [
    { 
      path: '/', 
      label: t('nav_home') || 'Home',
      matchRoutes: ['/']
    },
    { 
      path: '/describe', 
      label: t('nav_symptoms') || 'Check Symptoms',
      matchRoutes: ['/describe', '/followup', '/result']
    },
    { 
      path: '/caregivers', 
      label: t('nav_find_caregivers') || 'Find Caregivers',
      matchRoutes: ['/caregivers', '/booking']
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

  const getLangCode = (l) => {
    if (l === 'hi') return 'HI';
    if (l === 'hinglish') return 'HN';
    return 'EN';
  };

  return (
    <header className={`gh-shell ${isLanding ? 'is-landing' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .gh-shell {
          --gh-ink: #0a0f1a;
          --gh-ink-2: #1e293b;
          --gh-slate: #475569;
          --gh-faint: #94a3b8;
          --gh-line: rgba(15, 23, 42, 0.08);
          --gh-accent: #2563eb;
          --gh-accent-soft: #eff6ff;
          --gh-red: #dc2626;
          --gh-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;

          position: sticky;
          top: 14px;
          z-index: 100;
          padding: 0 24px;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Float on top of landing image with clean clearance */
        .gh-shell.is-landing {
          margin-bottom: -62px;
        }

        /* 100% Strictly Pill-Shaped Capsule */
        .gh-pill {
          max-width: 1120px;
          margin: 0 auto;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 16px 0 18px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 9999px !important;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.04), 
                      0 8px 24px -4px rgba(15, 23, 42, 0.08);
        }

        /* ---------- Brand ---------- */
        .gh-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0;
          margin: 0;
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 120ms ease;
        }
        .gh-brand:hover { opacity: .8; }
        .gh-brand:focus-visible { outline: 2px solid var(--gh-accent); outline-offset: 2px; border-radius: 9999px; }

        .gh-brand-logo {
          height: 38px;
          width: auto;
          max-height: 42px;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }

        .gh-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 0px;
        }
        .gh-brand-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -.02em;
          color: var(--gh-ink);
          line-height: 1.15;
          white-space: nowrap;
        }
        .gh-care { color: var(--gh-ink); }
        .gh-compass { color: var(--gh-accent); }
        .gh-brand-sub {
          font-family: var(--gh-mono);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--gh-faint);
          line-height: 1;
          margin-top: 1px;
        }

        .gh-sep {
          width: 1px;
          height: 24px;
          background: var(--gh-line);
          flex-shrink: 0;
          margin: 0 4px;
        }

        /* ---------- Nav Links (Pill-Shaped) ---------- */
        .gh-links {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-left: 4px;
        }
        .gh-links::-webkit-scrollbar { display: none; }

        .gh-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 15px;
          border-radius: 9999px !important;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          color: var(--gh-slate);
          cursor: pointer;
          transition: color 150ms ease, transform 40ms ease;
          text-decoration: none;
          line-height: 1;
          overflow: hidden;
          isolation: isolate;
          white-space: nowrap;
        }

        .gh-link::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gh-accent-soft);
          border-radius: 9999px !important;
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1), 
                      opacity 180ms ease,
                      background 150ms ease;
        }

        .gh-link-text {
          position: relative;
          z-index: 1;
        }

        .gh-link-indicator {
          display: none;
        }

        .gh-link:hover {
          color: var(--gh-ink);
        }

        .gh-link:hover::after {
          transform: scale(1);
          opacity: 1;
          background: var(--gh-accent-soft);
        }

        .gh-link.active {
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15), 
                      0 4px 14px -4px rgba(37, 99, 235, 0.4);
        }

        .gh-link.active::after {
          transform: scale(1);
          opacity: 1;
          background: var(--gh-accent);
          transition: background 150ms ease; 
        }
        
        .gh-link.active:hover {
          color: #ffffff;
        }

        .gh-link:active {
          transform: scale(0.95);
          transition-duration: 40ms;
        }

        /* ---------- Right Actions ---------- */
        .gh-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-left: auto;
        }

        /* Language Selector (Pill-Shaped) */
        .gh-lang-wrap {
          position: relative;
        }
        .gh-lang-trigger {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 32px;
          padding: 0 12px;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid transparent;
          border-radius: 9999px !important;
          font-family: var(--gh-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .06em;
          color: var(--gh-ink-2);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .gh-lang-trigger:hover {
          background: var(--gh-accent-soft);
          border-color: rgba(37, 99, 235, 0.12);
          color: var(--gh-accent);
        }
        .gh-lang-trigger:active {
          transform: scale(0.95);
          transition-duration: 40ms;
        }
        .gh-lang-trigger svg {
          width: 12px;
          height: 12px;
          transition: transform 200ms ease;
        }
        .gh-lang-wrap.open .gh-lang-trigger svg {
          transform: rotate(180deg);
        }

        .gh-lang-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 160px;
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.15);
          animation: gh-menu-in 200ms cubic-bezier(0.32, 0.72, 0, 1) both;
          z-index: 200;
        }

        @keyframes gh-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }

        .gh-lang-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          color: var(--gh-slate);
          cursor: pointer;
          transition: color 150ms ease, transform 40ms ease;
          overflow: hidden;
          isolation: isolate;
        }

        .gh-lang-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gh-accent-soft);
          border-radius: 8px;
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1), opacity 150ms ease;
        }

        .gh-lang-item span, .gh-lang-item svg {
          position: relative;
          z-index: 1;
        }

        .gh-lang-item:hover {
          color: var(--gh-ink);
        }
        .gh-lang-item:hover::after {
          transform: scale(1);
          opacity: 1;
        }
        .gh-lang-item:active {
          transform: scale(0.97);
          transition-duration: 40ms;
        }

        .gh-lang-item.active {
          color: var(--gh-accent);
          font-weight: 600;
        }
        .gh-lang-item.active::after {
          transform: scale(1);
          opacity: 1;
          background: rgba(37, 99, 235, 0.06);
        }

        /* Circle Buttons */
        .gh-circle-btn {
          width: 32px;
          height: 32px;
          border-radius: 50% !important;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.06);
          border: 1px solid transparent;
          color: var(--gh-ink-2);
          cursor: pointer;
          transition: all 150ms ease;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .gh-circle-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--gh-accent);
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1), opacity 150ms ease;
        }
        .gh-circle-btn:hover {
          border-color: rgba(37, 99, 235, 0.2);
          color: #ffffff;
        }
        .gh-circle-btn:hover::after {
          transform: scale(1);
          opacity: 1;
        }
        .gh-circle-btn:active {
          transform: scale(0.92);
          transition-duration: 40ms;
        }
        .gh-circle-btn.active {
          background: var(--gh-accent);
          color: #ffffff;
          border-color: var(--gh-accent);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .gh-circle-btn.active::after {
          transform: scale(1);
          opacity: 1;
        }

        /* Settings Wrapper */
        .gh-settings-wrap {
          position: relative;
        }

        /* Emergency Button (Pill-Shaped) */
        .gh-emergency {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 5px 0 14px;
          background: var(--gh-red);
          color: #fff;
          border: none;
          border-radius: 9999px !important;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .02em;
          cursor: pointer;
          box-shadow: 0 4px 12px -4px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 150ms ease;
        }
        .gh-emergency:hover {
          background: #b91c1c;
          box-shadow: 0 8px 20px -6px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .gh-emergency:active {
          transform: translateY(0.5px);
          box-shadow: 0 2px 6px -2px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(0,0,0,0.1);
          transition-duration: 40ms;
        }
        .gh-emergency-circle {
          width: 22px;
          height: 22px;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 900px) {
          .gh-shell { top: 8px; padding: 0 12px; }
          .gh-pill { height: 48px; padding: 0 10px; gap: 10px; border-radius: 9999px !important; }
          .gh-link-text { display: none; }
          .gh-link { padding: 8px; }
          .gh-sep { display: none; }
          .gh-brand { gap: 6px; }
          .gh-brand-logo { height: 32px; }
        }
        
        @media (max-width: 768px) {
          .gh-shell { display: none !important; }
        }

        @media (max-width: 600px) {
          .gh-emergency span { display: none; }
          .gh-emergency { width: 32px; height: 32px; padding: 0; justify-content: center; }
          .gh-emergency-circle { display: none; }
        }
      `}</style>

      <nav className="gh-pill" aria-label="Main Navigation">
        {/* Brand */}
        <button 
          className="gh-brand" 
          onClick={() => navigate('/')} 
          title="CareCompass — Multilingual Healthcare Navigator"
          aria-label="CareCompass — Multilingual Healthcare Navigator"
        >
          <img 
            src="/logo.png" 
            alt="CareCompass Logo" 
            className="gh-brand-logo" 
          />
        </button>

        <div className="gh-sep" aria-hidden="true"></div>

        {/* Center Menu Links (Pill-Shaped) */}
        <div className="gh-links">
          {navLinks.map((link) => {
            const isActive = link.matchRoutes 
              ? link.matchRoutes.some(r => currentRoute === r || (r !== '/' && currentRoute.startsWith(r)))
              : (currentRoute === link.path || (link.path !== '/' && currentRoute.startsWith(link.path)));

            return (
              <button
                key={link.path}
                type="button"
                className={`gh-link ${isActive ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                <span className="gh-link-indicator" aria-hidden="true" />
                <span className="gh-link-text">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools & Actions */}
        <div className="gh-actions">
          {/* Language Selector Dropdown (Pill-Shaped) */}
          <div className={`gh-lang-wrap ${langDropdownOpen ? 'open' : ''}`} ref={langRef}>
            <button
              type="button"
              className="gh-lang-trigger"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              title="Select Language"
            >
              <span>{getLangCode(language)}</span>
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>

            {langDropdownOpen && (
              <div className="gh-lang-menu">
                <button
                  type="button"
                  className={`gh-lang-item ${language === 'en' ? 'active' : ''}`}
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                >
                  <span>English (EN)</span>
                  {language === 'en' && <Check size={12} />}
                </button>
                <button
                  type="button"
                  className={`gh-lang-item ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                >
                  <span>हिन्दी (HI)</span>
                  {language === 'hi' && <Check size={12} />}
                </button>
                <button
                  type="button"
                  className={`gh-lang-item ${language === 'hinglish' ? 'active' : ''}`}
                  onClick={() => { setLanguage('hinglish'); setLangDropdownOpen(false); }}
                >
                  <span>Hinglish (HN)</span>
                  {language === 'hinglish' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Circular Action Button */}
          <button
            type="button"
            className="gh-circle-btn"
            onClick={() => navigate('/settings')}
            title="Profile & Family Members"
            aria-label="Profile and Family Members"
          >
            <User size={15} strokeWidth={2.2} />
          </button>

          {/* Settings Dropdown Circular Action Button */}
          <div className="gh-settings-wrap" ref={settingsRef}>
            <button
              id="global-settings-button"
              type="button"
              className={`gh-circle-btn ${settingsDropdownOpen ? 'active' : ''}`}
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              title="CareCompass Settings & Preferences"
              aria-label="CareCompass Settings"
            >
              <Settings size={15} strokeWidth={2.2} />
            </button>

            <SettingsDropdown
              isOpen={settingsDropdownOpen}
              onClose={() => setSettingsDropdownOpen(false)}
            />
          </div>

          {/* Urgent Emergency Button (Pill-Shaped) */}
          <button
            id="global-emergency-button"
            type="button"
            className="gh-emergency"
            onClick={() => navigate('/emergency')}
            title="Immediate Emergency Redirection (112)"
          >
            <span>Emergency 112</span>
            <div className="gh-emergency-circle">
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};
