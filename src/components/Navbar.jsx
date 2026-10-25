import React from 'react'
import { 
  Compass, 
  Activity, 
  Users, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  UserCheck,
  Phone
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { currentRoute, navigate, language, setLanguage, activePatient, t } = useApp()

  return (
    <header className="nav-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .nav-shell {
          --nav-ink: #0a0f1a;
          --nav-ink-2: #1e293b;
          --nav-slate: #475569;
          --nav-faint: #94a3b8;
          --nav-line: rgba(15, 23, 42, 0.08);
          --nav-accent: #2563eb;
          --nav-accent-soft: #eff6ff;
          --nav-red: #dc2626;
          --nav-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;

          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--nav-line);
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
          height: 62px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* ---------- Brand ---------- */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity .15s ease;
        }
        .nav-brand:hover { opacity: .8; }

        .nav-logo-img {
          height: 48px;
          width: auto;
          max-height: 52px;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }

        .nav-brand-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
          gap: 1px;
        }
        .nav-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -.02em;
          color: var(--nav-ink);
          line-height: 1.1;
          white-space: nowrap;
        }
        .nav-title-accent { color: var(--nav-accent); }
        .nav-badge {
          font-family: var(--nav-mono);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--nav-faint);
          line-height: 1;
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: var(--nav-line);
          flex-shrink: 0;
        }

        /* ---------- Nav ---------- */
        .nav-track {
          flex: 1;
          min-width: 0;
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .nav-track::-webkit-scrollbar { display: none; }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
          white-space: nowrap;
        }

        /* The Pill Link */
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--nav-slate);
          cursor: pointer;
          transition: color 150ms ease, transform 40ms ease;
          text-decoration: none;
          line-height: 1;
          /* Contain the expanding pill background */
          overflow: hidden; 
          isolation: isolate;
        }

        /* The expanding pill background shape */
        .nav-link::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--nav-accent-soft);
          border-radius: 8px;
          /* Start scaled to 0 (invisible dot in the center) */
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          /* Apple-style curve: fast start, smooth decel */
          transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1), 
                      opacity 180ms ease,
                      background 150ms ease;
        }

        .nav-link svg {
          width: 15px;
          height: 15px;
          stroke-width: 2;
          flex-shrink: 0;
          transition: color 150ms ease;
          position: relative;
          z-index: 1;
        }
        
        .nav-link span {
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          z-index: 1;
        }

        /* Hover: Pill expands into a soft tint */
        .nav-link:hover {
          color: var(--nav-ink);
        }

        .nav-link:hover::after {
          transform: scale(1);
          opacity: 1;
          background: var(--nav-accent-soft);
        }
        
        .nav-link:hover svg {
          color: var(--nav-accent);
        }

        /* Active: Pill stays solid, text turns white */
        .nav-link.active {
          color: #ffffff;
          font-weight: 600;
          /* Shadow applied to the button itself, not the pseudo, for a crisp glow */
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15), 
                      0 4px 14px -4px rgba(37, 99, 235, 0.4);
        }

        .nav-link.active::after {
          /* Keep it fully expanded and change to solid accent */
          transform: scale(1);
          opacity: 1;
          background: var(--nav-accent);
          /* Remove transition so it doesn't "expand" again if class toggles */
          transition: background 150ms ease; 
        }
        
        .nav-link.active svg {
          color: #ffffff;
          animation: nav-blip 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Don't change text color on hover if it's already active */
        .nav-link.active:hover {
          color: #ffffff;
        }

        /* Press State */
        .nav-link:active {
          transform: scale(0.95);
          transition-duration: 40ms;
        }

        /* Medical heartbeat blip */
        @keyframes nav-blip {
          0%, 100% { transform: scale(1); opacity: 1; }
          8% { transform: scale(1.25); opacity: 0.8; }
          16% { transform: scale(1); opacity: 1; }
          24% { transform: scale(1.12); opacity: 0.9; }
          32%, 100% { transform: scale(1); opacity: 1; }
        }

        /* ---------- Actions ---------- */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          margin-left: auto;
        }

        .nav-112 {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 16px;
          background: var(--nav-red);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: .02em;
          cursor: pointer;
          box-shadow: 0 4px 12px -4px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 150ms ease;
          position: relative;
        }
        
        .nav-112:hover {
          background: #b91c1c;
          box-shadow: 0 8px 20px -6px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        
        .nav-112:active {
          transform: translateY(0.5px);
          box-shadow: 0 2px 6px -2px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(0,0,0,0.1);
          transition-duration: 40ms;
        }

        .nav-112 svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .nav-pulse {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          flex-shrink: 0;
        }
        
        .nav-pulse::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.6);
          animation: nav-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes nav-ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 980px) {
          .nav-link span { display: none; }
          .nav-link { padding: 8px 9px; }
          .nav-link svg { width: 18px; height: 18px; }
          .nav-divider { display: none; }
        }
        
        @media (max-width: 600px) {
          .nav-inner { padding: 0 16px; height: 52px; gap: 12px; }
          .nav-logo-img { height: 32px; }
          .nav-badge { display: none; }
          .nav-112 span { display: none; }
          .nav-112 { width: 36px; height: 36px; padding: 0; justify-content: center; border-radius: 8px; }
        }
      `}</style>

      <div className="nav-inner">
        {/* Brand Identity */}
        <button 
          type="button" 
          className="nav-brand" 
          onClick={() => navigate('/')}
          title="CareCompass — Go to Home"
          aria-label="CareCompass — Go to Home"
        >
          <img 
            src="/logo.png" 
            alt="CareCompass Logo" 
            className="nav-logo-img"
          />
        </button>

        <div className="nav-divider" aria-hidden="true"></div>

        {/* Primary Navigation Links */}
        <nav className="nav-track">
          <ul className="nav-list">
            <li>
              <button 
                className={`nav-link ${currentRoute === '/' || currentRoute === '/describe' || currentRoute === '/followup' || currentRoute === '/result' ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/describe')}
              >
                <Activity size={15} />
                <span>{t('nav_symptoms') || 'Check Symptoms'}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${currentRoute.startsWith('/caregivers') ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/caregivers')}
              >
                <Users size={15} />
                <span>{t('nav_find_caregivers') || 'Find Caregivers'}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${currentRoute.startsWith('/checkin') || currentRoute === '/history' ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/checkin')}
              >
                <Clock size={15} />
                <span>{t('nav_monitor') || 'Health Monitor'}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${currentRoute === '/dashboard' ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                <ShieldCheck size={15} />
                <span>{t('nav_safety') || 'Clinical Safety'}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${currentRoute === '/call-sim' ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/call-sim')}
              >
                <PhoneCall size={15} />
                <span>{t('nav_channels') || 'Phone & WhatsApp'}</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${currentRoute === '/settings' || currentRoute.startsWith('/patients') ? 'active' : ''}`} 
                type="button"
                onClick={() => navigate('/settings')}
              >
                <UserCheck size={15} />
                <span>{t('nav_settings') || 'Settings & Profile'}</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Global Actions */}
        <div className="nav-actions">
          {/* Global 112 Red Alert */}
          <button 
            type="button" 
            className="nav-112"
            onClick={() => navigate('/emergency')}
          >
            <span className="nav-pulse"></span>
            <Phone size={14} />
            <span>112 Emergency</span>
          </button>
        </div>
      </div>
    </header>
  )
}