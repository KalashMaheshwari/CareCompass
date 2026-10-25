import React, { useState } from 'react';
import { Activity, Clock, AlertTriangle, FastForward, Mic, CheckCircle2, ShieldAlert, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';

export const CheckInPage = ({ bookingId = null }) => {
  const {
    t,
    language,
    activeBooking,
    selectedCaregiver,
    activePatient,
    navigate,
    autoSpeak
  } = useApp();

  const [simulatedTimeOffset, setSimulatedTimeOffset] = useState('Current Surveillance Window (T + 15 Mins)');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isEscalating, setIsEscalating] = useState(false);

  const checkinQuestion = language === 'hi'
    ? 'क्या मरीज़ का बुखार या तकलीफ़ और बढ़ गई है?'
    : (language === 'hinglish' ? 'Kya fever ya tabiyat aur bigad gayi hai?' : 'Are the symptoms or fever getting worse right now?');

  const handleSimulateHoursLater = () => {
    setSimulatedTimeOffset('Surveillance Window: T + 2 Hours (Caregiver On-Site)');
    autoSpeak(checkinQuestion);
  };

  const handleAnswerCheckIn = async (answerType) => {
    setSelectedResponse(answerType);
    speechService.stopSpeaking();

    if (answerType === 'worse' || answerType === 'breathing_trouble') {
      setIsEscalating(true);
      setTimeout(() => {
        setIsEscalating(false);
        navigate('/emergency');
      }, 700);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Time Window Simulation Bar */}
      <div
        className="surface-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          background: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Clock size={16} color="var(--brand-primary)" />
          <span>{simulatedTimeOffset}</span>
        </div>
        <button
          id="simulate-2hrs-btn"
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          onClick={handleSimulateHoursLater}
        >
          <FastForward size={14} />
          <span>Advance Surveillance Timeline (+2 Hours)</span>
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', fontWeight: 600, color: '#101e33', marginBottom: '6px' }}>
          {t('checkin_title')}
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Active clinical surveillance continues post-booking. If symptoms destabilize, the protocol escalates immediately.
        </p>
      </div>

      {/* Main Check-In Card */}
      <div className="surface-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#3f64ae',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          <Activity size={28} />
        </div>

        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '24px', color: '#101e33' }}>
          {checkinQuestion}
        </h3>

        {/* 4 Answer Choice Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          {/* Better */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              minHeight: '74px',
              fontSize: '1rem',
              fontWeight: 700,
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: selectedResponse === 'better' ? '#edf4fe' : '#ffffff',
              borderColor: selectedResponse === 'better' ? '#3f64ae' : 'var(--border-light)',
              color: '#1b3560'
            }}
            onClick={() => handleAnswerCheckIn('better')}
          >
            <span>{t('better')}</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#3f64ae' }}>Symptoms Improving</span>
          </button>

          {/* Same */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              minHeight: '74px',
              fontSize: '1rem',
              fontWeight: 700,
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: selectedResponse === 'same' ? '#f8fafc' : '#ffffff',
              borderColor: selectedResponse === 'same' ? '#64748b' : 'var(--border-light)',
              color: '#334155'
            }}
            onClick={() => handleAnswerCheckIn('same')}
          >
            <span>{t('same')}</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748b' }}>Stable / Unchanged</span>
          </button>

          {/* Worse */}
          <button
            id="checkin-worse-btn"
            type="button"
            className="btn btn-secondary"
            style={{
              minHeight: '74px',
              fontSize: '1rem',
              fontWeight: 700,
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: selectedResponse === 'worse' ? '#fff1f2' : '#ffffff',
              borderColor: '#fca5a5',
              color: '#991b1b'
            }}
            onClick={() => handleAnswerCheckIn('worse')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={18} />
              <span>{t('worse')}</span>
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#b91c1c' }}>Escalate Clinical Protocol</span>
          </button>

          {/* Breathing Trouble */}
          <button
            id="checkin-breathing-btn"
            type="button"
            className="btn btn-danger"
            style={{
              minHeight: '74px',
              fontSize: '1rem',
              fontWeight: 700,
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: '#dc2626',
              borderColor: '#dc2626',
              color: '#ffffff'
            }}
            onClick={() => handleAnswerCheckIn('breathing_trouble')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={18} color="#ffffff" />
              <span>{t('breathing_trouble')}</span>
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fee2e2' }}>Immediate 112 Dispatch</span>
          </button>
        </div>

        {selectedResponse === 'better' && (
          <div style={{ marginTop: '20px', padding: '14px', background: '#edf4fe', borderRadius: 'var(--radius-sm)', border: '1px solid #c8d9f0', color: '#1b3560', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#3f64ae" />
            <span>Patient improvement recorded in audit log. Caregiver will arrive for verification of vitals.</span>
          </div>
        )}

        {selectedResponse === 'same' && (
          <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', color: '#334155', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#3f64ae" />
            <span>Symptoms logged as stable. Caregiver arrival remains on schedule.</span>
          </div>
        )}
      </div>

      {isEscalating && (
        <div className="surface-card" style={{ borderColor: '#fca5a5', background: '#fef2f2', marginTop: '16px', textAlign: 'center', padding: '24px' }}>
          <strong style={{ color: '#991b1b', fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>
            Escalating to Emergency Protocol...
          </strong>
          <span style={{ fontSize: '0.88rem', color: '#b91c1c' }}>
            Routing to direct 112 emergency services and ambulance helpline.
          </span>
        </div>
      )}
    </div>
  );
};
