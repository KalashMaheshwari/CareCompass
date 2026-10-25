import React, { useState, useMemo } from 'react';
import {
  UserCheck, MapPin, Clock, Languages, Award, ChevronRight, Phone, Video,
  X, ShieldCheck, Star, Filter, CheckCircle2, Activity, FileText, Sparkles,
  ArrowRight, Search, SlidersHorizontal, Stethoscope, AlertCircle, HeartPulse,
  BadgeCheck, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CaregiversPage = () => {
  const {
    t,
    triageData,
    setSelectedCaregiver,
    navigate,
    activePatient
  } = useApp();

  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);

  const rawCaregivers = triageData.latest_response?.matched_caregivers || [];

  const defaultNurses = [
    {
      caregiver_id: 'cg-uuid-014',
      caregiver_code: 'CG_014',
      full_name: 'Anjali Verma, RN',
      title: 'Senior Clinical Staff Nurse',
      council_reg: 'DNC-RN-88219',
      experience_years: 7,
      phone: '+91 98100 11223',
      care_types: ['nurse', 'vitals_monitoring', 'medication_support'],
      languages: ['Hindi', 'English', 'Hinglish'],
      score: 0.98,
      distance_km: '2.4',
      next_slot: 'Within 35-45 mins',
      rating: 4.95,
      review_count: 142,
      price: 499,
      equipment: ['Digital & Manual BP Sphygmomanometer', 'Pediatric/Adult Pulse Oximeter', 'Blood Glucose Monitor', 'Sterile Dressing Kit', 'Digital Thermometer'],
      background_verified: '2026-03-12 (DPDP & Police Clearance Verified)',
      reason: 'Ranked #1 for physical assessment, rapid 2.4 km response window, and certified vitals baseline evaluation.'
    },
    {
      caregiver_id: 'cg-uuid-008',
      caregiver_code: 'CG_008',
      full_name: 'Rajesh Kumar, EMT-P',
      title: 'Emergency Paramedic & Staff Responder',
      council_reg: 'DEL-EMT-44102',
      experience_years: 9,
      phone: '+91 98111 88776',
      care_types: ['paramedic_home_visit', 'emergency_triage', 'nurse'],
      languages: ['Hindi', 'Hinglish', 'Punjabi'],
      score: 0.94,
      distance_km: '3.1',
      next_slot: 'Today, 4:30 PM',
      rating: 4.88,
      review_count: 98,
      price: 499,
      equipment: ['Portable Automated External Defibrillator (AED)', 'Oxygen Resuscitator Kit', 'Multi-lead ECG Monitor', 'Splints & Trauma Pack'],
      background_verified: '2026-02-28 (DPDP & Police Clearance Verified)',
      reason: 'Certified in emergency stabilization, cardiac rhythm tracking, and home paramedic triage.'
    },
    {
      caregiver_id: 'cg-uuid-021',
      caregiver_code: 'CG_021',
      full_name: 'Sister Preeti Sharma, B.Sc RN',
      title: 'Post-Operative & Geriatric Care Specialist',
      council_reg: 'HNC-RN-51290',
      experience_years: 11,
      phone: '+91 98222 33445',
      care_types: ['nurse', 'elderly_care', 'wound_care'],
      languages: ['Hindi', 'English'],
      score: 0.92,
      distance_km: '4.2',
      next_slot: 'Today, 5:15 PM',
      rating: 4.91,
      review_count: 176,
      price: 549,
      equipment: ['Advanced Wound Care Dressing Pack', 'Catheter Maintenance Kit', 'O2 Concentrator Inspection Gear', 'Vitals Suite'],
      background_verified: '2026-01-15 (DPDP & Police Clearance Verified)',
      reason: 'Specialized in gentle home care, senior mobility support, and post-discharge symptom monitoring.'
    },
    {
      caregiver_id: 'cg-uuid-033',
      caregiver_code: 'CG_033',
      full_name: 'Dr. Vikram Malhotra, MBBS (Standby CMO)',
      title: 'Consulting Home Physician & Triage Lead',
      council_reg: 'MCI-REG-39014',
      experience_years: 14,
      phone: '+91 98333 44556',
      care_types: ['physician_triage', 'teleconsult', 'nurse'],
      languages: ['English', 'Hindi', 'Urdu'],
      score: 0.89,
      distance_km: '5.0',
      next_slot: 'Within 60 mins',
      rating: 4.97,
      review_count: 210,
      price: 699,
      equipment: ['Complete Diagnostic Medical Bag', 'Stethoscope (Acoustic & Digital)', 'Neurological Reflex Kit', 'Rapid Diagnostic Strips'],
      background_verified: '2026-03-01 (MCI Medical License Verified)',
      reason: 'Available for advanced in-home clinical assessments and simultaneous tele-escalation coordination.'
    }
  ];

  const caregivers = rawCaregivers.length > 0 ? rawCaregivers : defaultNurses;

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((cg) => {
      const matchesType =
        filterType === 'all' ||
        (filterType === 'nurse' && (cg.care_types || []).some(t => t.toLowerCase().includes('nurse') || t.toLowerCase().includes('care'))) ||
        (filterType === 'paramedic' && (cg.care_types || []).some(t => t.toLowerCase().includes('paramedic') || t.toLowerCase().includes('emergency'))) ||
        (filterType === 'rapid' && (cg.next_slot?.toLowerCase().includes('mins') || parseFloat(cg.distance_km || '5') <= 3.0));

      const matchesSearch =
        searchQuery.trim() === '' ||
        cg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cg.languages || []).some(l => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cg.reason?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [caregivers, filterType, searchQuery]);

  const topMatch = filteredCaregivers[0] || caregivers[0];
  const alternatives = filteredCaregivers.filter(cg => (cg.caregiver_id || cg.caregiver_code) !== (topMatch?.caregiver_id || topMatch?.caregiver_code));

  const handleSelectCaregiver = (cg) => {
    setSelectedCaregiver(cg);
    navigate(`/booking/${cg.caregiver_id || cg.caregiver_code}`);
  };

  const getInitials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const triageUrgency = triageData.latest_response?.urgency || 'MODERATE';
  const triageRecommendation = triageData.latest_response?.care_type || 'Personal Care Nurse';

  if (caregivers.length === 0) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: '24px', border: '1px solid #e8e4da', boxShadow: '0 20px 40px -20px rgba(28,36,32,0.08)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', marginBottom: '10px', color: '#1c2420' }}>
          No In-Person Caregiver Available Immediately
        </h3>
        <p style={{ fontSize: '0.94rem', color: '#48544e', lineHeight: 1.6, marginBottom: '26px' }}>
          All in-person mobile care units in your sector are actively responding to ongoing clinical visits. You can connect with our on-call medical teleconsultation desk right now.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', background: '#3f64ae', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/booking/teleconsult')}
          >
            <Video size={18} />
            <span>Connect to GP Teleconsult</span>
          </button>
          <a
            href="tel:112"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', background: '#edf3fa', color: '#101e33', border: '1px solid #d4e0ee', textDecoration: 'none', fontWeight: 600 }}
          >
            <Phone size={18} />
            <span>Emergency Dispatch (112)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cg-page">
      <style>{`
        .cg-page {
          --cg-ink: #101e33;
          --cg-ink-2: #2d4261;
          --cg-muted: #577094;
          --cg-faint: #8ca2c0;
          --cg-line: #d2e0f0;
          --cg-line-2: #bdd1ea;
          --cg-tint: #edf3fa;
          --cg-accent: #3f64ae;
          --cg-accent-deep: #1b3560;
          --cg-accent-vibrant: #2968db;
          --cg-accent-soft: #edf4fe;
          --cg-gold: #b45309;
          --cg-gold-soft: #fef3c7;
          --cg-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--cg-ink);
          -webkit-font-smoothing: antialiased;
        }

        @keyframes cg-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes cg-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.78); } }

        /* ---------- Breadcrumbs & Top Meta ---------- */
        .cg-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--cg-line);
          animation: cg-rise .4s ease both;
        }
        .cg-journey {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .cg-step {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--cg-faint);
        }
        .cg-step.done {
          color: var(--cg-ink-2);
        }
        .cg-step.active {
          color: var(--cg-accent);
        }
        .cg-step-sep {
          width: 18px;
          height: 1px;
          background: var(--cg-line-2);
        }

        /* ---------- Main Title Block ---------- */
        .cg-header {
          margin-bottom: 28px;
          animation: cg-rise .5s ease both;
        }
        .cg-overline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--cg-accent);
          margin-bottom: 10px;
        }
        .cg-overline::before {
          content: '';
          width: 22px;
          height: 2px;
          border-radius: 2px;
          background: var(--cg-accent);
        }
        .cg-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 34px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -.02em;
          margin: 0 0 10px;
          color: var(--cg-ink);
        }
        .cg-sub {
          font-size: 15px;
          line-height: 1.6;
          color: var(--cg-ink-2);
          max-width: 68ch;
          margin: 0;
        }

        /* ---------- Triage Context Pill ---------- */
        .cg-triage-context {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #edf4fe;
          border: 1px solid #c8d9f0;
          border-radius: 14px;
          padding: 12px 18px;
          margin-bottom: 26px;
          font-size: 13px;
          color: #1b3560;
          animation: cg-rise .55s ease both;
        }

        /* ---------- Controls (Filter & Search) ---------- */
        .cg-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cg-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cg-filter-pill {
          background: #ffffff;
          border: 1px solid var(--cg-line);
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--cg-ink-2);
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .cg-filter-pill:hover {
          border-color: var(--cg-line-2);
          background: var(--cg-tint);
        }
        .cg-filter-pill.active {
          background: #3f64ae;
          color: #ffffff;
          border-color: #3f64ae;
        }
        .cg-search-box {
          position: relative;
          min-width: 240px;
        }
        .cg-search-box input {
          width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid var(--cg-line);
          border-radius: 999px;
          padding: 8px 16px 8px 36px;
          font-size: 13px;
          outline: none;
          color: var(--cg-ink);
          transition: border-color 0.15s ease;
        }
        .cg-search-box input:focus {
          border-color: var(--cg-accent);
        }
        .cg-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--cg-muted);
          pointer-events: none;
        }

        /* ---------- Top Match Hero Card ---------- */
        .cg-hero-card {
          background: #ffffff;
          border: 1px solid #d4e0ee;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 36px;
          position: relative;
          overflow: hidden;
          animation: cg-rise .6s ease both;
        }
        .cg-hero-rank {
          position: absolute;
          top: 24px;
          right: 28px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--cg-accent);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .cg-hero-main {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }
        .cg-hero-avatar {
          width: 76px;
          height: 76px;
          border-radius: 20px;
          background: #3f64ae;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 28px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .cg-hero-content {
          flex: 1;
          min-width: 320px;
        }
        .cg-hero-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .cg-badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #edf3fc;
          color: #2e4d8a;
          border: 1px solid #bfdbfe;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .cg-badge-reg {
          font-family: var(--cg-mono);
          font-size: 11px;
          color: var(--cg-muted);
          background: #ffffff;
          border: 1px solid var(--cg-line);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .cg-hero-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -.015em;
          margin: 0 0 4px;
          color: var(--cg-ink);
        }
        .cg-hero-title {
          font-size: 14px;
          color: var(--cg-ink-2);
          margin: 0 0 16px;
        }
        .cg-hero-telemetry {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid rgba(63, 100, 174, 0.15);
          border-bottom: 1px solid rgba(63, 100, 174, 0.15);
          margin-bottom: 18px;
        }
        .cg-tele-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .cg-tele-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--cg-faint);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .cg-tele-value {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--cg-ink);
        }
        .cg-tele-value.mono {
          font-family: var(--cg-mono);
          font-size: 13.5px;
        }
        .cg-tele-value.accent {
          color: var(--cg-accent);
          font-size: 16px;
        }
        .cg-hero-rationale {
          background: #ffffff;
          border: 1px solid #dbe6f7;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 22px;
          font-size: 13px;
          line-height: 1.55;
          color: #1e293b;
        }
        .cg-hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cg-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #3f64ae;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .cg-btn-primary:hover {
          background: #34579d;
          transform: translateY(-1px);
        }
        .cg-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #ffffff;
          color: var(--cg-ink);
          border: 1.5px solid var(--cg-line-2);
          padding: 11px 20px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cg-btn-secondary:hover {
          background: var(--cg-tint);
          border-color: var(--cg-muted);
        }

        /* ---------- Standby Alternatives Grid ---------- */
        .cg-grid-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .cg-grid-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 21px;
          font-weight: 600;
          margin: 0;
          color: var(--cg-ink);
        }
        .cg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 20px;
          margin-bottom: 48px;
        }
        .cg-card {
          background: #ffffff;
          border: 1px solid var(--cg-line);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 1px 2px rgba(28, 36, 32, .04), 0 10px 24px -16px rgba(28, 36, 32, .08);
          animation: cg-rise .65s ease both;
        }
        .cg-card:hover {
          border-color: var(--cg-accent);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px -8px rgba(63, 100, 174, 0.14);
        }
        .cg-card-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }
        .cg-avatar-sm {
          width: 50px;
          height: 50px;
          border-radius: 15px;
          background: var(--cg-accent-soft);
          color: var(--cg-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .cg-card-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 2px;
          color: var(--cg-ink);
        }
        .cg-card-title {
          font-size: 12px;
          color: var(--cg-muted);
          margin-bottom: 4px;
        }
        .cg-card-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0;
        }
        .cg-spec-chip {
          background: var(--cg-tint);
          border: 1px solid var(--cg-line);
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 11px;
          color: var(--cg-ink-2);
          font-weight: 500;
        }
        .cg-card-reason {
          font-size: 12.5px;
          color: var(--cg-ink-2);
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cg-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--cg-line);
        }
        .cg-card-price {
          font-family: var(--cg-mono);
          font-size: 15px;
          font-weight: 700;
          color: var(--cg-ink);
        }
        .cg-card-price span {
          font-size: 10px;
          color: var(--cg-muted);
          font-weight: 500;
          display: block;
        }

        /* ---------- Dossier Modal ---------- */
        .cg-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: cg-rise 0.2s ease;
        }
        .cg-modal-box {
          background: #ffffff;
          border-radius: 24px;
          max-width: 580px;
          width: 100%;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid var(--cg-line);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        .cg-modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--cg-line);
          background: var(--cg-tint);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--cg-ink-2);
          transition: all 0.15s ease;
        }
        .cg-modal-close:hover {
          background: #ffffff;
          border-color: var(--cg-ink);
          color: var(--cg-ink);
        }

        /* Mobile Phone Layout Downscale & Spacious Hierarchy */
        @media (max-width: 768px) {
          .cg-page { padding: 0; }
          .cg-topbar { display: none !important; } /* Hide empty breadcrumb container completely on mobile */
          .cg-journey { display: none !important; }
          
          .cg-header { margin-bottom: 10px; }
          .cg-overline { font-size: 8.5px; letter-spacing: .12em; margin-bottom: 2px; }
          .cg-title { font-size: 18px; line-height: 1.22; margin-bottom: 3px; }
          .cg-sub { font-size: 11px; line-height: 1.35; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          
          /* Compact Single-Row Triage Context Strip */
          .cg-triage-context {
            padding: 7px 11px !important;
            border-radius: 10px !important;
            margin-bottom: 12px !important;
            font-size: 11.5px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: #edf4fe !important;
            border: 1px solid #d4e3f8 !important;
          }
          .cg-triage-lead { display: none !important; }
          .cg-triage-rec { display: none !important; }
          .cg-triage-protocol { display: none !important; }
          
          /* Controls: Single Swiping Filter Row + Compact Search */
          .cg-controls { flex-direction: column; align-items: stretch; gap: 7px; margin-bottom: 14px; }
          .cg-filters {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 2px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .cg-filters::-webkit-scrollbar { display: none; }
          .cg-filter-pill {
            padding: 5px 12px;
            font-size: 11.5px;
            white-space: nowrap;
            flex-shrink: 0;
            border-radius: 9999px;
          }
          .cg-search-box { width: 100%; min-width: 0; }
          .cg-search-box input { height: 35px; font-size: 12px; padding: 6px 12px 6px 34px; border-radius: 9999px; }
          
          /* Uncluttered Top Match Hero Card */
          .cg-hero-card {
            padding: 14px 13px 14px 13px !important;
            border-radius: 16px !important;
            margin-bottom: 16px !important;
            border: 1.5px solid #c9daf1 !important;
            box-shadow: 0 4px 16px rgba(16, 30, 51, 0.06) !important;
          }
          .cg-hero-rank {
            position: static !important;
            display: inline-flex !important;
            align-items: center !important;
            width: fit-content !important;
            font-size: 9.5px !important;
            font-weight: 700 !important;
            padding: 3px 9px !important;
            border-radius: 9999px !important;
            letter-spacing: .04em !important;
            gap: 4px !important;
            margin-bottom: 10px !important;
            background: #3f64ae !important;
            color: #ffffff !important;
          }
          .cg-hero-rank svg { width: 11px !important; height: 11px !important; }
          
          .cg-hero-main {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            flex-wrap: nowrap !important;
          }
          .cg-hero-avatar {
            width: 46px !important;
            height: 46px !important;
            font-size: 16px !important;
            border-radius: 12px !important;
            flex-shrink: 0 !important;
            margin-top: 2px !important;
          }
          .cg-hero-content {
            min-width: 0 !important;
            flex: 1 !important;
            width: 100% !important;
          }
          .cg-hero-badges {
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
            flex-wrap: wrap !important;
            margin-bottom: 4px !important;
            padding-right: 0 !important; /* Full width now that rank badge is static header */
          }
          .cg-badge-verified {
            font-size: 9.5px !important;
            padding: 2px 6px !important;
            border-radius: 5px !important;
            gap: 3px !important;
          }
          .cg-badge-verified svg { width: 11px !important; height: 11px !important; }
          .cg-badge-reg {
            display: none !important; /* Hide technical internal ID to eliminate mobile clutter */
          }
          .cg-hero-name {
            font-size: 16.5px !important;
            line-height: 1.22 !important;
            margin: 0 0 2px 0 !important;
          }
          .cg-hero-title {
            font-size: 11px !important;
            color: #4a6385 !important;
            line-height: 1.35 !important;
            margin-bottom: 8px !important;
          }
          
          /* Compact 2x2 Telemetry Grid */
          .cg-hero-telemetry {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px 10px !important;
            padding: 8px 10px !important;
            background: #f8fafc !important;
            border: 1px solid #e2eaf4 !important;
            border-radius: 10px !important;
            margin: 8px 0 10px 0 !important;
          }
          .cg-tele-item { gap: 1px !important; }
          .cg-tele-label {
            font-size: 8.5px !important;
            letter-spacing: .06em !important;
            color: #64748b !important;
            gap: 3px !important;
          }
          .cg-tele-label svg { width: 10px !important; height: 10px !important; }
          .cg-tele-value {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #0b1e3b !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .cg-tele-value.accent {
            color: #3f64ae !important;
            font-size: 13.5px !important;
            font-weight: 700 !important;
          }
          
          .cg-hero-rationale {
            padding: 7px 10px !important;
            font-size: 10.5px !important;
            line-height: 1.38 !important;
            color: #334155 !important;
            background: #edf4fe !important;
            border: 1px solid #d4e3f8 !important;
            border-radius: 8px !important;
            margin-bottom: 10px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          
          .cg-hero-actions {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .cg-btn-primary {
            width: 100% !important;
            height: 38px !important;
            font-size: 12.5px !important;
            font-weight: 700 !important;
            border-radius: 9px !important;
            justify-content: center !important;
            padding: 0 12px !important;
          }
          .cg-btn-secondary {
            width: 100% !important;
            height: 30px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            justify-content: center !important;
            background: transparent !important;
            border: 1px solid #d4e0ee !important;
            color: #4a6385 !important;
            padding: 0 10px !important;
          }
          
          /* Uncluttered Alternative Standby Cards */
          .cg-grid-head { margin: 16px 0 8px 0 !important; }
          .cg-grid-title { font-size: 15px !important; }
          .cg-grid { grid-template-columns: 1fr !important; gap: 10px !important; margin-bottom: 24px !important; }
          .cg-card {
            padding: 12px 12px 10px 12px !important;
            border-radius: 14px !important;
            border: 1px solid #dbe6f2 !important;
            box-shadow: 0 1px 4px rgba(16, 30, 51, 0.04) !important;
          }
          .cg-card-top { margin-bottom: 6px !important; gap: 10px !important; }
          .cg-avatar-sm { width: 38px !important; height: 38px !important; font-size: 14px !important; border-radius: 10px !important; }
          .cg-card-name { font-size: 15px !important; margin-bottom: 1px !important; }
          .cg-card-title { font-size: 11px !important; margin-bottom: 2px !important; }
          .cg-card-specs { gap: 5px !important; margin: 6px 0 !important; }
          .cg-spec-chip { font-size: 10.5px !important; padding: 2.5px 7px !important; }
          .cg-card-reason { display: none !important; } /* Eliminates cluttered paragraph text on mobile! */
          .cg-card-footer { padding-top: 8px !important; margin-top: 4px !important; border-top: 1px solid #edf2f7 !important; }
          .cg-card-price { font-size: 14px !important; }
          .cg-card-price span { font-size: 9px !important; }
          
          .cg-modal-box { padding: 18px 14px !important; border-radius: 16px !important; max-width: 94vw !important; }
        }
      `}</style>

      {/* Top Breadcrumb & Fleet Status */}
      <div className="cg-topbar">
        <div className="cg-journey">
          <span className="cg-step done">
            <CheckCircle2 size={14} color="#3f64ae" />
            <span>Triage Completed</span>
          </span>
          <span className="cg-step-sep" />
          <span className="cg-step active">
            <span>2. Matched Providers</span>
          </span>
          <span className="cg-step-sep" />
          <span className="cg-step">
            <span>3. Dispatch & Slot</span>
          </span>
        </div>
      </div>

      {/* Editorial Header */}
      <div className="cg-header">
        <div className="cg-overline">
          Verified Clinical Fleet · Sector Standby
        </div>
        <h1 className="cg-title">Find Available Caregivers & Nurses</h1>
        <p className="cg-sub">
          Ranked in real-time by proximity to your current sector, clinical matching score, language comfort, and certified in-home diagnostic capability.
        </p>
      </div>

      {/* Triage Context Banner */}
      <div className="cg-triage-context">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Activity size={16} color="#b45309" style={{ flexShrink: 0 }} />
          <div className="cg-triage-text-wrap" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span className="cg-triage-lead" style={{ fontWeight: 600 }}>Active Profile: </span>
            <span style={{ fontWeight: 600 }}>{activePatient?.full_name || 'Current Patient'}</span>
            <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#b45309', fontSize: '11px' }}>{triageUrgency}</span>
            <span className="cg-triage-rec" style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
            <span className="cg-triage-rec" style={{ color: '#2d4261' }}>Recommended: <strong>{triageRecommendation}</strong></span>
          </div>
        </div>
        <div className="cg-triage-protocol" style={{ fontSize: '10.5px', fontFamily: 'var(--cg-mono)', color: 'var(--cg-muted)', flexShrink: 0 }}>
          PROTOCOL: NON-DIAGNOSTIC
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cg-controls">
        <div className="cg-filters">
          <button
            type="button"
            className={`cg-filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Responders ({caregivers.length})
          </button>
          <button
            type="button"
            className={`cg-filter-pill ${filterType === 'nurse' ? 'active' : ''}`}
            onClick={() => setFilterType('nurse')}
          >
            Personal Care Nurses
          </button>
          <button
            type="button"
            className={`cg-filter-pill ${filterType === 'paramedic' ? 'active' : ''}`}
            onClick={() => setFilterType('paramedic')}
          >
            Paramedics & EMTs
          </button>
          <button
            type="button"
            className={`cg-filter-pill ${filterType === 'rapid' ? 'active' : ''}`}
            onClick={() => setFilterType('rapid')}
          >
            Instant Dispatch (&lt; 45m)
          </button>
        </div>

        <div className="cg-search-box">
          <Search size={15} className="cg-search-icon" />
          <input
            type="text"
            placeholder="Search responder or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TOP MATCH HERO CARD */}
      {topMatch && (
        <div className="cg-hero-card">
          <div className="cg-hero-rank">
            <Award size={14} />
            <span>{t('top_match')} · Clinical Rank #1</span>
          </div>

          <div className="cg-hero-main">
            <div className="cg-hero-avatar">
              {getInitials(topMatch.full_name)}
            </div>

            <div className="cg-hero-content">
              <div className="cg-hero-badges">
                <span className="cg-badge-verified">
                  <BadgeCheck size={14} />
                  <span>NMC Licensed & Verified</span>
                </span>
                <span className="cg-badge-reg">
                  ID: {topMatch.caregiver_code || topMatch.council_reg || 'CG_014'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#b45309' }}>
                  <Star size={13} fill="#b45309" color="#b45309" />
                  <span>{topMatch.rating || 4.9} ({topMatch.review_count || 140}+ visits)</span>
                </span>
              </div>

              <h2 className="cg-hero-name">{topMatch.full_name}</h2>
              <div className="cg-hero-title">
                {topMatch.title || 'Staff Nurse & Certified Home Health Professional'} • {topMatch.experience_years || 7}+ Years Acute Experience
              </div>

              {/* 4-Item Telemetry Row */}
              <div className="cg-hero-telemetry">
                <div className="cg-tele-item">
                  <span className="cg-tele-label"><MapPin size={12} color="#3f64ae" /> Proximity</span>
                  <span className="cg-tele-value mono">{topMatch.distance_km || '2.4'} km (Sector 4)</span>
                </div>
                <div className="cg-tele-item">
                  <span className="cg-tele-label"><Clock size={12} color="#3f64ae" /> Dispatch Slot</span>
                  <span className="cg-tele-value" style={{ color: '#3f64ae' }}>{topMatch.next_slot || 'Within 45 mins'}</span>
                </div>
                <div className="cg-tele-item">
                  <span className="cg-tele-label"><Languages size={12} color="#3f64ae" /> Languages</span>
                  <span className="cg-tele-value">{(topMatch.languages || ['Hindi', 'English']).join(', ')}</span>
                </div>
                <div className="cg-tele-item">
                  <span className="cg-tele-label">Standard Visit Fee</span>
                  <span className="cg-tele-value accent mono">₹{topMatch.price || 499}</span>
                </div>
              </div>

              {/* Match Rationale */}
              <div className="cg-hero-rationale">
                <strong>Dispatch Rationale:</strong> {topMatch.reason || 'Matched directly based on high triage accuracy, immediate proximity to patient residence, and certified acute vitals baseline capability.'}
              </div>

              {/* Action Buttons */}
              <div className="cg-hero-actions">
                <button
                  type="button"
                  id="book-top-match-btn"
                  className="cg-btn-primary"
                  onClick={() => handleSelectCaregiver(topMatch)}
                >
                  <span>Select & Confirm Dispatch • ₹{topMatch.price || 499}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="cg-btn-secondary"
                  onClick={() => setSelectedDetailModal(topMatch)}
                >
                  <FileText size={15} />
                  <span>Inspect Clinical Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALTERNATIVE SECTOR STANDBY RESPONDERS */}
      {alternatives.length > 0 && (
        <div>
          <div className="cg-grid-head">
            <h3 className="cg-grid-title">Alternative Standby Responders</h3>
            <span style={{ fontSize: '13px', color: 'var(--cg-muted)' }}>
              {alternatives.length} additional verified units stationed nearby
            </span>
          </div>

          <div className="cg-grid">
            {alternatives.map((cg, idx) => (
              <div key={cg.caregiver_id || cg.caregiver_code || idx} className="cg-card">
                <div>
                  <div className="cg-card-top">
                    <div className="cg-avatar-sm">
                      {getInitials(cg.full_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="cg-card-name">{cg.full_name}</h4>
                      <div className="cg-card-title">{cg.title || 'Staff Nurse / Paramedic'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b45309' }}>
                        <Star size={11} fill="#b45309" color="#b45309" />
                        <span>{cg.rating || 4.8} ({cg.review_count || 85} visits)</span>
                      </div>
                    </div>
                  </div>

                  <div className="cg-card-specs">
                    <span className="cg-spec-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {cg.distance_km || '3.5'} km
                    </span>
                    <span className="cg-spec-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#3f64ae', fontWeight: 600 }}>
                      <Clock size={11} /> {cg.next_slot || 'Today'}
                    </span>
                    <span className="cg-spec-chip">
                      {(cg.languages || ['Hindi']).slice(0, 2).join(', ')}
                    </span>
                  </div>

                  <p className="cg-card-reason">
                    {cg.reason}
                  </p>
                </div>

                <div className="cg-card-footer">
                  <div className="cg-card-price">
                    ₹{cg.price || 499}
                    <span>all-inclusive visit</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--cg-accent)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: '6px 8px' }}
                      onClick={() => setSelectedDetailModal(cg)}
                    >
                      Dossier
                    </button>
                    <button
                      type="button"
                      className="cg-btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '10px' }}
                      onClick={() => handleSelectCaregiver(cg)}
                    >
                      <span>Select</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLINICAL DOSSIER INSPECTION MODAL */}
      {selectedDetailModal && (
        <div className="cg-modal-backdrop" onClick={() => setSelectedDetailModal(null)}>
          <div className="cg-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cg-modal-close"
              onClick={() => setSelectedDetailModal(null)}
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div className="cg-hero-avatar" style={{ width: '64px', height: '64px', fontSize: '22px' }}>
                {getInitials(selectedDetailModal.full_name)}
              </div>
              <div>
                <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '22px', margin: '0 0 4px', color: 'var(--cg-ink)' }}>
                  {selectedDetailModal.full_name}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--cg-ink-2)' }}>
                  {selectedDetailModal.title || 'Staff Nurse'} • {selectedDetailModal.experience_years || 7}+ Years
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--cg-mono)', color: 'var(--cg-muted)', marginTop: '2px' }}>
                  REG: {selectedDetailModal.council_reg || selectedDetailModal.caregiver_code || 'DEL-NURSE-0941'}
                </div>
              </div>
            </div>

            <div style={{ background: '#f7f6f0', borderRadius: '14px', padding: '16px', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--cg-faint)', fontWeight: 700, display: 'block' }}>Match Index</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cg-accent)' }}>
                    {Math.round((selectedDetailModal.score || 0.95) * 100)}% Optimal Fit
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--cg-faint)', fontWeight: 700, display: 'block' }}>Estimated Arrival</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedDetailModal.next_slot || 'Within 45 mins'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--cg-faint)', fontWeight: 700, display: 'block' }}>Verified Languages</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{(selectedDetailModal.languages || []).join(', ')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--cg-faint)', fontWeight: 700, display: 'block' }}>Verified Proximity</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedDetailModal.distance_km || '2.4'} km (Sector 4 Hub)</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <h5 style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--cg-ink-2)', marginBottom: '8px', fontWeight: 700 }}>
                On-Board Diagnostic Equipment & Kit
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(selectedDetailModal.equipment || [
                  'Digital & Manual Sphygmomanometer',
                  'High-precision Pulse Oximeter',
                  'Blood Glucose Monitoring Kit',
                  'Sterile Dressing and First-Aid Kit'
                ]).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                    <CheckCircle2 size={14} color="#3f64ae" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#edf3fc', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px', marginBottom: '24px', fontSize: '12px', color: '#2e4d8a', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                <ShieldCheck size={15} />
                <span>Background Verified & DPDP 2023 Compliant</span>
              </div>
              <span>Police clearance certificate active. Patient medical data shared under explicit, revocable consent for this visit only.</span>
            </div>

            <button
              type="button"
              className="cg-btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px' }}
              onClick={() => {
                const cg = selectedDetailModal;
                setSelectedDetailModal(null);
                handleSelectCaregiver(cg);
              }}
            >
              <span>Schedule In-Person Visit with {selectedDetailModal.full_name} • ₹{selectedDetailModal.price || 499}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
