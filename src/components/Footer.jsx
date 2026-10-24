import React from 'react'
import { Phone, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="global-footer">
      <div>
        © 2026 CareCompass · Built for Hack IIITD · Track: AI for Healthcare Access
      </div>

      <div className="footer-helplines">
        <span className="helpline-link">
          <Phone size={14} color="#ef4444" />
          National Emergency: <strong>112</strong>
        </span>
        <span className="helpline-link">
          Ambulance: <strong>108</strong>
        </span>
        <span className="helpline-link">
          Tele-MANAS: <strong>14416</strong>
        </span>
      </div>
    </footer>
  )
}
