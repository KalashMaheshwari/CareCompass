import React from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall } from 'lucide-react';

export const EmergencyButton = ({ size = 'normal', className = '' }) => {
  const { navigate, t } = useApp();

  return (
    <button
      id="global-emergency-button"
      className={`emergency-dispatch-btn ${className} ${size === 'lg' ? 'btn-lg' : ''}`}
      onClick={() => navigate('/emergency')}
      aria-label="Direct 112 Emergency Escalation"
      type="button"
    >
      <PhoneCall size={size === 'lg' ? 20 : 16} />
      <span>{t('emergency')} 112</span>
    </button>
  );
};
