import React from 'react';
import { Home, Stethoscope, Video, UserCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CareTypeHeadline = ({ careType = 'routine_monitoring', size = 'normal' }) => {
  const { t } = useApp();

  const isRoutine = !careType || careType === 'null' || careType === 'undefined' || careType === 'routine_monitoring' || careType === 'self_care';
  const effectiveCareType = isRoutine ? 'routine_monitoring' : careType;

  const getIcon = () => {
    switch (effectiveCareType) {
      case 'routine_monitoring':
      case 'self_care':
        return <CheckCircle2 size={size === 'lg' ? 32 : 24} color="#10b981" />;
      case 'paramedic_home_visit':
        return <Home size={size === 'lg' ? 32 : 24} color="#0d9488" />;
      case 'nurse':
      case 'nurse_home_visit':
        return <UserCheck size={size === 'lg' ? 32 : 24} color="#0284c7" />;
      case 'gp_teleconsult':
        return <Video size={size === 'lg' ? 32 : 24} color="#6366f1" />;
      case 'specialist':
      case 'specialist_consult':
        return <Stethoscope size={size === 'lg' ? 32 : 24} color="#8b5cf6" />;
      case 'emergency_referral':
        return <AlertOctagon size={size === 'lg' ? 32 : 24} color="#ef4444" />;
      default:
        return <CheckCircle2 size={size === 'lg' ? 32 : 24} color="#10b981" />;
    }
  };

  const label = (
    effectiveCareType === 'nurse_home_visit' ? t('care_types.nurse') :
    effectiveCareType === 'specialist_consult' ? t('care_types.specialist') :
    t(`care_types.${effectiveCareType}`)
  ) || (isRoutine ? 'Self-Care & Routine Health Monitoring' : t('care_types.gp_teleconsult'));

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
