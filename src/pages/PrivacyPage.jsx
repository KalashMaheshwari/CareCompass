import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, Eye, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';

export const PrivacyPage = () => {
  const {
    t,
    hasConsented,
    setConsent,
    user,
    members,
    navigate
  } = useApp();

  const [wipeSuccess, setWipeSuccess] = useState(false);

  const handleWipeData = async () => {
    if (window.confirm('Permanently delete all stored medical records, family profiles, and session histories from this device?')) {
      await dataService.wipeAllUserData();
      setConsent(false);
      setWipeSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#325292', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <Lock size={14} />
          <span>Digital Personal Data Protection (DPDP) Act 2023 Compliance</span>
        </div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 600, color: '#101e33', margin: 0 }}>Privacy & Patient Data Governance</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Your rights regarding medical information storage, caregiver coordination data, and permanent erasure.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Consent Status Card */}
        <div className="surface-card">
          <div className="flex-between" style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Patient Data Processing Consent:</strong>
            {hasConsented ? (
              <span className="clinical-badge" style={{ background: '#edf4fe', color: '#1b3560', border: '1px solid #c8d9f0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={13} color="#3f64ae" />
                <span>Consent Active</span>
              </span>
            ) : (
              <span className="clinical-badge" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
                Anonymous Mode (No Persistent Save)
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            CareCompass collects limited health and contact details strictly to dispatch nearest caregivers and communicate clinical handoffs. We never commercialize, resell, or share medical history with unverified third parties.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {!hasConsented ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setConsent(true)}
              >
                Grant Clinical Coordination Consent
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConsent(false)}
              >
                Revoke Consent (Revert to Anonymous Mode)
              </button>
            )}
          </div>
        </div>

        {/* Stored Records Inspector */}
        <div className="surface-card">
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px', color: '#101e33' }}>
            Active Stored Records Under This Account
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Family profiles mapped to <code>public.members</code> table:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {members.map(m => (
              <div key={m.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.full_name} ({m.relationship})</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {m.existing_conditions || 'No pre-existing conditions'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Erasure Rights */}
        <div className="surface-card" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', marginBottom: '8px' }}>
            <Trash2 size={20} />
            <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>Right to Erasure (DPDP Act 2023)</h4>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#b91c1c', marginBottom: '16px', lineHeight: 1.5 }}>
            Permanently delete all stored profiles, booking records, conversation histories, and audit references from the local client. This action is irreversible.
          </p>

          <button
            id="wipe-data-btn"
            type="button"
            className="btn btn-danger"
            onClick={handleWipeData}
          >
            <Trash2 size={16} />
            <span>Permanently Delete All My Data</span>
          </button>

          {wipeSuccess && (
            <div style={{ marginTop: '14px', padding: '10px', background: '#fee2e2', color: '#991b1b', fontSize: '0.88rem', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>
              All user records permanently erased. Resetting application state...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
