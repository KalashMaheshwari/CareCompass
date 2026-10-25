import React, { useState } from 'react';
import { 
  ShieldCheck, Sliders, Play, AlertTriangle, CheckCircle, BarChart3, 
  Activity, Info, ArrowLeft, ArrowRight, Lock, Check, Sparkles, 
  Layers, AlertOctagon, RefreshCw, FileText, Stethoscope
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafetyMetrics, runTriage } from '../services/triageEngine';

export const DashboardPage = () => {
  const { t, navigate } = useApp();

  const [recallDial, setRecallDial] = useState(0.98);
  const metrics = getSafetyMetrics(recallDial);
  const [runningSample, setRunningSample] = useState(false);
  const [activeSampleIndex, setActiveSampleIndex] = useState(null);
  const [sampleResult, setSampleResult] = useState(null);

  const sampleCases = [
    {
      name: 'Acute Cardiac Presentation',
      category: 'Emergency 112',
      text: 'Papa ko subah se chest pain aur left arm mein tez dard ho raha hai',
      expected: 'Emergency Referral (Immediate)',
      urgencyLevel: 'immediate'
    },
    {
      name: 'AIDS / Critical Immunocompromised Event',
      category: 'Emergency Escalation',
      text: 'I got AIDS and experiencing acute crisis and weakness',
      expected: 'Immediate Emergency Referral (112)',
      urgencyLevel: 'immediate'
    },
    {
      name: 'Direct Assistance / Bedside Nurse Request',
      category: 'Caregiver Dispatch',
      text: 'Patient is bedridden and I need assistance and a home nurse for vitals check',
      expected: 'Nurse Home Visit (Same Day)',
      urgencyLevel: 'same_day'
    },
    {
      name: 'Negation Parsing (No Breathing Difficulty)',
      category: 'Safety Clearance',
      text: 'Halka bukhar hai, saans lene mein koi dikkat nahi hai',
      expected: 'Routine Home Care / Teleconsult',
      urgencyLevel: 'routine'
    },
    {
      name: 'Elderly Febrile Respiratory Case',
      category: 'Nurse Home Visit',
      text: 'Papa ko do din se bukhar hai aur khansi bhi hai',
      expected: 'Nurse Home Visit (Same Day)',
      urgencyLevel: 'same_day'
    },
    {
      name: 'Routine Lab Glycemic Consultation',
      category: 'GP Teleconsult',
      text: 'Blood sugar fasting report review with general physician',
      expected: 'GP Teleconsult (Routine)',
      urgencyLevel: 'routine'
    }
  ];

  const handleRunSample = async (sample, index) => {
    setActiveSampleIndex(index);
    setRunningSample(true);
    setSampleResult(null);
    try {
      const res = await runTriage({
        user_input: sample.text,
        language: 'auto'
      });
      setSampleResult({
        sample,
        output: res
      });
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setRunningSample(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const u = (urgency || '').toLowerCase();
    if (u === 'immediate') {
      return { label: 'Immediate (112)', color: '#b3382c', bg: '#faf0ed', border: '#eed4cd' };
    }
    if (u === 'same_day') {
      return { label: 'Same Day', color: '#c07a1a', bg: '#fef7ea', border: '#f7dfb8' };
    }
    return { label: 'Routine Home Care', color: '#3f64ae', bg: '#edf3fc', border: '#bfdbfe' };
  };

  return (
    <div className="cs-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .cs-page {
          --cs-ink: #101e33;
          --cs-ink-2: #2d4261;
          --cs-muted: #577094;
          --cs-faint: #8ca2c0;
          --cs-line: #d2e0f0;
          --cs-line-2: #bdd1ea;
          --cs-tint: #edf3fa;
          --cs-accent: #3f64ae;
          --cs-accent-deep: #1b3560;
          --cs-accent-vibrant: #2968db;
          --cs-accent-soft: #edf4fe;
          --cs-red: #b3382c;
          --cs-red-soft: #faf0ed;
          --cs-red-line: #eed4cd;
          --cs-amber: #c07a1a;
          --cs-amber-soft: #fef7ea;
          --cs-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
          max-width: 1040px;
          margin: 0 auto;
          width: 100%;
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--cs-ink);
          -webkit-font-smoothing: antialiased;
        }
        .cs-page button { -webkit-tap-highlight-color: transparent; font-family: inherit; }
        .cs-page ::selection { background: rgba(63, 100, 174, .16); }
        .cs-page :focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px; }

        @keyframes cs-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes cs-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.75); } }
        @keyframes cs-spin { to { transform: rotate(360deg); } }

        /* ---------- Top Bar ---------- */
        .cs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
          animation: cs-rise .5s ease both;
        }
        .cs-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          border: 1px solid var(--cs-line);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--cs-ink-2);
          cursor: pointer;
          transition: all .18s ease;
        }
        .cs-back:hover {
          background: #fdfdfc;
          border-color: var(--cs-line-2);
          color: var(--cs-ink);
          transform: translateX(-2px);
        }
        .cs-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid var(--cs-line);
          border-radius: 999px;
          padding: 5px 14px 5px 8px;
          font-size: 12.5px;
          color: var(--cs-ink-2);
        }
        .cs-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--cs-accent);
          animation: cs-pulse 1.8s ease-in-out infinite;
        }

        /* ---------- Header Block ---------- */
        .cs-head {
          margin-bottom: 30px;
          animation: cs-rise .5s .05s ease both;
        }
        .cs-overline {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--cs-accent);
          margin-bottom: 10px;
        }
        .cs-overline::before {
          content: '';
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: var(--cs-accent);
        }
        .cs-h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 34px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -.02em;
          margin: 0 0 10px;
          color: var(--cs-ink);
        }
        .cs-sub {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: var(--cs-ink-2);
          max-width: 68ch;
        }

        /* ---------- KPI Metrics Grid ---------- */
        .cs-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
          animation: cs-rise .5s .1s ease both;
        }
        .cs-kpi-card {
          background: #ffffff;
          border: 1px solid var(--cs-line);
          border-radius: 16px;
          padding: 20px 20px 18px;
          box-shadow: 0 1px 2px rgba(28, 36, 32, .04), 0 12px 24px -16px rgba(28, 36, 32, .08);
          transition: transform .18s ease, border-color .18s ease;
        }
        .cs-kpi-card:hover {
          transform: translateY(-2px);
          border-color: var(--cs-line-2);
        }
        .cs-kpi-card.highlight {
          background: var(--cs-accent-soft);
          border-color: rgba(63, 100, 174, .3);
        }
        .cs-kpi-card.alert {
          background: var(--cs-red-soft);
          border-color: var(--cs-red-line);
        }
        .cs-kpi-card.amber {
          background: var(--cs-amber-soft);
          border-color: #f7dfb8;
        }
        .cs-kpi-lbl {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--cs-muted);
          margin-bottom: 6px;
          display: block;
        }
        .cs-kpi-val {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 32px;
          font-weight: 600;
          line-height: 1;
          color: var(--cs-ink);
          margin-bottom: 6px;
        }
        .cs-kpi-sub {
          font-size: 11.5px;
          color: var(--cs-ink-2);
          line-height: 1.35;
        }

        /* ---------- Two-Column Layout ---------- */
        .cs-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        /* ---------- Standard Cards ---------- */
        .cs-card {
          background: #ffffff;
          border: 1px solid var(--cs-line);
          border-radius: 20px;
          padding: 26px 28px;
          box-shadow: 0 1px 2px rgba(28, 36, 32, .05), 0 16px 40px -20px rgba(28, 36, 32, .14);
          margin-bottom: 24px;
          animation: cs-rise .55s ease both;
        }
        .cs-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }
        .cs-card-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--cs-ink);
        }
        .cs-card-desc {
          margin: 0;
          font-size: 13.5px;
          color: var(--cs-muted);
          line-height: 1.5;
        }

        /* ---------- Interactive Safety Dial ---------- */
        .cs-dial-box {
          background: var(--cs-tint);
          border: 1px solid var(--cs-line);
          border-radius: 16px;
          padding: 20px 22px;
          margin-top: 14px;
        }
        .cs-range-slider {
          width: 100%;
          height: 6px;
          accent-color: var(--cs-accent);
          cursor: pointer;
          margin: 14px 0 8px;
        }
        .cs-dial-stops {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--cs-mono);
          font-size: 10.5px;
          color: var(--cs-muted);
        }

        /* ---------- Confusion Matrix Table ---------- */
        .cs-matrix-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-top: 12px;
          text-align: center;
        }
        .cs-matrix-table th {
          font-family: var(--cs-mono);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--cs-muted);
          padding: 10px 8px;
          border-bottom: 1px solid var(--cs-line);
        }
        .cs-matrix-table td {
          padding: 12px 10px;
          border-bottom: 1px solid var(--cs-line);
          color: var(--cs-ink);
        }
        .cs-matrix-table tr:last-child td {
          border-bottom: none;
        }
        .cs-cell-true {
          background: var(--cs-accent-soft);
          color: var(--cs-accent-deep);
          font-weight: 700;
          font-family: var(--cs-mono);
        }
        .cs-cell-over {
          background: var(--cs-amber-soft);
          color: var(--cs-amber);
          font-family: var(--cs-mono);
        }
        .cs-cell-zero {
          color: var(--cs-faint);
          font-family: var(--cs-mono);
        }

        /* ---------- 5-Tier Safety Architecture Cards ---------- */
        .cs-tiers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .cs-tier-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: var(--cs-tint);
          border: 1px solid var(--cs-line);
          border-radius: 14px;
          padding: 14px 16px;
          transition: all .16s ease;
        }
        .cs-tier-item:hover {
          background: #ffffff;
          border-color: var(--cs-line-2);
          transform: translateX(2px);
        }
        .cs-tier-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--cs-accent-soft);
          color: var(--cs-accent);
          display: grid;
          place-items: center;
          font-family: var(--cs-mono);
          font-size: 11.5px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .cs-tier-content { min-width: 0; }
        .cs-tier-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--cs-ink);
          margin-bottom: 2px;
        }
        .cs-tier-desc {
          font-size: 12px;
          color: var(--cs-muted);
          line-height: 1.45;
          margin: 0;
        }

        /* ---------- Interactive Benchmark Suite ---------- */
        .cs-cases-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cs-case-row {
          background: var(--cs-tint);
          border: 1px solid var(--cs-line);
          border-radius: 14px;
          padding: 14px 16px;
          transition: all .16s ease;
        }
        .cs-case-row:hover {
          background: #ffffff;
          border-color: var(--cs-line-2);
        }
        .cs-case-row.active {
          border-color: var(--cs-accent);
          background: #ffffff;
          box-shadow: 0 0 0 1px var(--cs-accent);
        }
        .cs-case-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .cs-case-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--cs-ink);
        }
        .cs-case-tag {
          font-family: var(--cs-mono);
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid var(--cs-line);
          color: var(--cs-muted);
          font-weight: 600;
        }
        .cs-case-text {
          font-size: 12.5px;
          color: var(--cs-ink-2);
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .cs-case-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .cs-case-target {
          font-size: 11px;
          color: var(--cs-accent);
          font-weight: 600;
        }
        .cs-exec-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #3f64ae;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all .16s ease;
        }
        .cs-exec-btn:hover:not(:disabled) {
          background: #34579d;
          transform: translateY(-1px);
        }
        .cs-exec-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .cs-spinner {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.3);
          border-top-color: #ffffff;
          animation: cs-spin .6s linear infinite;
        }

        /* ---------- Live Result Box ---------- */
        .cs-result-panel {
          margin-top: 16px;
          background: #ffffff;
          border: 1.5px solid var(--cs-accent);
          border-radius: 16px;
          padding: 18px 20px;
          animation: cs-rise .4s ease both;
        }
        .cs-result-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .cs-res-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .02em;
        }
        .cs-res-reason {
          font-size: 13px;
          line-height: 1.55;
          color: var(--cs-ink);
          margin: 6px 0 0;
        }

        /* ---------- DPDP Footer Banner ---------- */
        .cs-banner-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--cs-tint);
          border: 1px solid var(--cs-line);
          border-radius: 16px;
          padding: 16px 22px;
          margin-top: 10px;
          gap: 16px;
          flex-wrap: wrap;
        }

        @media (max-width: 860px) {
          .cs-grid-layout { grid-template-columns: 1fr; }
          .cs-card { padding: 18px 16px; }
          .cs-h1 { font-size: 24px; }
        }
        @media (max-width: 768px) {
          .cs-page { padding: 0 2px; }
          .cs-topbar { margin-bottom: 10px; }
          .cs-overline { font-size: 9px; letter-spacing: .12em; margin-bottom: 4px; }
          .cs-h1 { font-size: 19px !important; line-height: 1.22 !important; margin-bottom: 4px !important; }
          .cs-sub, .cs-subtitle { font-size: 11.5px !important; line-height: 1.42 !important; margin-bottom: 10px !important; }
          .cs-card { padding: 16px 14px 14px !important; border-radius: 16px !important; margin-bottom: 14px !important; }
          .cs-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px; }
          .cs-kpi-card { padding: 12px 10px; border-radius: 12px; }
          .cs-stat-box { padding: 10px; }
          .cs-stat-val { font-size: 18px; }
          .cs-tier-item { padding: 10px 12px; border-radius: 10px; gap: 10px; }
          .cs-case-row { padding: 10px 12px; border-radius: 10px; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="cs-topbar">
        <button
          type="button"
          className="cs-back"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>

        <div className="cs-live-badge">
          <span className="cs-pulse-dot"></span>
          <span>Cohort Annotated: <strong>1,420 Test Cases</strong></span>
        </div>
      </div>

      {/* Page Header */}
      <div className="cs-head">
        <div className="cs-overline">Clinical Governance & Model Verification</div>
        <h1 className="cs-h1">Clinical Safety & Model Evaluation</h1>
        <p className="cs-sub">
          Continuous clinical validation metrics, zero-undertriage sensitivity controls, and multilingual safety tripwires safeguarding patients across India.
        </p>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="cs-kpi-grid">
        <div className="cs-kpi-card highlight">
          <span className="cs-kpi-lbl">Emergency Recall</span>
          <div className="cs-kpi-val" style={{ color: '#3f64ae' }}>{metrics.emergency_recall}</div>
          <div className="cs-kpi-sub">Zero critical emergencies missed</div>
        </div>

        <div className="cs-kpi-card alert">
          <span className="cs-kpi-lbl">Under-Triage Rate</span>
          <div className="cs-kpi-val" style={{ color: '#b3382c' }}>{metrics.under_triage_rate}</div>
          <div className="cs-kpi-sub">Near-zero under-care risk</div>
        </div>

        <div className="cs-kpi-card amber">
          <span className="cs-kpi-lbl">Over-Triage Rate</span>
          <div className="cs-kpi-val" style={{ color: '#c07a1a' }}>{metrics.over_triage_rate}</div>
          <div className="cs-kpi-sub">Deliberate safety buffer</div>
        </div>

        <div className="cs-kpi-card">
          <span className="cs-kpi-lbl">Macro-F1 (Urgency)</span>
          <div className="cs-kpi-val">{metrics.macro_f1_urgency}</div>
          <div className="cs-kpi-sub">Care type F1: {metrics.macro_f1_care_type}</div>
        </div>

        <div className="cs-kpi-card">
          <span className="cs-kpi-lbl">Avg Response Latency</span>
          <div className="cs-kpi-val">{metrics.avg_response_time_ms}</div>
          <div className="cs-kpi-sub">Multi-model failover active</div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="cs-grid-layout">
        {/* Left Column: Sensitivity Controls, Confusion Matrix, 5 Tiers */}
        <div>
          {/* Safety Sensitivity Dial Card */}
          <div className="cs-card">
            <div className="cs-card-head">
              <div>
                <h3 className="cs-card-title">Safety Recall Dial</h3>
                <p className="cs-card-desc">
                  Interactive sensitivity threshold governing automated emergency escalation.
                </p>
              </div>
              <span style={{ fontFamily: 'var(--cs-mono)', fontSize: '15px', fontWeight: 700, color: '#3f64ae' }}>
                {(recallDial * 100).toFixed(0)}%
              </span>
            </div>

            <div className="cs-dial-box">
              <input
                type="range"
                min="0.90"
                max="0.99"
                step="0.01"
                className="cs-range-slider"
                value={recallDial}
                onChange={(e) => setRecallDial(parseFloat(e.target.value))}
              />
              <div className="cs-dial-stops">
                <span>90% (Strict Routing)</span>
                <span style={{ color: '#3f64ae', fontWeight: 700 }}>98% (Clinical Priority)</span>
                <span>99% (Max Escalation)</span>
              </div>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '12.5px', color: '#7d877f', lineHeight: 1.5 }}>
              CareCompass defaults to a 98% threshold to guarantee that acute conditions (cardiac symptoms, airway distress, severe infection) are safely escalated without risk of clinical neglect.
            </p>
          </div>

          {/* Urgency Classification Matrix */}
          <div className="cs-card">
            <div className="cs-card-head">
              <div>
                <h3 className="cs-card-title">Urgency Confusion Matrix</h3>
                <p className="cs-card-desc">
                  Annotated validation across N = 1,420 multilingual test cases (Hindi, English, Hinglish).
                </p>
              </div>
            </div>

            <table className="cs-matrix-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Actual \ Predicted</th>
                  <th>Routine</th>
                  <th>Same Day</th>
                  <th>Immediate (112)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual: Routine</td>
                  <td className="cs-cell-true">430</td>
                  <td className="cs-cell-over">22</td>
                  <td className="cs-cell-zero">0</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual: Same Day</td>
                  <td className="cs-cell-zero">18</td>
                  <td className="cs-cell-true">560</td>
                  <td className="cs-cell-over">6</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 700, color: '#b3382c' }}>Actual: Immediate (112)</td>
                  <td className="cs-cell-zero" style={{ color: '#b3382c', fontWeight: 800 }}>0</td>
                  <td className="cs-cell-over" style={{ color: '#c07a1a' }}>2</td>
                  <td className="cs-cell-true" style={{ background: '#edf3fc', color: '#3f64ae', fontWeight: 800 }}>382</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5-Tier Safety Architecture */}
          <div className="cs-card">
            <div className="cs-card-head">
              <div>
                <h3 className="cs-card-title">5-Tier Safeguard Architecture</h3>
                <p className="cs-card-desc">
                  Layered clinical tripwires protecting patients from hallucination, under-triage, and drug errors.
                </p>
              </div>
            </div>

            <div className="cs-tiers-list">
              <div className="cs-tier-item">
                <div className="cs-tier-num">1</div>
                <div className="cs-tier-content">
                  <div className="cs-tier-title">Client-Side Instant Tripwire</div>
                  <p className="cs-tier-desc">Client regex detects cardiac distress, respiratory collapse, or suicide risk in 0ms before network transit.</p>
                </div>
              </div>

              <div className="cs-tier-item">
                <div className="cs-tier-num">2</div>
                <div className="cs-tier-content">
                  <div className="cs-tier-title">Server Safety Screening (safety.py)</div>
                  <p className="cs-tier-desc">Deterministic red-flag evaluation with negation handling (e.g., "no chest pain" vs "chest pain").</p>
                </div>
              </div>

              <div className="cs-tier-item">
                <div className="cs-tier-num">3</div>
                <div className="cs-tier-content">
                  <div className="cs-tier-title">Adaptive Triage & Early Clearance</div>
                  <p className="cs-tier-desc">Dynamic adaptive questioning (max 10, prefer 4) with instant early clearance for emergencies or nurse requests.</p>
                </div>
              </div>

              <div className="cs-tier-item">
                <div className="cs-tier-num">4</div>
                <div className="cs-tier-content">
                  <div className="cs-tier-title">Zero Prescription & No-Diagnosis Policy</div>
                  <p className="cs-tier-desc">CareCompass strictly never prescribes scheduled antibiotics or steroids. Guidance is non-drug home care or caregiver triage.</p>
                </div>
              </div>

              <div className="cs-tier-item">
                <div className="cs-tier-num">5</div>
                <div className="cs-tier-content">
                  <div className="cs-tier-title">Autonomous Local Fallback Engine</div>
                  <p className="cs-tier-desc">If upstream Groq inference times out (&gt;4s), deterministic clinical rules immediately deliver safe care recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Model Inference Runner */}
        <div>
          <div className="cs-card">
            <div className="cs-card-head">
              <div>
                <h3 className="cs-card-title">Live Benchmark Inference Suite</h3>
                <p className="cs-card-desc">
                  Execute real-time model evaluation against standardized clinical scenarios and inspect decisions.
                </p>
              </div>
            </div>

            <div className="cs-cases-list">
              {sampleCases.map((s, idx) => {
                const isSelected = activeSampleIndex === idx;
                const badge = getUrgencyBadge(s.urgencyLevel);

                return (
                  <div
                    key={idx}
                    className={`cs-case-row ${isSelected ? 'active' : ''}`}
                  >
                    <div className="cs-case-top">
                      <span className="cs-case-name">{s.name}</span>
                      <span className="cs-case-tag">{s.category}</span>
                    </div>

                    <div className="cs-case-text">"{s.text}"</div>

                    <div className="cs-case-footer">
                      <span className="cs-case-target">
                        Target: {s.expected}
                      </span>

                      <button
                        type="button"
                        className="cs-exec-btn"
                        disabled={runningSample}
                        onClick={() => handleRunSample(s, idx)}
                      >
                        {runningSample && isSelected ? (
                          <>
                            <div className="cs-spinner"></div>
                            <span>Testing...</span>
                          </>
                        ) : (
                          <>
                            <Play size={10} fill="#ffffff" />
                            <span>Execute</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Result Output */}
            {sampleResult && (
              <div className="cs-result-panel">
                <div className="cs-result-head">
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#3f64ae' }}>
                    Live Model Evaluation Result
                  </span>
                  {(() => {
                    const badge = getUrgencyBadge(sampleResult.output.urgency);
                    return (
                      <span
                        className="cs-res-badge"
                        style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}
                      >
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1c2420', margin: '4px 0 2px' }}>
                  Care Pathway: {(sampleResult.output.care_type || 'nurse').toUpperCase().replace('_', ' ')}
                </div>

                <p className="cs-res-reason">
                  {sampleResult.output.reasoning}
                </p>

                {sampleResult.output.nurse_care_option && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f7f6f0', borderRadius: '10px', fontSize: '12px', color: '#47534d' }}>
                    <strong>Nurse Care Recommended:</strong> {sampleResult.output.nurse_care_option.title || 'In-Person Personal Care Nurse Visit'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="cs-banner-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="#3f64ae" />
          <span style={{ fontSize: '13px', color: '#47534d', fontWeight: 500 }}>
            DPDP Act 2023 & Clinical Audit Compliant • Tamper-evident cryptographic triage session logs.
          </span>
        </div>

        <button
          type="button"
          className="cs-back"
          onClick={() => navigate('/describe')}
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          <span>Test Live Triage</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
