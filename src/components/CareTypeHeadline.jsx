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
        return <CheckCircle2 size={size === 'lg' ? 32 : 24} color="#3f64ae" />;
      case 'paramedic_home_visit':
        return <Home size={size === 'lg' ? 32 : 24} color="#2b4984" />;
      case 'nurse':
      case 'nurse_home_visit':
        return <UserCheck size={size === 'lg' ? 32 : 24} color="#3f64ae" />;
      case 'gp_teleconsult':
        return <Video size={size === 'lg' ? 32 : 24} color="#223c6e" />;
      case 'specialist':
      case 'specialist_consult':
        return <Stethoscope size={size === 'lg' ? 32 : 24} color="#3f64ae" />;
      case 'emergency_referral':
        return <AlertOctagon size={size === 'lg' ? 32 : 24} color="#dc2626" />;
      default:
        return <CheckCircle2 size={size === 'lg' ? 32 : 24} color="#3f64ae" />;
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
          backgroundColor: '#edf4fe',
          border: '1.5px solid #c8d9f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getIcon()}
      </div>
      <div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: size === 'lg' ? '1.45rem' : '1.15rem', fontWeight: 600, color: '#101e33', margin: 0 }}>
          {label}
        </h2>
      </div>
    </div>
  );
};
