import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, ArrowRight, RotateCw, Filter, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';
import { UrgencyBadge } from '../components/UrgencyBadge';

export const HistoryPage = () => {
  const {
    t,
    members,
    navigate,
    setTriageData
  } = useApp();

  const [historyItems, setHistoryItems] = useState([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('all');

  useEffect(() => {
    dataService.getHistory().then(items => setHistoryItems(items));
  }, []);

  const filtered = selectedMemberFilter === 'all'
    ? historyItems
    : historyItems.filter(h => h.patient_name === selectedMemberFilter);

  const handleBookAgain = (item) => {
    setTriageData({
      user_input: item.user_input,
      detected_language: item.detected_language,
      conversation_history: [],
      latest_response: item.decision,
      sessionId: `sess-repeat-${Date.now()}`
    });
    navigate('/caregivers');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 600, color: '#101e33', marginBottom: '4px' }}>Clinical Dispatch History</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Historical triage sessions and caregiver dispatches. Informs future triage without recording fixed diagnoses.
          </p>
        </div>

        {/* Member filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${selectedMemberFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.84rem' }}
            onClick={() => setSelectedMemberFilter('all')}
          >
            All Family Records
          </button>
          {members.map(m => (
            <button
              key={m.id}
              type="button"
              className={`btn ${selectedMemberFilter === m.full_name ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.84rem' }}
              onClick={() => setSelectedMemberFilter(m.full_name)}
            >
              {m.full_name}
            </button>
          ))}
        </div>
      </div>

      {/* History Items Grid */}
      {filtered.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '4px' }}>No Previous Dispatches</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No clinical visits logged yet for this profile.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {filtered.map((item) => (
            <div key={item.id} className="surface-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="var(--brand-primary)" />
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{item.patient_name || 'Patient'}</strong>
                  </div>
                  <UrgencyBadge urgency={item.decision?.urgency || 'routine'} />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Logged: {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
                  "{item.user_input}"
                </p>

                <div style={{ fontSize: '0.82rem', color: '#3f64ae', fontWeight: 700, marginBottom: '8px' }}>
                  Outcome: {(item.decision?.care_type || 'nurse').replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Provider: {item.booking?.caregiver_name || 'Anjali Verma, RN'}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => handleBookAgain(item)}
                >
                  <RotateCw size={13} />
                  <span>Re-Order Dispatch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
