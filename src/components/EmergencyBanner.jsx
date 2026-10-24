import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function EmergencyBanner() {
  const { navigate } = useApp()

  return (
    <div className="disclaimer-bar">
      <span className="disclaimer-tag">Clinical Navigator</span>
      <ShieldAlert size={14} color="#00e5ff" />
      <span>
        CareCompass routes patients to appropriate care levels and does not diagnose or prescribe. In life-threatening emergencies, dial{' '}
        <strong 
          style={{ cursor: 'pointer', textDecoration: 'underline', color: '#f87171' }}
          onClick={() => navigate('/emergency')}
          title="Open Emergency Helpline Screen"
        >
          112
        </strong>{' '}
        immediately.
      </span>
    </div>
  )
}
