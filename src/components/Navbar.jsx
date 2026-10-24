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
  const { currentRoute, navigate, language, setLanguage, activePatient, t } = useApp()

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
          <span className="brand-badge">{t('brand_badge')}</span>
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
              <span>{t('nav_symptoms') || 'Check Symptoms'}</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute.startsWith('/caregivers') ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/caregivers')}
            >
              <Users size={16} />
              <span>{t('nav_find_caregivers') || 'Find Caregivers'}</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute.startsWith('/checkin') || currentRoute === '/history' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/checkin')}
            >
              <Clock size={16} />
              <span>{t('nav_monitor') || 'Health Monitor'}</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/dashboard' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              <ShieldCheck size={16} />
              <span>{t('nav_safety') || 'Clinical Safety'}</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/call-sim' ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/call-sim')}
            >
              <PhoneCall size={16} />
              <span>{t('nav_channels') || 'Phone & WhatsApp'}</span>
            </button>
          </li>
          <li>
            <button 
              className={`nav-item-btn ${currentRoute === '/settings' || currentRoute.startsWith('/patients') ? 'active' : ''}`} 
              type="button"
              onClick={() => navigate('/settings')}
            >
              <UserCheck size={16} />
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
