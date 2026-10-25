import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HandoffPreview = ({ patient, symptoms, urgency, careType }) => {
  const { t } = useApp();

  return (
    <div className="surface-card" style={{ background: '#f8fafc', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <FileText size={18} color="var(--brand-primary)" />
        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('handoff_preview_title')}</h4>
      </div>

      <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>
          <strong>Patient:</strong> {patient?.full_name || 'Patient'} ({patient?.relationship || 'Self'}
          {patient?.date_of_birth ? `, ~${new Date().getFullYear() - new Date(patient.date_of_birth).getTime() / (365.25 * 86400000) | 0} yrs` : ''})
        </div>
        <div>
          <strong>Reported Symptoms:</strong> {symptoms || 'Health concerns reported by patient/family'}
        </div>
        <div>
          <strong>Routing Urgency:</strong> {urgency ? urgency.toUpperCase() : 'SAME_DAY'}
        </div>
        {patient?.existing_conditions && (
          <div>
            <strong>Relevant Clinical Context:</strong> {patient.existing_conditions}
          </div>
        )}
        {patient?.allergies && (
          <div>
            <strong>Known Allergies:</strong> {patient.allergies}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldAlert size={14} color="#3f64ae" />
        <span>{t('handoff_preview_note')}</span>
      </div>
    </div>
  );
};
