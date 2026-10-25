import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Check, Clock, MapPin, Phone, Share2, Bell,
  ArrowRight, ShieldCheck, Zap, IndianRupee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';
import { HandoffPreview } from '../components/HandoffPreview';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

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

  // Display-only derivation of the repeated fallback price
  const fee = caregiver.price || 499;

  return (
    <div className={`bp-page ${isConfirmed ? 'bp-page--confirmed' : ''}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .bp-page {
          --bp-ink: #101e33;
          --bp-ink-2: #2d4261;
          --bp-muted: #577094;
          --bp-faint: #8ca2c0;
          --bp-line: #d2e0f0;
          --bp-line-2: #bdd1ea;
          --bp-tint: #edf3fa;
          --bp-accent: #3f64ae;
          --bp-accent-deep: #1b3560;
          --bp-accent-vibrant: #2968db;
          --bp-accent-soft: #edf4fe;
          --bp-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 1060px;
          margin: 0 auto;
          width: 100%;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--bp-ink);
          -webkit-font-smoothing: antialiased;
        }
        .bp-page button { -webkit-tap-highlight-color: transparent; font-family: inherit; }
        .bp-page ::selection { background: rgba(63, 100, 174, .16); }
        .bp-page :focus-visible { outline: 2px solid var(--bp-accent); outline-offset: 2px; }

        @keyframes bp-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes bp-pop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bp-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.78); } }
        @keyframes bp-ring { 0% { transform: scale(.82); opacity: .9; } 75%, 100% { transform: scale(1.32); opacity: 0; } }

        /* ---------- Page header ---------- */
        .bp-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; margin-bottom: 28px; animation: bp-rise .5s ease both; }
        .bp-overline { display: flex; align-items: center; gap: 10px; font-size: 10.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--bp-accent); margin: 0 0 12px; }
        .bp-overline::before { content: ''; width: 22px; height: 2px; border-radius: 2px; background: var(--bp-accent); }
        .bp-h1 { font-family: 'Fraunces', Georgia, serif; font-size: 31px; font-weight: 600; line-height: 1.12; letter-spacing: -.018em; margin: 0 0 10px; }
        .bp-sub { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--bp-ink-2); max-width: 54ch; }

        .bp-journey { display: flex; align-items: center; gap: 10px; flex-shrink: 0; padding-bottom: 6px; }
        .bp-js { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; color: var(--bp-faint); white-space: nowrap; }
        .bp-js.done { color: var(--bp-ink-2); }
        .bp-js.done svg { color: var(--bp-accent); }
        .bp-js.live { color: var(--bp-ink); }
        .bp-js-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bp-accent); animation: bp-pulse 1.6s ease-in-out infinite; }
        .bp-jr { width: 24px; height: 1px; background: var(--bp-line-2); }
        .bp-jr.done { background: rgba(63, 100, 174, .4); }

        /* ---------- Layout ---------- */
        .bp-grid { display: grid; grid-template-columns: minmax(0, 1fr) 396px; gap: 24px; align-items: start; }
        .bp-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
        .bp-col--side { position: sticky; top: 24px; }

        /* ---------- Cards ---------- */
        .bp-card { box-sizing: border-box; background: #fff; border: 1px solid var(--bp-line); border-radius: 20px; padding: 26px 28px; box-shadow: 0 1px 2px rgba(28, 36, 32, .05), 0 16px 40px -24px rgba(28, 36, 32, .14); animation: bp-rise .55s ease both; }
        .bp-side-card { animation-delay: .1s; padding: 28px; }
        .bp-card-head { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; }
        .bp-card-head svg { color: var(--bp-accent); flex-shrink: 0; }
        .bp-card-head h3 { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--bp-ink-2); }

        /* ---------- Caregiver ---------- */
        .bp-cg { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
        .bp-cg-id { display: flex; align-items: center; gap: 16px; min-width: 0; }
        .bp-avatar { width: 58px; height: 58px; border-radius: 17px; background: #3f64ae; color: #ffffff; display: grid; place-items: center; font-family: 'Fraunces', Georgia, serif; font-size: 21px; font-weight: 600; letter-spacing: .01em; flex-shrink: 0; }
        .bp-cg-name { margin: 0 0 5px; font-family: 'Fraunces', Georgia, serif; font-size: 23px; font-weight: 600; letter-spacing: -.015em; line-height: 1.15; }
        .bp-cg-meta { font-family: var(--bp-mono); font-size: 11px; letter-spacing: .06em; color: var(--bp-muted); }
        .bp-cg-code { color: var(--bp-faint); }
        .bp-verified { display: inline-flex; align-items: center; gap: 6px; background: var(--bp-accent-soft); color: var(--bp-accent); border-radius: 999px; padding: 5px 11px; font-size: 11px; font-weight: 700; flex-shrink: 0; }

        .bp-cg-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 18px; margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--bp-line); }
        .bp-stat { min-width: 0; }
        .bp-stat + .bp-stat { border-left: 1px solid var(--bp-line); padding-left: 18px; }
        .bp-stat__k { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--bp-faint); margin-bottom: 6px; }
        .bp-stat__k svg { color: var(--bp-muted); flex-shrink: 0; }
        .bp-stat__v { display: block; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
        .bp-stat__v--mono { font-family: var(--bp-mono); font-size: 13px; letter-spacing: 0; }
        .bp-stat__v--fee { color: var(--bp-accent); font-size: 16.5px; }
        .bp-stat__v--fee em { font-style: normal; display: block; margin-top: 2px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--bp-faint); }

        /* ---------- Slot selector ---------- */
        .bp-slots { display: flex; flex-direction: column; gap: 9px; }
        .bp-slot { display: flex; align-items: center; gap: 13px; width: 100%; box-sizing: border-box; background: #fff; border: 1.5px solid var(--bp-line); border-radius: 13px; padding: 11px 14px; cursor: pointer; text-align: left; transition: all .16s ease; }
        .bp-slot:hover { border-color: var(--bp-line-2); background: var(--bp-tint); }
        .bp-slot.selected { border-color: var(--bp-accent); background: var(--bp-accent-soft); box-shadow: 0 0 0 3px rgba(63, 100, 174, .08); }
        .bp-slot__ic { width: 36px; height: 36px; border-radius: 11px; background: var(--bp-tint); border: 1px solid var(--bp-line); color: var(--bp-ink-2); display: grid; place-items: center; flex-shrink: 0; transition: all .16s ease; }
        .bp-slot.selected .bp-slot__ic { background: var(--bp-accent); border-color: var(--bp-accent); color: #fff; }
        .bp-slot__txt { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 14px; font-weight: 600; letter-spacing: -.005em; }
        .bp-slot__tag { font-style: normal; font-family: var(--bp-mono); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; background: var(--bp-accent); color: #fff; border-radius: 5px; padding: 2.5px 6px; }
        .bp-slot__ind { width: 21px; height: 21px; border-radius: 50%; border: 1.5px solid var(--bp-line-2); display: grid; place-items: center; color: #fff; flex-shrink: 0; transition: all .16s ease; }
        .bp-slot.selected .bp-slot__ind { border-color: var(--bp-accent); background: var(--bp-accent); }

        /* ---------- Side card (confirm) ---------- */
        .bp-h2 { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 600; letter-spacing: -.015em; margin: 0 0 8px; }
        .bp-side-sub { margin: 0 0 20px; font-size: 13.5px; line-height: 1.6; color: var(--bp-muted); }

        /* ---------- Receipt ---------- */
        .bp-rcpt { box-sizing: border-box; background: var(--bp-tint); border: 1px solid var(--bp-line); border-radius: 13px; padding: 5px 16px; margin-bottom: 18px; }
        .bp-rcpt__row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 11px 0; font-size: 13px; }
        .bp-rcpt__row span { color: var(--bp-muted); }
        .bp-rcpt__row strong { font-weight: 600; text-align: right; }
        .bp-rcpt__row + .bp-rcpt__row { border-top: 1px dashed var(--bp-line-2); }
        .bp-rcpt__row--total strong { color: var(--bp-accent); font-size: 16.5px; }
        .bp-rcpt__row--total em { font-style: normal; font-size: 10.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #3f64ae; margin-left: 7px; }
        .bp-code { font-family: var(--bp-mono); font-size: 12px; font-weight: 600; letter-spacing: .03em; background: #fff; border: 1px dashed var(--bp-line-2); border-radius: 7px; padding: 3px 9px; color: var(--bp-ink); }

        /* ---------- Buttons ---------- */
        .bp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-family: inherit; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; transition: transform .16s ease, background .16s ease, border-color .16s ease, color .16s ease; }
        .bp-btn--lg { box-sizing: border-box; width: 100%; height: 50px; padding: 0 18px; font-size: 14.5px; letter-spacing: -.005em; }
        .bp-btn--ink { background: #2b4984; color: #fff; }
        .bp-btn--ink:hover { background: #223c6e; transform: translateY(-1px); }
        .bp-btn--ink:active { transform: none; }
        .bp-btn--ink svg { transition: transform .16s ease; }
        .bp-btn--ink:hover svg { transform: translateX(3px); }
        .bp-btn--accent { background: #3f64ae; color: #fff; }
        .bp-btn--accent:hover { background: #34579d; transform: translateY(-1px); }
        .bp-btn--accent:active { transform: none; }
        .bp-btn--ghost { box-sizing: border-box; background: #fff; border: 1px solid var(--bp-line-2); color: var(--bp-ink-2); height: 42px; padding: 0 14px; font-size: 13px; border-radius: 11px; }
        .bp-btn--ghost:hover { border-color: var(--bp-ink-2); color: var(--bp-ink); background: var(--bp-tint); }
        .bp-tel { font-family: var(--bp-mono); font-size: 12.5px; opacity: .85; }

        .bp-trust { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 14px 0 0; font-size: 12px; color: var(--bp-faint); text-align: center; }
        .bp-trust svg { color: var(--bp-accent); flex-shrink: 0; }

        /* ---------- Success state ---------- */
        .bp-card--success { padding: 0; overflow: hidden; border-color: #bfdbfe; }
        .bp-shead { display: flex; align-items: center; gap: 15px; background: var(--bp-accent-soft); border-bottom: 1px solid #dbeafe; padding: 24px 28px; }
        .bp-scheck { position: relative; width: 52px; height: 52px; border-radius: 50%; background: var(--bp-accent); color: #fff; display: grid; place-items: center; flex-shrink: 0; animation: bp-pop .55s cubic-bezier(.34, 1.56, .64, 1) both; }
        .bp-scheck::after { content: ''; position: absolute; inset: -6px; border-radius: 50%; border: 1.5px solid rgba(63, 100, 174, .35); animation: bp-ring 2.4s ease-out infinite; }
        .bp-sh2 { margin: 0 0 3px; font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 600; letter-spacing: -.015em; color: var(--bp-accent-deep); }
        .bp-shead p { margin: 0; font-size: 13px; line-height: 1.5; color: #1e40af; }
        .bp-sbody { display: flex; flex-direction: column; padding: 22px 28px 26px; }
        .bp-sbody .bp-rcpt { margin-bottom: 16px; }
        .bp-sbody .bp-btn--accent { margin-bottom: 20px; }

        /* ---------- Dispatch timeline ---------- */
        .bp-tl-wrap { border-top: 1px solid var(--bp-line); padding-top: 18px; margin-bottom: 18px; }
        .bp-tl-title { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--bp-ink-2); margin-bottom: 15px; }
        .bp-timeline { display: flex; align-items: flex-start; gap: 7px; }
        .bp-tl-step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .bp-tl-node { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 1.5px solid var(--bp-line-2); }
        .bp-tl-step.done .bp-tl-node { background: var(--bp-accent); border-color: var(--bp-accent); color: #fff; }
        .bp-tl-step.live .bp-tl-node { border: 2px solid var(--bp-accent); }
        .bp-tl-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--bp-accent); animation: bp-pulse 1.5s ease-in-out infinite; }
        .bp-tl-rail { flex: 1; min-width: 8px; height: 2px; border-radius: 2px; background: var(--bp-line); margin-top: 12px; }
        .bp-tl-rail.done { background: var(--bp-accent); }
        .bp-tl-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: .04em; color: var(--bp-faint); white-space: nowrap; }
        .bp-tl-step.done .bp-tl-lbl { color: var(--bp-ink-2); }
        .bp-tl-step.live .bp-tl-lbl { color: var(--bp-accent-deep); font-weight: 700; }

        /* ---------- Share row + toast ---------- */
        .bp-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 12px; }
        .bp-toast { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--bp-accent-soft); color: var(--bp-accent-deep); border: 1px solid #cfe3dc; border-radius: 10px; padding: 9px 12px; font-size: 12.5px; font-weight: 600; margin-bottom: 12px; animation: bp-rise .35s ease both; }

        /* ---------- Responsive ---------- */
        @media (max-width: 980px) {
          .bp-grid { grid-template-columns: 1fr; }
          .bp-col--side { position: static; }
          .bp-journey { display: none; }
          .bp-page--confirmed .bp-col--side { order: -1; }
        }
        @media (max-width: 768px) {
          .bp-page { padding: 0 2px; }
          .bp-head { margin-bottom: 12px; }
          .bp-overline { font-size: 9px; letter-spacing: .12em; margin-bottom: 4px; }
          .bp-h1 { font-size: 19px; line-height: 1.22; margin-bottom: 4px; }
          .bp-sub { font-size: 11.5px; line-height: 1.42; margin-bottom: 10px; }
          .bp-card, .bp-side-card { padding: 16px 14px 14px; border-radius: 16px; margin-bottom: 14px; }
          .bp-shead { padding: 12px 14px; }
          .bp-sbody { padding: 12px 14px 14px; }
          .bp-cg-name { font-size: 16px; }
          .bp-cg-stats { grid-template-columns: 1fr; }
          .bp-stat + .bp-stat { border-left: none; padding-left: 0; border-top: 1px solid var(--bp-line); padding-top: 8px; margin-top: 8px; }
          .bp-tl-lbl { font-size: 9px; }
          .bp-timeline { gap: 4px; }
          .bp-btn { height: 36px; font-size: 12.5px; border-radius: 9px; }
          .bp-btn-confirm { height: 36px; font-size: 12.5px; padding: 0 14px; border-radius: 9px; }
          .bp-slot-chip { padding: 5px 10px; font-size: 11.5px; border-radius: 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bp-page *, .bp-page *::before, .bp-page *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Page header + journey stepper */}
      <header className="bp-head">
        <div>
          <p className="bp-overline">Care dispatch</p>
          <h1 className="bp-h1">{isConfirmed ? 'Visit confirmed' : 'Confirm the home visit'}</h1>
          <p className="bp-sub">
            {isConfirmed
              ? 'Your provider has been notified and is preparing for the visit.'
              : 'Review your matched provider, choose an arrival window, and dispatch care to your doorstep.'}
          </p>
        </div>

        <div className="bp-journey" aria-hidden="true">
          <span className="bp-js done"><Check size={11} strokeWidth={3} /><span>Triage</span></span>
          <span className="bp-jr done" />
          <span className="bp-js done"><Check size={11} strokeWidth={3} /><span>Provider</span></span>
          <span className="bp-jr done" />
          <span className={`bp-js ${isConfirmed ? 'done' : 'live'}`}>
            {isConfirmed ? <Check size={11} strokeWidth={3} /> : <span className="bp-js-dot" />}
            <span>Dispatch</span>
          </span>
        </div>
      </header>

      <div className="bp-grid">
        {/* LEFT COLUMN */}
        <div className="bp-col">
          {/* Caregiver profile */}
          <section className="bp-card">
            <div className="bp-cg">
              <div className="bp-cg-id">
                <div className="bp-avatar">{getInitials(caregiver.full_name)}</div>
                <div>
                  <h2 className="bp-cg-name">{caregiver.full_name}</h2>
                  <div className="bp-cg-meta">
                    {(caregiver.care_types || ['nurse']).join(', ').toUpperCase()}
                    <span className="bp-cg-code"> · {caregiver.caregiver_code}</span>
                  </div>
                </div>
              </div>
              <span className="bp-verified"><ShieldCheck size={13} />Verified provider</span>
            </div>

            <div className="bp-cg-stats">
              <div className="bp-stat">
                <span className="bp-stat__k"><MapPin size={13} />Response distance</span>
                <span className="bp-stat__v">{caregiver.distance_km || '3.2'} km</span>
              </div>
              <div className="bp-stat">
                <span className="bp-stat__k"><Phone size={13} />Verified contact</span>
                <span className="bp-stat__v bp-stat__v--mono">{caregiver.phone || '+91 98100 11223'}</span>
              </div>
              <div className="bp-stat">
                <span className="bp-stat__k"><IndianRupee size={13} />Visit fee</span>
                <span className="bp-stat__v bp-stat__v--fee">₹{fee}<em>Pay after visit</em></span>
              </div>
            </div>
          </section>

          {/* Slot selector */}
          {!isConfirmed && (
            <section className="bp-card" style={{ animationDelay: '.07s' }}>
              <div className="bp-card-head">
                <Clock size={15} />
                <h3>{t('select_slot')}</h3>
              </div>
              <div className="bp-slots">
                {slots.map((s, i) => (
                  <button
                    key={s.id}
                    id={`slot-btn-${s.id}`}
                    type="button"
                    className={`bp-slot ${chosenSlot?.id === s.id ? 'selected' : ''}`}
                    onClick={() => setChosenSlot(s)}
                  >
                    <span className="bp-slot__ic">{i === 0 ? <Zap size={15} /> : <Clock size={15} />}</span>
                    <span className="bp-slot__txt">
                      {s.display}
                      {i === 0 && <em className="bp-slot__tag">Fastest</em>}
                    </span>
                    <span className="bp-slot__ind">
                      {chosenSlot?.id === s.id && <Check size={12} strokeWidth={3.5} />}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Clinical handoff summary */}
          <HandoffPreview
            patient={activePatient}
            symptoms={triageData.user_input}
            urgency={triageData.latest_response?.urgency || 'SAME_DAY'}
            careType={triageData.latest_response?.care_type || 'nurse'}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="bp-col bp-col--side">
          {!isConfirmed ? (
            <section className="bp-card bp-side-card">
              <p className="bp-overline">Final step</p>
              <h2 className="bp-h2">Confirm clinical dispatch</h2>
              <p className="bp-side-sub">
                Confirming notifies the caregiver's console immediately. Emergency protocols remain on standby.
              </p>

              <div className="bp-rcpt">
                <div className="bp-rcpt__row">
                  <span>Selected window</span>
                  <strong>{chosenSlot?.time || 'Within 45 mins'}</strong>
                </div>
                <div className="bp-rcpt__row">
                  <span>Recipient</span>
                  <strong>{activePatient?.full_name || 'Patient'}</strong>
                </div>
                <div className="bp-rcpt__row bp-rcpt__row--total">
                  <span>Visit fee · pay after visit</span>
                  <strong>₹{fee}</strong>
                </div>
              </div>

              <button
                id="confirm-booking-btn"
                type="button"
                className="bp-btn bp-btn--ink bp-btn--lg"
                onClick={handleConfirm}
              >
                <CheckCircle2 size={19} />
                <span>{t('confirm_booking')} • ₹{fee}</span>
              </button>

              <p className="bp-trust">
                <ShieldCheck size={13} />
                <span>No payment now — settle directly with the provider after the visit.</span>
              </p>
            </section>
          ) : (
            <section className="bp-card bp-card--success">
              <div className="bp-shead">
                <span className="bp-scheck"><CheckCircle2 size={26} /></span>
                <div>
                  <h2 className="bp-sh2">Dispatch confirmed</h2>
                  <p>{t('caregiver_arriving')}</p>
                </div>
              </div>

              <div className="bp-sbody">
                <div className="bp-rcpt">
                  <div className="bp-rcpt__row">
                    <span>Dispatch window</span>
                    <strong>{chosenSlot?.time || 'Within 45 mins'}</strong>
                  </div>
                  <div className="bp-rcpt__row">
                    <span>Booking reference</span>
                    <code className="bp-code">{bookingRecord?.id || 'BK-DISPATCH-01'}</code>
                  </div>
                  <div className="bp-rcpt__row bp-rcpt__row--total">
                    <span>Amount due post-visit</span>
                    <strong>₹{fee}<em>UPI / Cash</em></strong>
                  </div>
                </div>

                <a href={`tel:${caregiver.phone || '9810011223'}`} className="bp-btn bp-btn--accent bp-btn--lg">
                  <Phone size={18} />
                  <span>Call Provider Directly <span className="bp-tel">({caregiver.phone || '98100 11223'})</span></span>
                </a>

                {/* Dispatch progression timeline */}
                <div className="bp-tl-wrap">
                  <span className="bp-tl-title">Dispatch progression</span>
                  <div className="bp-timeline" aria-hidden="true">
                    <div className="bp-tl-step done">
                      <span className="bp-tl-node"><Check size={12} strokeWidth={3.5} /></span>
                      <span className="bp-tl-lbl">Logged</span>
                    </div>
                    <span className="bp-tl-rail done" />
                    <div className="bp-tl-step done">
                      <span className="bp-tl-node"><Check size={12} strokeWidth={3.5} /></span>
                      <span className="bp-tl-lbl">Confirmed</span>
                    </div>
                    <span className="bp-tl-rail done" />
                    <div className="bp-tl-step live">
                      <span className="bp-tl-node"><span className="bp-tl-dot" /></span>
                      <span className="bp-tl-lbl">En Route</span>
                    </div>
                    <span className="bp-tl-rail" />
                    <div className="bp-tl-step">
                      <span className="bp-tl-node" />
                      <span className="bp-tl-lbl">Arrived</span>
                    </div>
                  </div>
                </div>

                {/* Sharing / reminders */}
                <div className="bp-duo">
                  <button type="button" className="bp-btn bp-btn--ghost" onClick={handleShare}>
                    <Share2 size={15} />
                    <span>Share Details</span>
                  </button>
                  <button
                    type="button"
                    className="bp-btn bp-btn--ghost"
                    onClick={() => alert('Calendar reminder registered!')}
                  >
                    <Bell size={15} />
                    <span>Calendar Alert</span>
                  </button>
                </div>

                {shareToast && (
                  <div className="bp-toast">
                    <CheckCircle2 size={14} />
                    <span>Dispatch notice copied to clipboard.</span>
                  </div>
                )}

                <button
                  id="goto-checkin-btn"
                  type="button"
                  className="bp-btn bp-btn--ink bp-btn--lg"
                  onClick={() => navigate(`/checkin/${bookingRecord?.id || 'live'}`)}
                >
                  <span>Launch Active Post-Booking Check-In</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};