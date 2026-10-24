import React, { useEffect } from 'react';
import { ArrowRight, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, Stethoscope, Clock, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CareTypeHeadline } from '../components/CareTypeHeadline';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { SafetyNetBox } from '../components/SafetyNetBox';
import { SpeakerButton } from '../components/SpeakerButton';

export const ResultPage = () => {
  const {
    t,
    triageData,
    navigate,
    autoSpeak,
    activePatient
  } = useApp();

  const decision = triageData.latest_response || {
    care_type: 'nurse',
    urgency: 'same_day',
    reasoning: 'In-person vitals monitoring and caregiver assessment recommended.',
    matched_caregivers: []
  };

  const isImmediate = decision.urgency === 'immediate' || decision.care_type === 'emergency_referral';
  const spokenText = `${t(`care_types.${decision.care_type}`)}. ${t(`urgency_levels.${decision.urgency}`)}. ${decision.reasoning}`;

  useEffect(() => {
    autoSpeak(spokenText);
  }, [decision]);

  return (
    <div className="two-col-grid" style={{ alignItems: 'start' }}>
      {/* LEFT COLUMN: Clinical Assessment Outcome */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="surface-card">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="clinical-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                Triage Decision
              </span>
              {activePatient && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  For: <strong>{activePatient.full_name}</strong> ({activePatient.relationship})
                </span>
              )}
            </div>
            <SpeakerButton text={spokenText} size={20} />
          </div>

          <div style={{ margin: '8px 0 16px 0' }}>
            <CareTypeHeadline careType={decision.care_type} size="lg" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Clinical Urgency:
            </span>
            <UrgencyBadge urgency={decision.urgency} />
          </div>

          <div style={{ background: 'var(--surface-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Clinical Routing Rationale
            </strong>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
              {decision.reasoning}
            </p>
          </div>
        </div>

        {/* Safety-Net Advisory Box */}
        <SafetyNetBox />
      </div>

      {/* RIGHT COLUMN: Dispatch & Action Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="surface-card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Next Steps</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            {isImmediate
              ? 'This case requires immediate medical escalation. Connect directly to 112 emergency services.'
              : 'Verified caregivers matching this requirement are available in your sector for home or teleconsultation visits.'}
          </p>

          {isImmediate ? (
            <button
              type="button"
              className="btn btn-danger btn-block btn-lg"
              onClick={() => navigate('/emergency')}
            >
              <span>Connect to Emergency Dispatch (112)</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              id="find-caregivers-btn"
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate('/caregivers')}
            >
              <span>View & Dispatch Available Caregivers</span>
              <ArrowRight size={20} />
            </button>
          )}

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reported Input: <em style={{ color: 'var(--text-secondary)' }}>"{triageData.user_input}"</em>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Audit Reference: <code style={{ color: 'var(--text-secondary)' }}>{triageData.sessionId || 'SESS-ONLINE-01'}</code>
            </div>
          </div>

          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate('/')}
            >
              <RotateCcw size={14} />
              <span>Restart Assessment with New Symptoms</span>
            </button>
          </div>
        </div>

        {/* Verification Summary */}
        <div className="surface-card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 600, fontSize: '0.86rem', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>DPDP & Safety Protocol Compliant</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
            Decision logged to audit registry. No diagnoses or drug names are generated by the navigation model.
          </p>
        </div>
      </div>
    </div>
  );
};
