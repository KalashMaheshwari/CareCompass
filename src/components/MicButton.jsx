import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MicButton = ({
  status = 'idle',
  onClick,
  size = 'giant',
  label = null
}) => {
  const { t } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button
        id="voice-mic-button"
        type="button"
        className={`voice-action-pill ${status === 'listening' ? 'recording' : ''}`}
        style={{ padding: '14px 28px', fontSize: '1rem', minHeight: '52px' }}
        onClick={onClick}
        aria-label={status === 'listening' ? t('tap_to_stop') : t('tap_and_speak')}
        title={status === 'listening' ? t('tap_to_stop') : t('tap_and_speak')}
      >
        {status === 'processing' ? (
          <Loader2 className="spinner" size={20} />
        ) : status === 'listening' ? (
          <Mic size={20} />
        ) : status === 'error' ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}

        <span>{status === 'listening' ? t('tap_to_stop') : t('tap_and_speak')}</span>
      </button>

      {label && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
