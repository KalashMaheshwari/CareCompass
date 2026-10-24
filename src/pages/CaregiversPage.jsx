import React, { useState } from 'react';
import { UserCheck, MapPin, Clock, Languages, Award, ChevronRight, Phone, Video, X, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CaregiversPage = () => {
  const {
    t,
    triageData,
    setSelectedCaregiver,
    navigate
  } = useApp();

  const caregivers = triageData.latest_response?.matched_caregivers || [];
  const topMatch = caregivers[0];
  const alternatives = caregivers.slice(1);

  const [selectedDetailModal, setSelectedDetailModal] = useState(null);

  const handleSelectCaregiver = (cg) => {
    setSelectedCaregiver(cg);
    navigate(`/booking/${cg.caregiver_id || cg.caregiver_code}`);
  };

  if (caregivers.length === 0) {
    return (
      <div className="surface-card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', padding: '36px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No In-Person Caregiver Available Immediately</h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          All in-person care units in your sector are actively responding to ongoing clinical dispatches.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/booking/teleconsult')}
          >
            <Video size={18} />
            <span>Connect to GP Teleconsult Instead</span>
          </button>
          <a href="tel:112" className="btn btn-secondary">
            <Phone size={18} />
            <span>Healthcare Emergency Dispatch (112)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.65rem', marginBottom: '4px' }}>
          {t('matched_caregivers_title')}
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Verified healthcare responders ranked by proximity to patient location, spoken languages, and real-time availability.
        </p>
      </div>

      {/* TOP RECOMMENDED CAREGIVER: Wide Desktop Highlight Card */}
      {topMatch && (
        <div
          className="surface-card"
          style={{
            border: '2px solid var(--brand-primary)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
            padding: '24px',
            marginBottom: '24px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0284c7', color: '#ffffff', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, position: 'absolute', top: '20px', right: '20px' }}>
            <Award size={14} />
            <span>{t('top_match')} · Clinical Rank #1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                flexShrink: 0
              }}
            >
              {topMatch.full_name?.charAt(0) || 'C'}
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{topMatch.full_name}</h3>
                <span style={{ fontSize: '0.78rem', color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  Verified Provider
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 12px 0' }}>
                {(topMatch.care_types || ['nurse']).map((type, idx) => (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    {type.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="var(--brand-primary)" />
                  <span>{topMatch.distance_km || '2.8'} km away (Sector 4)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600 }}>
                  <Clock size={16} />
                  <span>{topMatch.next_slot || 'Today, within 45 mins'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Languages size={16} color="#0d9488" />
                  <span>{(topMatch.languages || ['Hindi', 'English']).join(', ')}</span>
                </div>
              </div>

              {topMatch.reason && (
                <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd', fontSize: '0.88rem', color: '#0f172a', marginBottom: '16px' }}>
                  <strong>Dispatch Match Rationale:</strong> {topMatch.reason}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  id="book-top-match-btn"
                  className="btn btn-primary btn-lg"
                  onClick={() => handleSelectCaregiver(topMatch)}
                >
                  <span>Select & Confirm Dispatch Slot</span>
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedDetailModal(topMatch)}
                >
                  View Verified Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE OPTIONS GRID */}
      {alternatives.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {t('alternative_options')} (Sector Standby Units)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {alternatives.map((cg, idx) => (
              <div
                key={cg.caregiver_id || idx}
                className="surface-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {cg.full_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{cg.full_name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {cg.distance_km || '4.0'} km • {cg.next_slot || 'Today, 5:30 PM'}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '12px' }}>
                    {cg.reason}
                  </p>
                </div>

                <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => setSelectedDetailModal(cg)}
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '7px 16px', fontSize: '0.86rem' }}
                    onClick={() => handleSelectCaregiver(cg)}
                  >
                    Select Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {selectedDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setSelectedDetailModal(null)}
        >
          <div
            className="surface-card"
            style={{ width: '100%', maxWidth: '520px', padding: '28px', margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{selectedDetailModal.full_name}</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>License ID: {selectedDetailModal.caregiver_code}</span>
              </div>
              <button
                type="button"
                className="utility-icon-btn"
                onClick={() => setSelectedDetailModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: '#334155', marginBottom: '22px' }}>
              <div>
                <strong>Care Specialties:</strong> {(selectedDetailModal.care_types || []).join(', ').toUpperCase()}
              </div>
              <div>
                <strong>Spoken Languages:</strong> {(selectedDetailModal.languages || []).join(', ')}
              </div>
              <div>
                <strong>Verified Response Radius:</strong> {selectedDetailModal.distance_km} km (Active Sector)
              </div>
              <div>
                <strong>Clinical Match Index:</strong> {Math.round((selectedDetailModal.score || 0.9) * 100)}%
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => {
                const cg = selectedDetailModal;
                setSelectedDetailModal(null);
                handleSelectCaregiver(cg);
              }}
            >
              <span>Schedule Visit with {selectedDetailModal.full_name}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
