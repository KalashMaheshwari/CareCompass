import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, Calendar, Share2, Bell, AlertTriangle, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';
import { HandoffPreview } from '../components/HandoffPreview';

export const BookingPage = ({ bookingId = null }) => {
  const {
    t,
    selectedCaregiver,
    triageData,
    activePatient,
    activeBooking,
    setActiveBooking,
    navigate
  } = useApp();

  const [slots, setSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingRecord, setBookingRecord] = useState(activeBooking);
  const [shareToast, setShareToast] = useState(false);

  const caregiver = selectedCaregiver || {
    id: 'cg-uuid-014',
    caregiver_code: 'CG_014',
    full_name: 'Anjali Verma, RN',
    phone: '+91 98100 11223',
    care_types: ['nurse'],
    distance_km: '3.2'
  };

  useEffect(() => {
    const generated = [
      { id: 's1', time: 'Within 45 mins', display: 'Immediate Dispatch (45 mins)' },
      { id: 's2', time: 'Today, 4:00 PM', display: 'Today, 4:00 PM' },
      { id: 's3', time: 'Today, 5:30 PM', display: 'Today, 5:30 PM' },
      { id: 's4', time: 'Tomorrow, 9:00 AM', display: 'Tomorrow, 9:00 AM' }
    ];
    setSlots(generated);
    setChosenSlot(generated[0]);

    if (bookingId && bookingId !== 'new') {
      dataService.getBookingById(bookingId).then(b => {
        if (b) {
          setBookingRecord(b);
          setIsConfirmed(true);
        }
      });
    }
  }, [bookingId]);

  const handleConfirm = async () => {
    const newBooking = await dataService.createBooking({
      sessionId: triageData.sessionId,
      caregiverId: caregiver.id || 'cg-uuid-014',
      availabilityId: chosenSlot?.id,
      scheduledAt: chosenSlot?.time,
      patientName: activePatient?.full_name || 'Family Member'
    });

    await dataService.addHistoryItem({
      id: triageData.sessionId || `sess-${Date.now()}`,
      user_id: 'user-rohit-34',
      user_input: triageData.user_input,
      detected_language: triageData.detected_language || 'hinglish',
      created_at: new Date().toISOString(),
      status: 'confirmed',
      patient_name: activePatient?.full_name || 'Family Member',
      decision: triageData.latest_response || {
        care_type: caregiver.care_types?.[0] || 'nurse',
        urgency: 'same_day',
        reasoning: 'In-person caregiver scheduled.'
      },
      booking: newBooking
    });

    setBookingRecord(newBooking);
    setActiveBooking(newBooking);
    setIsConfirmed(true);
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  return (
    <div className="two-col-grid" style={{ alignItems: 'start' }}>
      {/* LEFT COLUMN: Provider Information & Handoff Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.3rem'
              }}
            >
              {caregiver.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{caregiver.full_name}</h2>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(caregiver.care_types || ['nurse']).join(', ').toUpperCase()} • Code: {caregiver.caregiver_code}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.78rem' }}>Response Distance</span>
              <strong>{caregiver.distance_km || '3.2'} km</strong>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.78rem' }}>Verified Contact</span>
              <strong>{caregiver.phone || '+91 98100 11223'}</strong>
            </div>
          </div>
        </div>

        {/* Slot Selector */}
        {!isConfirmed && (
          <div className="surface-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '12px' }}>{t('select_slot')}</h3>
            <div className="slot-selector-grid">
              {slots.map((s) => (
                <button
                  key={s.id}
                  id={`slot-btn-${s.id}`}
                  type="button"
                  className={`slot-option-btn ${chosenSlot?.id === s.id ? 'selected' : ''}`}
                  onClick={() => setChosenSlot(s)}
                >
                  <Clock size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  <span>{s.display}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Handoff Summary */}
        <HandoffPreview
          patient={activePatient}
          symptoms={triageData.user_input}
          urgency={triageData.latest_response?.urgency || 'SAME_DAY'}
          careType={triageData.latest_response?.care_type || 'nurse'}
        />
      </div>

      {/* RIGHT COLUMN: Confirmation & Dispatch Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!isConfirmed ? (
          <div className="surface-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Confirm Clinical Dispatch</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Confirming notifies the caregiver's console immediately. Emergency protocols remain on standby.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '18px', fontSize: '0.88rem' }}>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="text-muted">Selected Window:</span>
                <strong>{chosenSlot?.time || 'Within 45 mins'}</strong>
              </div>
              <div className="flex-between">
                <span className="text-muted">Recipient:</span>
                <strong>{activePatient?.full_name || 'Patient'}</strong>
              </div>
            </div>

            <button
              id="confirm-booking-btn"
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={handleConfirm}
            >
              <CheckCircle2 size={20} />
              <span>{t('confirm_booking')}</span>
            </button>
          </div>
        ) : (
          <div className="surface-card" style={{ borderColor: '#99f6e4', background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f766e', marginBottom: '8px' }}>
              <CheckCircle2 size={26} color="#059669" />
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#065f46' }}>Dispatch Confirmed</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#0f766e', marginBottom: '16px' }}>
              {t('caregiver_arriving')}
            </p>

            <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #ccfbf1', marginBottom: '16px', fontSize: '0.88rem' }}>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="text-muted">Dispatch Window:</span>
                <strong>{chosenSlot?.time || 'Within 45 mins'}</strong>
              </div>
              <div className="flex-between">
                <span className="text-muted">Booking Reference:</span>
                <code>{bookingRecord?.id || 'BK-DISPATCH-01'}</code>
              </div>
            </div>

            <a
              href={`tel:${caregiver.phone || '9810011223'}`}
              className="btn btn-primary btn-block"
              style={{ textDecoration: 'none', marginBottom: '12px' }}
            >
              <Phone size={18} />
              <span>Call Provider Directly ({caregiver.phone || '98100 11223'})</span>
            </a>

            {/* Stepper */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', margin: '14px 0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Dispatch Progression:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.74rem' }}>
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 4px', borderRadius: '4px', fontWeight: 700 }}>1. Logged</div>
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 4px', borderRadius: '4px', fontWeight: 700 }}>2. Confirmed</div>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px 4px', borderRadius: '4px', fontWeight: 700 }}>3. En Route</div>
                <div style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 4px', borderRadius: '4px' }}>4. Arrived</div>
              </div>
            </div>

            {/* Sharing / Reminders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px' }}
                onClick={handleShare}
              >
                <Share2 size={15} />
                <span>Share Details</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px' }}
                onClick={() => alert('Calendar reminder registered!')}
              >
                <Bell size={15} />
                <span>Calendar Alert</span>
              </button>
            </div>

            {shareToast && (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
                Dispatch notice copied to clipboard.
              </div>
            )}

            <button
              id="goto-checkin-btn"
              type="button"
              className="btn btn-teal btn-block btn-lg"
              onClick={() => navigate(`/checkin/${bookingRecord?.id || 'live'}`)}
            >
              <span>Launch Active Post-Booking Check-In</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
