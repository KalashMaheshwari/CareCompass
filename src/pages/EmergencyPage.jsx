import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, AlertOctagon, HeartHandshake, ShieldAlert, Send, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';

export const EmergencyPage = () => {
  const {
    t,
    language,
    navigate,
    activePatient,
    triageData
  } = useApp();

  const [alertSent, setAlertSent] = useState(false);
  const [confirmGoBack, setConfirmGoBack] = useState(false);

  const emergencyMessage = language === 'hi'
    ? 'तुरंत आपातकालीन सहायता के लिए 112 पर कॉल करें। मरीज़ के साथ बने रहें और दरवाज़ा खुला रखें।'
    : (language === 'hinglish'
        ? 'Turant emergency help ke liye 112 par call karein. Patient ke paas hi rahein aur door open rakhein.'
        : 'Emergency detected. Call 112 immediately. Stay with the patient and ensure doors are unlocked.');

  useEffect(() => {
    speechService.speak(emergencyMessage, {
      language: language === 'hi' ? 'hi' : 'en'
    });
    return () => {
      speechService.stopSpeaking();
    };
  }, [language]);

  const handleAlertFamily = () => {
    setAlertSent(true);
  };

  const handleCancelEmergency = () => {
    if (confirmGoBack) {
      navigate('/describe');
    } else {
      setConfirmGoBack(true);
      setTimeout(() => setConfirmGoBack(false), 5000);
    }
  };

  const isMentalHealth = triageData.latest_response?.is_mental_health;

  return (
    <div className="emergency-console-layout" role="alert" aria-live="assertive">
      <div className="emergency-action-card">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
          <AlertOctagon size={18} />
          <span>CRITICAL DISPATCH ESCALATION</span>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.5rem', fontWeight: 600, color: '#dc2626', marginBottom: '8px', letterSpacing: '-0.025em' }}>
          {t('emergency_screen_title')}
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '580px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
          {t('emergency_screen_subtitle')}
        </p>

        {/* Hero 112 Call Trigger */}
        <a
          id="hero-call-112-link"
          href="tel:112"
          className="emergency-call-anchor"
          aria-label="Call 112 directly"
        >
          <PhoneCall size={36} />
          <span>{t('emergency_call_112')} (National Helpline)</span>
        </a>

        {/* Secondary Helplines Grid */}
        <div style={{ width: '100%', maxWidth: '540px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '14px 0 24px 0' }}>
          <a
            href="tel:108"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', justifyContent: 'center', borderColor: '#fca5a5' }}
          >
            <Phone size={16} color="#dc2626" />
            <span>Emergency Ambulance: 108</span>
          </a>
          <a
            href="tel:102"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', justifyContent: 'center', borderColor: '#fca5a5' }}
          >
            <Phone size={16} color="#dc2626" />
            <span>Maternity & Neonatal: 102</span>
          </a>
        </div>

        {/* Tele-MANAS Route */}
        {isMentalHealth && (
          <div style={{ width: '100%', maxWidth: '540px', marginBottom: '20px' }}>
            <a
              href="tel:14416"
              className="btn btn-block"
              style={{ background: '#fef08a', color: '#854d0e', fontWeight: 700, textDecoration: 'none' }}
            >
              <HeartHandshake size={18} />
              <span>{t('telemanas_line')}</span>
            </a>
          </div>
        )}

        {/* While You Wait Checklist */}
        <div style={{ width: '100%', maxWidth: '540px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '18px 20px', textAlign: 'left', marginBottom: '20px' }}>
          <strong style={{ fontSize: '0.98rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            {t('while_you_wait_title')}
          </strong>
          <ol style={{ paddingLeft: '20px', fontSize: '0.92rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>{t('wait_step_1')}</li>
            <li>{t('wait_step_2')}</li>
            <li>{t('wait_step_3')}</li>
            <li>{t('wait_step_4')}</li>
          </ol>
        </div>

        {/* Family Emergency Alert Notification */}
        <div style={{ width: '100%', maxWidth: '540px', marginBottom: '20px' }}>
          {!alertSent ? (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleAlertFamily}
            >
              <Send size={16} />
              <span>
                {t('alert_family_button')} ({activePatient?.emergency_contact_name || 'Emergency Contact'})
              </span>
            </button>
          ) : (
            <div style={{ background: '#edf4fe', color: '#1b3560', border: '1px solid #c8d9f0', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#3f64ae" />
              <span>{t('alert_sent')}</span>
            </div>
          )}
        </div>

        {/* False Alarm Navigation Option */}
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.86rem', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={handleCancelEmergency}
        >
          {confirmGoBack ? t('confirm_not_emergency') : t('not_an_emergency')}
        </button>
      </div>
    </div>
  );
};
