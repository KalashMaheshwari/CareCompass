import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Clock,
  ShieldAlert,
  FlaskConical,
  UserCheck,
  HeartPulse,
  Check,
  Calendar,
  MapPin,
  Phone,
  X,
  FileText,
  CheckCheck,
  Award
} from 'lucide-react';
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
    matched_caregivers: [],
    recommended_tests: [],
    nurse_care_option: null
  };

  // Determine fallback tests and nurse care if not provided by backend
  const lowerInput = (triageData.user_input || '').toLowerCase();
  const isThroatSymptom = lowerInput.includes('throat') || lowerInput.includes('gala') || lowerInput.includes('cough') || lowerInput.includes('khansi') || lowerInput.includes('cold');

  const fallbackTests = isThroatSymptom ? [
    {
      test_name: 'CBC (Complete Blood Count)',
      why_needed: 'Doctors evaluate WBC and lymphocyte counts to differentiate between viral and bacterial throat infections before prescribing medicines.',
      sample_type: 'Blood Sample (Doorstep collection)',
      timing: 'Recommended before doctor consult or if persisting >48h',
      price: 299
    },
    {
      test_name: 'Throat Swab Culture / Strep Antigen Test',
      why_needed: 'Identifies Group A Streptococcus bacteria in the throat to confirm if antibiotics are medically required.',
      sample_type: 'Throat Swab (Doorstep collection)',
      timing: 'Recommended if severe pain or tonsil redness occurs',
      price: 499
    },
    {
      test_name: 'CRP (C-Reactive Protein)',
      why_needed: 'Measures the exact level of inflammation and infection in the throat and body.',
      sample_type: 'Blood Sample',
      timing: 'If fever or persistent discomfort is present',
      price: 399
    }
  ] : [
    {
      test_name: 'CBC & Platelet Count',
      why_needed: 'Monitors platelet levels and white blood cells to detect viral, dengue, or bacterial infection causes.',
      sample_type: 'Blood Sample (Doorstep collection)',
      timing: 'Recommended when fever or body aches develop',
      price: 299
    },
    {
      test_name: 'Dengue NS1 & Malarial Parasite Screen',
      why_needed: 'Early diagnostic screening to rule out seasonal viral or mosquito-borne fevers.',
      sample_type: 'Blood Sample',
      timing: 'If fever lasts more than 24 hours',
      price: 599
    },
    {
      test_name: 'Serum Electrolytes (Sodium, Potassium)',
      why_needed: 'Checks sodium and potassium levels to prevent dangerous dehydration from fatigue or fluid loss.',
      sample_type: 'Blood Sample',
      timing: 'Recommended for weakness or reduced oral intake',
      price: 349
    }
  ];

  const displayTests = (decision.recommended_tests && decision.recommended_tests.length > 0)
    ? decision.recommended_tests
    : fallbackTests;

  const fallbackNurseOption = {
    recommend: true,
    title: 'Book In-Person Personal Care Nurse Visit',
    badge: 'Certified Bedside Clinical Assessment',
    price: 499,
    why_beneficial: 'A certified personal care nurse visits the patient at home to record accurate clinical vitals (blood pressure, SpO2 pulse oximeter, temperature), perform a physical throat and chest examination, and prepare an objective report for the consulting doctor.',
    services: [
      'Comprehensive vitals check (BP, SpO2 oxygen, pulse rate, temperature)',
      'Physical throat inspection and chest auscultation (lung sounds)',
      'Assistance with doctor-prescribed medications or nebulization',
      'Objective clinical bedside handoff report for your physician'
    ]
  };

  const displayNurseOption = decision.nurse_care_option || fallbackNurseOption;

  // Pricing calculation helpers
  const getTestPrice = (test) => {
    if (!test) return 299;
    if (typeof test.price === 'number') return test.price;
    if (test.price && !isNaN(parseInt(test.price))) return parseInt(test.price);
    const name = (test.test_name || '').toLowerCase();
    if (name.includes('cbc') || name.includes('complete blood')) return 299;
    if (name.includes('throat') || name.includes('strep') || name.includes('swab')) return 499;
    if (name.includes('crp') || name.includes('reactive protein')) return 399;
    if (name.includes('dengue') || name.includes('malarial') || name.includes('malaria')) return 599;
    if (name.includes('electrolyte') || name.includes('sodium') || name.includes('potassium')) return 349;
    if (name.includes('sugar') || name.includes('glucose') || name.includes('hba1c')) return 399;
    return 299;
  };

  // Booking state
  const [showTestModal, setShowTestModal] = useState(false);
  const [showNurseModal, setShowNurseModal] = useState(false);

  const [selectedTests, setSelectedTests] = useState(displayTests.map(t => t.test_name));
  const [testSlot, setTestSlot] = useState('Tomorrow Morning Fasting (7:00 AM - 9:00 AM)');
  const [testAddress, setTestAddress] = useState('Sector 4, Rohini / Delhi NCR');
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testBookingData, setTestBookingData] = useState(null);

  const [nurseSlot, setNurseSlot] = useState('Immediate Dispatch (Within 45 mins)');
  const [nurseAddress, setNurseAddress] = useState('Sector 4, Rohini / Delhi NCR');
  const [nursePhone, setNursePhone] = useState('+91 98765 43210');
  const [nurseBookingData, setNurseBookingData] = useState(null);

  const totalTestPrice = displayTests.reduce((acc, t) => acc + getTestPrice(t), 0);
  const totalSelectedTestPrice = displayTests
    .filter(t => selectedTests.includes(t.test_name))
    .reduce((acc, t) => acc + getTestPrice(t), 0);
  const nursePrice = displayNurseOption.price || 499;

  // Determine whether patient is healthy / routine self-care
  const isHealthyOrRoutine = !decision.care_type ||
    decision.care_type === 'routine_monitoring' ||
    decision.care_type === 'self_care' ||
    (decision.reasoning && (
      decision.reasoning.toLowerCase().includes('no symptoms') ||
      decision.reasoning.toLowerCase().includes('fine') ||
      decision.reasoning.toLowerCase().includes('healthy') ||
      decision.reasoning.toLowerCase().includes('koi lakshan nahi')
    ));

  // Robust Next Steps normalization (handles array, string, or empty)
  const rawNextSteps = decision.next_steps || decision.nextSteps || [];
  const nextStepsList = Array.isArray(rawNextSteps)
    ? rawNextSteps
    : (typeof rawNextSteps === 'string' && rawNextSteps.trim() ? [rawNextSteps] : [
        'Continue to monitor your health. If any new symptoms arise, consider a GP teleconsult or visit a local clinic.'
      ]);

  // Robust Home Care normalization
  const rawHomeCare = decision.home_care || decision.homeCare || [];
  const homeCareList = Array.isArray(rawHomeCare)
    ? rawHomeCare
    : (typeof rawHomeCare === 'string' && rawHomeCare.trim() ? [rawHomeCare] : []);

  // Robust Warning Signs normalization
  const rawWarningSigns = decision.warning_signs || decision.warningSigns || [];
  const warningSignsList = Array.isArray(rawWarningSigns)
    ? rawWarningSigns
    : (typeof rawWarningSigns === 'string' && rawWarningSigns.trim() ? [rawWarningSigns] : []);

  const effectiveCareType = isHealthyOrRoutine ? 'routine_monitoring' : (decision.care_type || 'gp_teleconsult');
  const effectiveUrgency = isHealthyOrRoutine ? 'routine' : (decision.urgency || 'routine');

  const careTypeLabel = t(`care_types.${effectiveCareType}`) || (isHealthyOrRoutine ? 'Self-Care & Routine Health Monitoring' : 'Consult Healthcare Professional');
  const urgencyLabel = t(`urgency_levels.${effectiveUrgency}`) || 'Routine / Can wait a few days';

  const isImmediate = decision.urgency === 'immediate' || decision.care_type === 'emergency_referral';
  const spokenText = `${careTypeLabel}. ${urgencyLabel}. ${decision.reasoning || ''}`;

  useEffect(() => {
    autoSpeak(spokenText);
  }, [decision]);

  // Handle Lab Test confirmation
  const handleConfirmTestBooking = (e) => {
    if (e) e.preventDefault();
    const orderId = `LAB-${Math.floor(100000 + Math.random() * 900000)}`;
    setTestBookingData({
      orderId,
      tests: selectedTests.length > 0 ? selectedTests : displayTests.map(t => t.test_name),
      totalPrice: totalSelectedTestPrice,
      slot: testSlot,
      address: testAddress,
      phone: testPhone,
      phlebotomist: 'Ramesh Sharma (Thyrocare / Lal PathLabs Partner)',
      eta: '12-24 hours for digital report delivery'
    });
    setShowTestModal(false);
  };

  // Handle Nurse Visit confirmation
  const handleConfirmNurseBooking = (e) => {
    if (e) e.preventDefault();
    const orderId = `NURSE-${Math.floor(10000 + Math.random() * 90000)}`;
    setNurseBookingData({
      orderId,
      nurseName: 'Sister Anjali Verma, RN',
      phone: '+91 98100 11223',
      fee: nursePrice,
      slot: nurseSlot,
      address: nurseAddress,
      contact: nursePhone,
      arrivalEstimate: 'Within 45 minutes'
    });
    setShowNurseModal(false);
  };

  const toggleTestSelection = (testName) => {
    if (selectedTests.includes(testName)) {
      if (selectedTests.length > 1) {
        setSelectedTests(selectedTests.filter(t => t !== testName));
      }
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  return (
    <div className="two-col-grid" style={{ alignItems: 'start' }}>
      {/* LEFT COLUMN: Clinical Assessment Outcome */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="surface-card">
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="clinical-badge" style={{ background: '#e0f2fe', color: '#325292', fontWeight: 600 }}>
                {t('recommended_care')}
              </span>
              <span className="clinical-badge" style={{
                background: decision.backend_connected !== false ? '#edf4fe' : '#fefce8',
                color: decision.backend_connected !== false ? '#1b3560' : '#854d0e',
                border: decision.backend_connected !== false ? '1px solid #c8d9f0' : '1px solid #fef08a',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                {decision.backend_connected !== false ? t('ai_medical_guidance') : t('safety_net_offline')}
              </span>
              {activePatient && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {t('for_patient')} <strong>{activePatient.full_name}</strong> ({activePatient.relationship})
                </span>
              )}
            </div>
            <SpeakerButton text={spokenText} size={20} />
          </div>

          <div style={{ margin: '8px 0 16px 0' }}>
            <CareTypeHeadline careType={effectiveCareType} size="lg" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('how_soon_needed')}
            </span>
            <UrgencyBadge urgency={effectiveUrgency} />
          </div>

          <div style={{ background: 'var(--surface-muted)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              {t('why_recommended')}
            </strong>
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
              {decision.reasoning || (isHealthyOrRoutine ? 'User reports no symptoms and everything is fine. Continue routine monitoring.' : 'Clinical evaluation completed.')}
            </p>
          </div>

          {/* Dynamic Context Tag (if available) */}
          {decision.dynamic_context && (decision.dynamic_context.confirmed_symptoms?.length > 0 || decision.dynamic_context.ruled_out?.length > 0) && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
              {decision.dynamic_context.confirmed_symptoms?.length > 0 && (
                <span style={{ background: '#f0f9ff', color: '#325292', padding: '3px 10px', borderRadius: '999px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={13} />
                  <span>Identified: {decision.dynamic_context.confirmed_symptoms.join(', ')}</span>
                </span>
              )}
              {decision.dynamic_context.ruled_out?.length > 0 && (
                <span style={{ background: '#edf4fe', color: '#1b3560', padding: '3px 10px', borderRadius: '999px', border: '1px solid #c8d9f0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} color="#3f64ae" />
                  <span>Ruled out: {decision.dynamic_context.ruled_out.join(', ')}</span>
                </span>
              )}
            </div>
          )}

          {/* Actionable Practical Steps & Clinical Recommendations */}
          {nextStepsList.length > 0 && (
            <div style={{
              marginTop: '18px',
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1.5px solid #3f64ae',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3f64ae',
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: '#325292', display: 'block' }}>
                    {decision.care_type === 'emergency_referral' ? t('emergency_actions_heading') : t('practical_steps_heading')}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Actionable clinical next steps based on your evaluation
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nextStepsList.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: '#f0f9ff',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#3f64ae',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.94rem', color: '#0f172a', lineHeight: 1.55, fontWeight: 500 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Care Measures (if available) */}
          {homeCareList.length > 0 && (
            <div style={{ marginTop: '14px', background: '#f8fafc', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <HeartPulse size={18} color="#3f64ae" />
                <strong style={{ fontSize: '0.92rem', color: '#1b3560' }}>
                  Recommended Home Comfort & Soothing Care
                </strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {homeCareList.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Warning Signs (if available) */}
          {warningSignsList.length > 0 && (
            <div style={{ marginTop: '14px', background: '#fff1f2', padding: '14px 16px', borderRadius: '10px', border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={18} color="#e11d48" />
                <strong style={{ fontSize: '0.9rem', color: '#9f1239' }}>
                  Critical Warning Signs (Red Flags to Watch For)
                </strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {warningSignsList.map((sign, idx) => (
                  <li key={idx} style={{ fontSize: '0.86rem', color: '#881337', lineHeight: 1.45 }}>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Safety Precaution Note */}
          {decision.care_type !== 'emergency_referral' && (
            <div style={{ marginTop: '14px', background: '#fefce8', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a', display: 'flex', alignItems: 'start', gap: '10px' }}>
              <AlertTriangle size={18} color="#ca8a04" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#854d0e', lineHeight: 1.48 }}>
                <strong>{t('medical_precaution_title')}</strong> {t('medical_precaution_body')}
              </div>
            </div>
          )}
        </div>

        {/* 1. DOCTOR-RECOMMENDED DIAGNOSTIC LAB TESTS CARD */}
        <div className="surface-card" style={{ border: '1px solid #d4e0ee', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3f64ae',
                flexShrink: 0
              }}>
                <FlaskConical size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.08rem', color: '#325292', fontWeight: 700 }}>
                  {t('recommended_tests_title')}
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                  {t('recommended_tests_subtitle')}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                background: '#3f64ae',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                whiteSpace: 'nowrap'
              }}>
                Package: ₹{totalTestPrice}
              </span>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                background: '#edf4fe',
                color: '#1b3560',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid #c8d9f0',
                whiteSpace: 'nowrap'
              }}>
                Free Doorstep Pickup
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {displayTests.map((test, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>
                    {test.test_name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {test.sample_type && (
                      <span style={{
                        fontSize: '0.74rem',
                        background: '#edf4fe',
                        color: '#1b3560',
                        border: '1px solid #c8d9f0',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        <FlaskConical size={12} color="#3f64ae" />
                        <span>{test.sample_type}</span>
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: '#3f64ae',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      ₹{getTestPrice(test)}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.45 }}>
                  <strong style={{ color: '#325292' }}>Doctor rationale:</strong> {test.why_needed}
                </p>
                {test.timing && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{t('timing_label')} <strong>{test.timing}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Booking Action / Confirmed Status */}
          <div style={{ marginTop: '16px' }}>
            {testBookingData ? (
              <div style={{
                background: '#edf4fe',
                border: '1px solid #c8d9f0',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b3560', fontWeight: 700, fontSize: '0.94rem', marginBottom: '6px' }}>
                  <CheckCheck size={20} color="#3f64ae" />
                  <span>At-Home Sample Collection Confirmed! (Ref: {testBookingData.orderId})</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#2d4261', lineHeight: 1.5 }}>
                  <div><strong>Total Amount:</strong> ₹{testBookingData.totalPrice || totalTestPrice} (Pay on Doorstep via UPI / Cash)</div>
                  <div><strong>Phlebotomist Assigned:</strong> {testBookingData.phlebotomist}</div>
                  <div><strong>Collection Slot:</strong> {testBookingData.slot}</div>
                  <div><strong>Address:</strong> {testBookingData.address}</div>
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#1b3560', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#3f64ae" />
                    <span>NABL Accredited Partner Lab · Digital reports delivered within 12-24 hours via WhatsApp.</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setShowTestModal(true)}
                style={{
                  background: '#3f64ae',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px'
                }}
              >
                <FlaskConical size={18} />
                <span>{t('book_test_btn')} • ₹{totalTestPrice}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 2. PERSONAL CARE NURSE RECOMMENDATION CARD */}
        <div className="surface-card" style={{ border: '1px solid #d4e0ee', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#edf4fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3f64ae',
                flexShrink: 0
              }}>
                <Stethoscope size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.08rem', color: '#101e33', fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif" }}>
                  {displayNurseOption.title || t('nurse_care_title')}
                </h4>
                <span style={{ fontSize: '0.76rem', color: '#3f64ae', fontWeight: 600 }}>
                  {displayNurseOption.badge || 'Certified In-Person Clinical Assessment'}
                </span>
              </div>
            </div>

            {/* Price Tag Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#1b3560',
                background: '#edf4fe',
                border: '1.5px solid #c8d9f0',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap'
              }}>
                ₹{nursePrice} <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#3f64ae' }}>/ Visit</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#3f64ae', fontWeight: 600 }}>All-inclusive bedside check</span>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: '0 0 12px 0' }}>
            {displayNurseOption.why_beneficial || t('nurse_care_subtitle')}
          </p>

          {displayNurseOption.services && displayNurseOption.services.length > 0 && (
            <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                {t('nurse_included_services')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {displayNurseOption.services.map((srv, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#1e293b' }}>
                    <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nurse Booking Action / Confirmed Status */}
          {nurseBookingData ? (
            <div style={{
              background: '#edf4fe',
              border: '1px solid #c8d9f0',
              borderRadius: '10px',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b3560', fontWeight: 700, fontSize: '0.94rem', marginBottom: '6px' }}>
                <CheckCheck size={20} color="#3f64ae" />
                <span>Personal Care Nurse Dispatched! (Ref: {nurseBookingData.orderId})</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#2d4261', lineHeight: 1.5 }}>
                <div><strong>Visit Fee:</strong> ₹{nurseBookingData.fee || nursePrice} (Payable to nurse via Cash/UPI after visit)</div>
                <div><strong>Assigned Nurse:</strong> {nurseBookingData.nurseName} ({nurseBookingData.phone})</div>
                <div><strong>Arrival Window:</strong> {nurseBookingData.slot} ({nurseBookingData.arrivalEstimate})</div>
                <div><strong>Patient Address:</strong> {nurseBookingData.address}</div>
                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#1b3560', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#3f64ae" />
                  <span>In-home vitals kit, SpO2 monitor &amp; physical exam tools equipped. Live SMS alert dispatched to family contact.</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setShowNurseModal(true)}
                style={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#3f64ae'
                }}
              >
                <UserCheck size={18} />
                <span>{t('book_nurse_btn')} • ₹{nursePrice}</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => navigate('/caregivers')}
                style={{ fontSize: '0.84rem', padding: '8px' }}
              >
                Browse All Qualified Nurses in Directory (₹499)
              </button>
            </div>
          )}
        </div>

        {/* Safety-Net Advisory Box */}
        <SafetyNetBox />
      </div>

      {/* RIGHT COLUMN: Dispatch & Action Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="surface-card">
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.25rem', marginBottom: '6px', color: '#101e33' }}>{t('what_to_do_next')}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            {isImmediate
              ? t('emergency_screen_subtitle')
              : (isHealthyOrRoutine
                  ? 'Your assessment indicates a stable, healthy condition with no acute symptoms reported.'
                  : t('caregiver_assist_text'))}
          </p>

          {isImmediate ? (
            <button
              type="button"
              className="btn btn-danger btn-block btn-lg"
              onClick={() => navigate('/emergency')}
            >
              <span>{t('emergency_call_112')}</span>
              <ArrowRight size={20} />
            </button>
          ) : isHealthyOrRoutine ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: '#edf4fe',
                border: '1px solid #c8d9f0',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#1b3560',
                fontSize: '0.88rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={20} color="#3f64ae" style={{ flexShrink: 0 }} />
                <span>Health Status Normal · Self-Monitoring Recommended</span>
              </div>
              <button
                id="find-caregivers-btn"
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => navigate('/caregivers')}
                style={{ fontSize: '0.88rem' }}
              >
                <span>Consult a Doctor Online Anyway</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                id="find-caregivers-btn"
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={() => navigate('/caregivers')}
              >
                <span>{t('find_caregiver_btn')}</span>
                <ArrowRight size={20} />
              </button>

              {/* Quick Action Buttons for Diagnostic Testing & Nurse Booking */}
              {!testBookingData && (
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => setShowTestModal(true)}
                  style={{
                    borderColor: '#3f64ae',
                    color: '#3f64ae',
                    background: '#ffffff',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.88rem'
                  }}
                >
                  <FlaskConical size={16} />
                  <span>Book Recommended Lab Tests</span>
                </button>
              )}

              {!nurseBookingData && (
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => setShowNurseModal(true)}
                  style={{
                    borderColor: '#059669',
                    color: '#059669',
                    background: '#ffffff',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.88rem'
                  }}
                >
                  <UserCheck size={16} />
                  <span>Schedule Nurse Home Visit</span>
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {t('your_symptoms')} <strong style={{ color: 'var(--text-primary)' }}>"{triageData.user_input}"</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('reference_id')} <code style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>CC-{(triageData.sessionId || '101').replace(/[^0-9]/g, '').slice(-6) || '849201'}</code>
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: decision.backend_connected !== false ? '#166534' : '#854d0e',
              background: decision.backend_connected !== false ? '#f0fdf4' : '#fefce8',
              padding: '8px 12px',
              borderRadius: '6px',
              border: decision.backend_connected !== false ? '1px solid #bbf7d0' : '1px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color={decision.backend_connected !== false ? '#16a34a' : '#ca8a04'} />
              <span>
                {decision.backend_connected !== false
                  ? t('assessed_with_ai')
                  : t('assessed_with_offline')}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate('/')}
            >
              <RotateCcw size={14} />
              <span>{t('restart_assessment')}</span>
            </button>
          </div>
        </div>

        {/* Verification Summary */}
        <div className="surface-card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 600, fontSize: '0.86rem', marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>{t('dpdp_compliant')}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
            {t('audit_note')}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: BOOK DIAGNOSTIC LAB TESTS MODAL                       */}
      {/* ------------------------------------------------------------- */}
      {showTestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlaskConical size={24} color="#3f64ae" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Book At-Home Diagnostic Testing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              A certified phlebotomist from an accredited partner lab (Thyrocare / Dr Lal) will visit your home for sterile sample collection. Reports will be provided digitally to your doctor.
            </p>

            <form onSubmit={handleConfirmTestBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Select Diagnostic Tests to Include:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {displayTests.map((tItem, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleTestSelection(tItem.test_name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: selectedTests.includes(tItem.test_name) ? '1.5px solid #3f64ae' : '1px solid #cbd5e1',
                        background: selectedTests.includes(tItem.test_name) ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                          {tItem.test_name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {tItem.sample_type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#3f64ae',
                          background: '#e0f2fe',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          ₹{getTestPrice(tItem)}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedTests.includes(tItem.test_name)}
                          onChange={() => {}}
                          style={{ width: '18px', height: '18px', accentColor: '#3f64ae' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Doorstep Collection Slot:
                </label>
                <select
                  value={testSlot}
                  onChange={(e) => setTestSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Today Evening (4:00 PM - 6:00 PM)">Today Evening (4:00 PM - 6:00 PM)</option>
                  <option value="Tomorrow Morning Fasting (7:00 AM - 9:00 AM)">Tomorrow Morning Fasting (7:00 AM - 9:00 AM)</option>
                  <option value="Tomorrow Afternoon (12:00 PM - 2:00 PM)">Tomorrow Afternoon (12:00 PM - 2:00 PM)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Doorstep Visit Address:
                </label>
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  placeholder="Enter house/flat number, sector, city"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Contact Phone Number (for phlebotomist coordination):
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              {/* Price Breakdown Summary */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Tests Selected ({selectedTests.length}):</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{totalSelectedTestPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Doorstep Phlebotomist Visit:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>FREE</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: '6px',
                  marginTop: '2px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#0f172a'
                }}>
                  <span>Total Amount (Pay on sample collection):</span>
                  <span style={{ color: '#3f64ae', fontSize: '1rem' }}>₹{totalSelectedTestPrice}</span>
                </div>
              </div>

              <div style={{ background: '#edf4fe', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#1b3560', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#3f64ae" />
                <span>Sterile collection kits used · 100% digital payment on collection · Free doorstep pickup.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTestModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#3f64ae' }}
                >
                  Confirm Lab Booking • Pay ₹{totalSelectedTestPrice}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: BOOK PERSONAL CARE NURSE VISIT MODAL                 */}
      {/* ------------------------------------------------------------- */}
      {showNurseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Stethoscope size={24} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Book Personal Care Nurse Visit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNurseModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nurse Profile Snippet */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#edf4fe',
                  color: '#3f64ae',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  AV
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                    Sister Anjali Verma, RN
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    B.Sc Nursing · 8+ yrs experience · Rating 4.9/5 (140+ visits)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#3f64ae', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#3f64ae" />
                    <span>2.4 km away · Sector 4, Rohini · Available for Immediate Dispatch</span>
                  </div>
                </div>
              </div>
              <div style={{
                background: '#edf4fe',
                border: '1px solid #c8d9f0',
                borderRadius: '8px',
                padding: '6px 12px',
                textAlign: 'right',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b3560' }}>₹{nursePrice}</div>
                <div style={{ fontSize: '0.7rem', color: '#3f64ae', fontWeight: 600 }}>Per Home Visit</div>
              </div>
            </div>

            <form onSubmit={handleConfirmNurseBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Visit Scheduled Slot:
                </label>
                <select
                  value={nurseSlot}
                  onChange={(e) => setNurseSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Immediate Dispatch (Within 45 mins)">Immediate Dispatch (Within 45 mins)</option>
                  <option value="Today, 4:30 PM - 5:30 PM">Today, 4:30 PM - 5:30 PM</option>
                  <option value="Today, 6:00 PM - 7:00 PM">Today, 6:00 PM - 7:00 PM</option>
                  <option value="Tomorrow Morning, 9:00 AM">Tomorrow Morning, 9:00 AM</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Patient Home Address:
                </label>
                <input
                  type="text"
                  value={nurseAddress}
                  onChange={(e) => setNurseAddress(e.target.value)}
                  placeholder="Enter house/flat number, sector, city"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Emergency Contact Phone Number:
                </label>
                <input
                  type="tel"
                  value={nursePhone}
                  onChange={(e) => setNursePhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              {/* Nurse Fee Summary */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.84rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Clinical Home Visit Fee</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>No advance needed • Pay via UPI/Cash after checkup</div>
                </div>
                <div style={{ fontWeight: 800, color: '#3f64ae', fontSize: '1.1rem' }}>
                  ₹{nursePrice}
                </div>
              </div>

              <div style={{ background: '#edf4fe', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#1b3560', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#3f64ae" />
                <span>Includes BP, SpO2, temp monitoring, throat &amp; lung check, medication support, and detailed clinical report for your doctor.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNurseModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, background: '#3f64ae' }}
                >
                  Confirm Nurse Home Visit • ₹{nursePrice}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
