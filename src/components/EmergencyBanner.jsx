import React from 'react'
import { ShieldAlert } from 'lucide-react'

export default function EmergencyBanner() {
  return (
    <div className="disclaimer-bar">
      <span className="disclaimer-tag">Clinical Navigator</span>
      <ShieldAlert size={14} color="#00e5ff" />
      <span>
        CareCompass routes patients to appropriate care levels and does not diagnose or prescribe. In life-threatening emergencies, dial <strong>112</strong> immediately.
      </span>
    </div>
  )
}
