import React from 'react';
import { AlertCircle, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from './SpeakerButton';

export const SafetyNetBox = () => {
  const { t } = useApp();
  const textToRead = `${t('safety_net_title')} ${t('safety_net_body')}`;

  return (
    <div className="safety-net-advisory" role="note" aria-label="Safety advice">
      <AlertCircle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <div className="flex-between" style={{ marginBottom: '4px' }}>
          <strong>{t('safety_net_title')}</strong>
          <SpeakerButton text={textToRead} size={15} showLabel />
        </div>
        <p>{t('safety_net_body')}</p>
      </div>
    </div>
  );
};
