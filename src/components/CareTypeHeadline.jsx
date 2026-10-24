import React from 'react';
import { Home, Stethoscope, Video, UserCheck, AlertOctagon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CareTypeHeadline = ({ careType = 'nurse', size = 'normal' }) => {
  const { t } = useApp();

  const getIcon = () => {
    switch (careType) {
      case 'paramedic_home_visit':
        return <Home size={size === 'lg' ? 32 : 24} color="#0d9488" />;
      case 'nurse':
        return <UserCheck size={size === 'lg' ? 32 : 24} color="#0284c7" />;
      case 'gp_teleconsult':
        return <Video size={size === 'lg' ? 32 : 24} color="#6366f1" />;
      case 'specialist':
        return <Stethoscope size={size === 'lg' ? 32 : 24} color="#8b5cf6" />;
      case 'emergency_referral':
        return <AlertOctagon size={size === 'lg' ? 32 : 24} color="#ef4444" />;
      default:
        return <UserCheck size={size === 'lg' ? 32 : 24} color="#0284c7" />;
    }
  };

  const label = t(`care_types.${careType}`) || careType;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: size === 'lg' ? '56px' : '44px',
          height: size === 'lg' ? '56px' : '44px',
          borderRadius: '50%',
          backgroundColor: '#f0fdfa',
          border: '1.5px solid #ccfbf1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getIcon()}
      </div>
      <div>
        <h2 style={{ fontSize: size === 'lg' ? '1.35rem' : '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {label}
        </h2>
      </div>
    </div>
  );
};
