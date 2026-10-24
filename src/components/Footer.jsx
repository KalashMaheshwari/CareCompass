import React from 'react'
import { Phone, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Footer() {
  const { navigate } = useApp()

  return (
    <footer className="global-footer">
      <div>
        © 2026 CareCompass · Built for Hack IIITD · Track: AI for Healthcare Access
        <span style={{ marginLeft: '1rem', opacity: 0.7 }}>
          <button 
            type="button" 
            onClick={() => navigate('/privacy')}
            style={{ color: 'var(--cyan-primary)', fontSize: 'inherit', textDecoration: 'underline' }}
          >
            DPDP Privacy & Consent
          </button>
        </span>
      </div>

      <div className="footer-helplines">
        <button 
          type="button" 
          className="helpline-link"
          onClick={() => navigate('/emergency')}
          style={{ cursor: 'pointer' }}
        >
          <Phone size={14} color="#ef4444" />
          National Emergency: <strong>112</strong>
        </button>
        <a href="tel:108" className="helpline-link">
          Ambulance: <strong>108</strong>
        </a>
        <a href="tel:14416" className="helpline-link">
          Tele-MANAS: <strong>14416</strong>
        </a>
      </div>
    </footer>
  )
}
