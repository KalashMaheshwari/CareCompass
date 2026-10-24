import React, { useState } from 'react'
import { 
  Compass, 
  Activity, 
  Users, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  AlertCircle,
  Globe,
  UserCheck
} from 'lucide-react'

export default function Navbar() {
  const [selectedLang, setSelectedLang] = useState('hi')

  return (
    <header className="navbar">
      {/* Brand Identity */}
      <div className="nav-brand">
        <div className="brand-icon-wrapper">
          <Compass size={24} />
        </div>
        <div className="brand-text">
          <span className="brand-title">CareCompass</span>
          <span className="brand-badge">Clinical Triage Engine</span>
        </div>
      </div>

      {/* Primary Navigation Links (Visual for stage 2, no subpage routing) */}
      <nav>
        <ul className="nav-links">
          <li>
            <button className="nav-item-btn active" type="button">
              <Activity size={16} />
              <span>Symptom Triage</span>
            </button>
          </li>
          <li>
            <button className="nav-item-btn" type="button">
              <Users size={16} />
              <span>Caregiver Directory</span>
            </button>
          </li>
          <li>
            <button className="nav-item-btn" type="button">
              <Clock size={16} />
              <span>Check-In Monitor</span>
            </button>
          </li>
          <li>
            <button className="nav-item-btn" type="button">
              <UserCheck size={16} />
              <span>Family Members</span>
            </button>
          </li>
          <li>
            <button className="nav-item-btn" type="button">
              <ShieldCheck size={16} />
              <span>Safety Metrics</span>
            </button>
          </li>
          <li>
            <button className="nav-item-btn" type="button">
              <PhoneCall size={16} />
              <span>IVR & WhatsApp</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Global Actions */}
      <div className="nav-actions">
        {/* Trilingual Switcher */}
        <div className="lang-selector-pill">
          <button 
            type="button"
            className={`lang-btn ${selectedLang === 'hi' ? 'active' : ''}`}
            onClick={() => setSelectedLang('hi')}
          >
            हिन्दी
          </button>
          <button 
            type="button"
            className={`lang-btn ${selectedLang === 'hinglish' ? 'active' : ''}`}
            onClick={() => setSelectedLang('hinglish')}
          >
            Hinglish
          </button>
          <button 
            type="button"
            className={`lang-btn ${selectedLang === 'en' ? 'active' : ''}`}
            onClick={() => setSelectedLang('en')}
          >
            EN
          </button>
        </div>

        {/* Global 112 Red Alert */}
        <button type="button" className="btn-emergency-112">
          <span className="pulse-dot"></span>
          <span>112 Emergency</span>
        </button>
      </div>
    </header>
  )
}
