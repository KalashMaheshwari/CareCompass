import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Mic, Trash2, ShieldCheck, Heart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';
import { speechService } from '../services/speech';
import { ConsentModal } from '../components/ConsentModal';

export const PatientEditPage = ({ memberId = null }) => {
  const { t, navigate, loadMembers, hasConsented, setConsent, language } = useApp();

  const [formData, setFormData] = useState({
    id: memberId || '',
    full_name: '',
    relationship: 'father',
    date_of_birth: '1960-01-01',
    gender: 'Male',
    blood_group: 'B+',
    allergies: '',
    existing_conditions: '',
    current_medications: '',
    medical_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const [conditionsList, setConditionsList] = useState([]);
  const [showConsent, setShowConsent] = useState(false);
  const [isDictatingField, setIsDictatingField] = useState(null);

  const PRESET_CONDITIONS = [
    'Diabetes',
    'Blood pressure',
    'Heart disease',
    'Asthma / breathing problem',
    'Kidney disease',
    'Pregnancy',
    'High cholesterol',
    'Arthritis'
  ];

  useEffect(() => {
    if (memberId && memberId !== 'new') {
      dataService.getMemberById(memberId).then(m => {
        if (m) {
          setFormData(m);
          if (m.existing_conditions) {
            setConditionsList(m.existing_conditions.split(', ').map(s => s.trim()));
          }
        }
      });
    }
  }, [memberId]);

  const toggleCondition = (cond) => {
    let updated;
    if (conditionsList.includes(cond)) {
      updated = conditionsList.filter(c => c !== cond);
    } else {
      updated = [...conditionsList, cond];
    }
    setConditionsList(updated);
    setFormData(prev => ({
      ...prev,
      existing_conditions: updated.join(', ')
    }));
  };

  const startVoiceDictation = (fieldName) => {
    if (isDictatingField === fieldName) {
      speechService.stopListening();
      setIsDictatingField(null);
      return;
    }

    setIsDictatingField(fieldName);
    speechService.startListening({
      language: language === 'hi' ? 'hi' : 'en',
      onResult: ({ transcript, isFinal }) => {
        if (isFinal) {
          setFormData(prev => ({
            ...prev,
            [fieldName]: (prev[fieldName] ? prev[fieldName] + ' ' : '') + transcript
          }));
          setIsDictatingField(null);
        }
      },
      onError: () => setIsDictatingField(null),
      onEnd: () => setIsDictatingField(null)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      alert('Please enter patient full name');
      return;
    }

    if (!hasConsented) {
      setShowConsent(true);
      return;
    }

    await executeSave();
  };

  const executeSave = async () => {
    await dataService.saveMember(formData);
    await loadMembers();
    navigate('/patients');
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this family member profile?')) {
      await dataService.deleteMember(formData.id);
      await loadMembers();
      navigate('/patients');
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.85rem' }}
          onClick={() => navigate('/patients')}
        >
          <ArrowLeft size={16} />
          <span>Back to Profiles</span>
        </button>

        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
          {memberId && memberId !== 'new' ? 'Edit Medical Profile' : 'New Family Medical Profile'}
        </h2>

        {memberId && memberId !== 'new' && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '7px 14px', fontSize: '0.85rem' }}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            <span>Delete Profile</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="surface-card">
        {/* Name & Relationship */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              id="member-fullname-input"
              type="text"
              className="form-control"
              required
              placeholder="e.g. Ramesh Sharma"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Relationship to Account Owner *</label>
            <select
              className="form-control"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            >
              <option value="self">Self (Account Owner)</option>
              <option value="father">Father (Papa)</option>
              <option value="mother">Mother (Mummy)</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="other">Other Dependent</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={formData.date_of_birth || ''}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-control"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              className="form-control"
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
            >
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Existing Conditions Checklist */}
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label className="form-label">Existing Chronic Conditions (Assists Triage Routing)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            {PRESET_CONDITIONS.map((cond) => {
              const isChecked = conditionsList.includes(cond);
              return (
                <button
                  key={cond}
                  type="button"
                  className={`btn ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.84rem' }}
                  onClick={() => toggleCondition(cond)}
                >
                  {isChecked ? '✓ ' : '+ '}
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies & Medications */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div className="form-group">
            <div className="flex-between">
              <label className="form-label" style={{ margin: 0 }}>Known Allergies</label>
              <button
                type="button"
                className={`utility-icon-btn ${isDictatingField === 'allergies' ? 'active' : ''}`}
                style={{ width: '28px', height: '28px' }}
                onClick={() => startVoiceDictation('allergies')}
                title="Dictate allergies"
              >
                <Mic size={14} />
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Penicillin, Peanuts (or speak)"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Medications (Informational Only)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Metformin 500mg, Telmisartan 40mg"
              value={formData.current_medications}
              onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '12px' }}>
          <h4 style={{ fontSize: '0.96rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Emergency Dispatch & Family Contact
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                className="form-control"
                placeholder="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
          <Save size={18} />
          <span>Save Patient Medical Profile</span>
        </button>
      </form>

      <ConsentModal
        isOpen={showConsent}
        onAccept={() => {
          setConsent(true);
          setShowConsent(false);
          executeSave();
        }}
        onDecline={() => {
          setConsent(false);
          setShowConsent(false);
          navigate('/describe');
        }}
      />
    </div>
  );
};
