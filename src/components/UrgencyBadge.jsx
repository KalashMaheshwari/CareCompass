import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UrgencyBadge = ({ urgency = 'same_day' }) => {
  const { t } = useApp();

  const config = {
    routine: {
      className: 'clinical-urgency-routine',
      icon: <Calendar size={14} />,
      label: t('urgency_levels.routine')
    },
    same_day: {
      className: 'clinical-urgency-same_day',
      icon: <Clock size={14} />,
      label: t('urgency_levels.same_day')
    },
    immediate: {
      className: 'clinical-urgency-immediate',
      icon: <AlertTriangle size={14} />,
      label: t('urgency_levels.immediate')
    }
  };

  const current = config[urgency] || config.routine;

  return (
    <span className={`clinical-badge ${current.className}`}>
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
