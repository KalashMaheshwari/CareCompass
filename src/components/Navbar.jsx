import React from 'react'
import { 
  Compass, 
  Activity, 
  Users, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  UserCheck
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { currentRoute, navigate, language, setLanguage, activePatient } = useApp()

  return (
    <header className="navbar">
      {/* Brand Identity */}
      <button 
        type="button" 
        className="nav-brand" 
        onClick={() => navigate('/')}
        title="Go to Home"
      >
        <div className="brand-icon-wrapper">
          <Compass size={24} />
        </div>
        <div className="brand-text">
          <span className="brand-title">CareCompass</span>
          <span className="brand-badge">Clinical Triage Engine</span>
        </div>
      </button>

      {/* Primary Navigation Links */}
      <nav>
        <ul className="nav-links">
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/' || currentRoute === '/describe' || currentRoute === '/followup' || currentRoute === '/result' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/describe')}
            >
              <Activity size={16} />
              <span>Symptom Triage</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute.startsWith('/caregivers') ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/caregivers')}
            >
              <Users size={16} />
              <span>Caregiver Directory</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute.startsWith('/checkin') ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/checkin')}
            >
              <Clock size={16} />
              <span>Check-In Monitor</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute.startsWith('/patients') ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/patients')}
            >
              <UserCheck size={16} />
              <span>Family Members</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/dashboard' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              <ShieldCheck size={16} />
              <span>Safety Metrics</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/call-sim' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/call-sim')}
            >
              <PhoneCall size={16} />
              <span>IVR & WhatsApp</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Global Actions */}
      <div className="nav-actions">
        {/* Active Patient Pill */}
        {activePatient && (
          <button
            type="button"
            className="nav-item-btn"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => navigate('/patients')}
            title="Switch Patient Profile"
          >
            <span>👤 {activePatient.full_name}</span>
          </button>
        )}

        {/* Trilingual Switcher */}
        <div className="lang-selector-pill">
          <button 
            type="button"
            className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
            onClick={() => setLanguage('hi')}
          >
            हिन्दी
          </button>
          <button 
            type="button"
            className={`lang-btn ${language === 'hinglish' ? 'active' : ''}`}
            onClick={() => setLanguage('hinglish')}
          >
            Hinglish
          </button>
          <button 
            type="button"
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        {/* Global 112 Red Alert */}
        <button 
          type="button" 
          className="btn-emergency-112"
          onClick={() => navigate('/emergency')}
        >
          <span className="pulse-dot"></span>
          <span>112 Emergency</span>
        </button>
      </div>
    </header>
  )
}
