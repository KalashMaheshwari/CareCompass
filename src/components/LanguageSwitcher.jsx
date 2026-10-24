import React from 'react';
import { useApp } from '../context/AppContext';

export const LanguageSwitcher = ({ layout = 'compact' }) => {
  const { language, setLanguage } = useApp();

  const options = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'hinglish', label: 'Hinglish' },
    { code: 'en', label: 'English' }
  ];

  if (layout === 'large') {
    return (
      <div className="surface-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Select Navigation Language / भाषा चुनें:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {options.map((opt) => (
            <button
              key={opt.code}
              id={`lang-btn-${opt.code}`}
              type="button"
              className={`btn ${language === opt.code ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '44px', fontSize: '0.92rem', padding: '8px' }}
              onClick={() => setLanguage(opt.code)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lang-switch-box" role="radiogroup" aria-label="Language selection">
      {options.map((opt) => (
        <button
          key={opt.code}
          id={`lang-pill-${opt.code}`}
          type="button"
          className={`lang-switch-pill ${language === opt.code ? 'active' : ''}`}
          onClick={() => setLanguage(opt.code)}
          aria-checked={language === opt.code}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
