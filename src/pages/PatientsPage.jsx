import React from 'react';
import { User, UserPlus, Heart, Edit2, ArrowRight, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PatientsPage = () => {
  const { t, members, activePatient, setActivePatient, navigate } = useApp();

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSelectPatient = (member) => {
    setActivePatient(member);
    navigate('/describe');
  };

  const handleOneOffPatient = () => {
    setActivePatient({
      id: 'one-off',
      full_name: 'Unsaved Patient',
      relationship: 'other',
      existing_conditions: '',
      allergies: ''
    });
    navigate('/describe');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 600, color: '#101e33', marginBottom: '4px' }}>Family Health Profiles</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Stored medical records adhering to the <code>members</code> database schema. Select a person to begin care routing.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/patients/new')}
        >
          <UserPlus size={18} />
          <span>Add New Family Member</span>
        </button>
      </div>

      {/* Responsive Grid of Patient Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {members.map((m) => {
          const age = calculateAge(m.date_of_birth);
          const isSelected = activePatient?.id === m.id;

          return (
            <div
              key={m.id}
              className="surface-card"
              style={{
                borderColor: isSelected ? '#3f64ae' : 'var(--border-light)',
                background: isSelected ? '#edf4fe' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => handleSelectPatient(m)}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="flex-between" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--brand-primary)' : '#e0f2fe',
                        color: isSelected ? '#ffffff' : '#3f64ae',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}
                    >
                      {m.full_name ? m.full_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.18rem', fontWeight: 600, color: '#101e33', margin: 0 }}>{m.full_name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {m.relationship} {age !== null ? `• ${age} yrs` : ''} {m.blood_group ? `• ${m.blood_group}` : ''}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="clinical-badge" style={{ background: '#3f64ae', color: '#ffffff' }}>
                      <Check size={12} />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {m.existing_conditions && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Conditions:</strong> {m.existing_conditions}
                    </div>
                  )}
                  {m.allergies && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Allergies:</strong> {m.allergies}
                    </div>
                  )}
                  {m.medical_notes && (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                      "{m.medical_notes}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patients/${m.id}`);
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit Profile</span>
                </button>

                <span style={{ fontSize: '0.84rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Select for Triage</span>
                  <ChevronRight size={16} />
                </span>
              </div>
            </div>
          );
        })}

        {/* Add Person Card */}
        <div
          className="surface-card"
          style={{
            border: '2px dashed var(--border-subtle)',
            background: 'var(--surface-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            textAlign: 'center',
            minHeight: '190px'
          }}
          onClick={() => navigate('/patients/new')}
          role="button"
          tabIndex={0}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', marginBottom: '10px', boxShadow: 'var(--shadow-xs)' }}>
            <UserPlus size={22} />
          </div>
          <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>Add Family Member</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Store baseline health profile for parents, children, or spouse
          </p>
        </div>
      </div>
    </div>
  );
};
