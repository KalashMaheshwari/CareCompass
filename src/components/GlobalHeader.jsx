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
    <header className="global-header-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .global-header-container {
          --gh-ink: #0b1e3b;
          --gh-ink-2: #2a3f5f;
          --gh-muted: #5c6e8a;
          --gh-faint: #8ca0bb;
          --gh-accent: #3f64ae;
          --gh-navbg: #eef1f6;
          --gh-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;

          position: sticky;
          top: 12px;
          z-index: 100;
          display: flex;
          justify-content: center;
          padding: 0 16px;
          background: transparent;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .global-header-container button { -webkit-tap-highlight-color: transparent; font-family: inherit; }
        .global-header-container :focus-visible { outline: 2px solid var(--gh-accent); outline-offset: 2px; }

        @keyframes gh-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(.98); }
          to { opacity: 1; transform: none; }
        }

        /* ---------- Floating capsule ---------- */
        .global-header-container .floating-nav-pill {
          width: min(1160px, 100%);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(11, 30, 59, 0.09);
          border-radius: 999px;
          padding: 7px 7px 7px 14px;
          box-shadow: 0 1px 2px rgba(11, 30, 59, 0.06), 0 18px 40px -24px rgba(11, 30, 59, 0.28);
        }

        /* ---------- Brand ---------- */
        .global-header-container .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 2px;
          margin: 0;
          border-radius: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: background-color .15s ease;
        }
        .global-header-container .nav-brand:hover { background: rgba(11, 30, 59, 0.05); }
        .global-header-container .nav-brand-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          display: block;
          flex-shrink: 0;
        }
        .global-header-container .nav-brand-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1;
          min-width: 0;
        }
        .global-header-container .nav-brand-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -.02em;
          color: var(--gh-ink);
          white-space: nowrap;
        }
        .global-header-container .brand-care { color: var(--gh-ink); }
        .global-header-container .brand-compass { color: var(--gh-accent); }
        .global-header-container .nav-brand-sub {
          font-family: var(--gh-mono);
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: .14em;
          color: var(--gh-faint);
          margin-top: 4px;
          white-space: nowrap;
        }

        /* ---------- Center links cluster ---------- */
        .global-header-container .nav-menu-links {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          background: var(--gh-navbg);
          border: 1px solid rgba(11, 30, 59, 0.06);
          border-radius: 999px;
          padding: 3px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .global-header-container .nav-menu-links::-webkit-scrollbar { display: none; }

        /* ---------- Pill-fill links ---------- */
        .global-header-container .nav-pill-link {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid transparent;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -.01em;
          line-height: 1;
          color: var(--gh-muted);
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color .22s ease;
        }
        /* fill layer — wipes left to right */
        .global-header-container .nav-pill-link::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gh-ink);
          border-radius: 999px;
          z-index: 0;
          clip-path: inset(0 100% 0 0 round 999px);
          transition: clip-path .38s cubic-bezier(0.32, 0.72, 0, 1);
          pointer-events: none;
        }
        .global-header-container .nav-pill-link:hover::after,
        .global-header-container .nav-pill-link:focus-visible::after,
        .global-header-container .nav-pill-link.active::after {
          clip-path: inset(0 0 0 0 round 999px);
        }
        .global-header-container .nav-pill-indicator,
        .global-header-container .nav-pill-text {
          position: relative;
          z-index: 1;
        }
        .global-header-container .nav-pill-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          opacity: .35;
          flex-shrink: 0;
          transition: opacity .22s ease, background-color .22s ease;
        }
        .global-header-container .nav-pill-link:hover { color: #fff; }
        .global-header-container .nav-pill-link:hover .nav-pill-indicator {
          opacity: 1;
          background: #fff;
        }
        .global-header-container .nav-pill-link.active {
          color: #fff;
          font-weight: 600;
        }
        .global-header-container .nav-pill-link.active .nav-pill-indicator {
          opacity: 1;
          background: #fff;
        }

        /* ---------- Right actions ---------- */
        .global-header-container .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-left: auto;
        }
        .global-header-container .nav-lang-wrapper,
        .global-header-container .nav-settings-wrapper {
          display: flex;
          align-items: center;
        }

        .global-header-container .nav-lang-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          background: #fff;
          border: 1px solid rgba(11, 30, 59, 0.12);
          border-radius: 999px;
          font-family: var(--gh-mono);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          color: var(--gh-ink);
          cursor: pointer;
          transition: background-color .15s ease, border-color .15s ease;
        }
        .global-header-container .nav-lang-trigger:hover {
          background: var(--gh-navbg);
          border-color: rgba(11, 30, 59, 0.18);
        }

        .global-header-container .nav-lang-dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 192px;
          box-sizing: border-box;
          background: #fff;
          border: 1px solid rgba(11, 30, 59, 0.1);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 20px 40px -20px rgba(11, 30, 59, 0.3), 0 2px 8px rgba(11, 30, 59, 0.08);
          z-index: 50;
          animation: gh-menu-in .18s ease both;
        }
        .global-header-container .nav-lang-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          background: transparent;
          border: none;
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--gh-ink-2);
          cursor: pointer;
          text-align: left;
          transition: background-color .15s ease, color .15s ease;
        }
        .global-header-container .nav-lang-item:hover {
          background: var(--gh-navbg);
          color: var(--gh-ink);
        }
        .global-header-container .nav-lang-item.active {
          background: var(--gh-ink);
          color: #fff;
          font-weight: 600;
        }

        .global-header-container .nav-circle-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gh-ink);
          border: 1px solid rgba(0, 0, 0, 0.06);
          display: grid;
          place-items: center;
          cursor: pointer;
          padding: 0;
          box-shadow: 0 1px 2px rgba(11, 30, 59, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          transition: background-color .15s ease, transform .15s ease;
        }
        .global-header-container .nav-circle-action-btn:hover { background: #1e3356; }
        .global-header-container .nav-circle-action-btn:active { transform: scale(.94); }
        .global-header-container .nav-circle-action-btn.active { background: var(--gh-accent); }

        .global-header-container .nav-emergency-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          height: 40px;
          padding: 0 5px 0 16px;
          background: #dc2626;
          color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: .01em;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 8px 18px -8px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.14);
          transition: background-color .15s ease, transform .15s ease;
        }
        .global-header-container .nav-emergency-btn:hover { background: #b91c1c; }
        .global-header-container .nav-emergency-btn:active { transform: scale(.97); }
        .global-header-container .nav-emergency-arrow-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          transition: background-color .15s ease, transform .2s ease;
        }
        .global-header-container .nav-emergency-btn:hover .nav-emergency-arrow-circle {
          background: rgba(255, 255, 255, 0.26);
          transform: translate(1px, -1px);
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 1020px) {
          .global-header-container .nav-brand-sub { display: none; }
          .global-header-container .nav-pill-link { padding: 8px 11px; font-size: 13px; }
        }
        /* ---------- Hide top navbar completely on phones (< 768px) ---------- */
        @media (max-width: 768px) {
          .global-header-container {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .global-header-container .nav-pill-link::after,
          .global-header-container .nav-emergency-arrow-circle,
          .global-header-container .nav-brand,
          .global-header-container .nav-lang-trigger,
          .global-header-container .nav-lang-item,
          .global-header-container .nav-circle-action-btn,
          .global-header-container .nav-emergency-btn { transition: none; }
          .global-header-container .nav-lang-dropdown-menu { animation: none; }
        }
      `}</style>

      {/* Floating Capsule White Pill Navbar (GeneX Style with CareCompass Brand) */}
      <nav className="floating-nav-pill" aria-label="Main Navigation">
        {/* Brand: User's logo.png & Refined Typography */}
        <div
          className="nav-brand"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          title="CareCompass — Multilingual Healthcare Navigator"
        >
          <img
            src="/logo.png"
            alt="CareCompass Logo"
            className="nav-brand-logo"
          />
          <div className="nav-brand-copy">
            <span className="nav-brand-title">
              <span className="brand-care">Care</span>
              <span className="brand-compass">Compass</span>
            </span>
            <span className="nav-brand-sub">HEALTH NAVIGATOR</span>
          </div>
        </div>

        {/* Center Menu Links (CareCompass Core Sections) */}
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
                <span className="nav-pill-indicator" aria-hidden="true" />
                <span className="nav-pill-text">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools & Actions (Capsule Style) */}
        <div className="nav-right-actions">
          {/* Language Selector Dropdown */}
          <div className="nav-lang-wrapper" ref={langRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="nav-lang-trigger"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              title="Select Language"
            >
              <span>{getLangCode(language)}</span>
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>

            {langDropdownOpen && (
              <div className="nav-lang-dropdown-menu">
                <button
                  type="button"
                  className={`nav-lang-item ${language === 'en' ? 'active' : ''}`}
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                >
                  <span>English (EN)</span>
                  {language === 'en' && <Check size={12} />}
                </button>
                <button
                  type="button"
                  className={`nav-lang-item ${language === 'hi' ? 'active' : ''}`}
                  onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                >
                  <span>हिन्दी (HI)</span>
                  {language === 'hi' && <Check size={12} />}
                </button>
                <button
                  type="button"
                  className={`nav-lang-item ${language === 'hinglish' ? 'active' : ''}`}
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
            className="nav-circle-action-btn nav-desktop-only"
            onClick={() => navigate('/settings')}
            title="Profile & Family Members"
            aria-label="Profile and Family Members"
          >
            <User size={15} color="#ffffff" strokeWidth={2.2} />
          </button>

          {/* Settings Dropdown Circular Action Button (Replaced Shopping Bag) */}
          <div className="nav-settings-wrapper nav-desktop-only" ref={settingsRef} style={{ position: 'relative' }}>
            <button
              id="global-settings-button"
              type="button"
              className={`nav-circle-action-btn ${settingsDropdownOpen ? 'active' : ''}`}
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              title="CareCompass Settings & Preferences"
              aria-label="CareCompass Settings"
            >
              <Settings size={15} color="#ffffff" strokeWidth={2.2} />
            </button>

            <SettingsDropdown
              isOpen={settingsDropdownOpen}
              onClose={() => setSettingsDropdownOpen(false)}
            />
          </div>

          {/* Urgent Bright Tinging Red Emergency Button */}
          <button
            id="global-emergency-button"
            type="button"
            className="nav-emergency-btn"
            onClick={() => navigate('/emergency')}
            title="Immediate Emergency Redirection (112)"
          >
            <span>Emergency 112</span>
            <div className="nav-emergency-arrow-circle">
              <ArrowUpRight size={13} color="#ffffff" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};
