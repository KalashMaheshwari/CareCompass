import React from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConsentModal = ({ isOpen, onAccept, onDecline }) => {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="surface-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          margin: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('privacy_title')}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DPDP Act 2023 Compliance</span>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
          {t('consent_message')}
        </p>

        <ul style={{ fontSize: '0.86rem', color: '#475569', paddingLeft: '20px', marginBottom: '22px', lineHeight: 1.6 }}>
          <li>Patient information is used strictly to coordinate caregiver dispatch.</li>
          <li>Data is never sold or shared with commercial brokers.</li>
          <li>You retain full right to erasure under settings at any time.</li>
        </ul>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            onClick={onAccept}
          >
            <ShieldCheck size={18} />
            <span>{t('agree_consent')}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={onDecline}
          >
            <span>{t('decline_consent')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
