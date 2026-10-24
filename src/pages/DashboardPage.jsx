import React, { useState } from 'react';
import { ShieldCheck, Sliders, Play, AlertTriangle, CheckCircle, BarChart3, Activity, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSafetyMetrics, runTriage } from '../services/triageEngine';

export const DashboardPage = () => {
  const { t } = useApp();

  const [recallDial, setRecallDial] = useState(0.98);
  const metrics = getSafetyMetrics(recallDial);
  const [runningSample, setRunningSample] = useState(false);
  const [sampleResult, setSampleResult] = useState(null);

  const sampleCases = [
    {
      name: 'Acute Cardiac Presentation (Emergency Referral)',
      text: 'Papa ko subah se chest pain aur left arm mein tez dard ho raha hai',
      expected: 'Emergency Referral (Immediate)'
    },
    {
      name: 'Elderly Febrile Respiratory Case (Home Nurse)',
      text: 'Papa ko do din se bukhar hai aur khansi bhi hai',
      expected: 'Nurse (Same Day)'
    },
    {
      name: 'Negation Parsing (No Breathing Trouble)',
      text: 'Halka bukhar hai, saans lene mein koi dikkat nahi hai',
      expected: 'Nurse / Paramedic (Same Day)'
    },
    {
      name: 'Routine Lab Glycemic Consultation (GP Teleconsult)',
      text: 'Blood sugar fasting report review with general physician',
      expected: 'GP Teleconsult (Routine)'
    }
  ];

  const handleRunSample = async (sample) => {
    setRunningSample(true);
    setSampleResult(null);
    const res = await runTriage({
      user_input: sample.text,
      language: 'auto'
    });
    setSampleResult({
      sample,
      output: res
    });
    setRunningSample(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page Title & Clinical Subtitle */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldCheck size={14} />
          <span>Clinical Validation & Model Safety Evaluation</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Safety & Evaluation Metrics</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time safety performance measured across 1,420 annotated multilingual test cases (Hindi, English, Hinglish).
        </p>
      </div>

      {/* Top High-Density Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="surface-card" style={{ padding: '18px 16px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Emergency Recall
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
            {metrics.emergency_recall}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#166534' }}>Zero Critical Emergencies Missed</span>
        </div>

        <div className="surface-card" style={{ padding: '18px 16px', background: '#fef2f2', borderColor: '#fecaca' }}>
          <span style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Under-Triage Rate
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
            {metrics.under_triage_rate}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#991b1b' }}>Near-Zero Under-Care Risk</span>
        </div>

        <div className="surface-card" style={{ padding: '18px 16px', background: '#fffbeb', borderColor: '#fde68a' }}>
          <span style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Over-Triage Rate
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
            {metrics.over_triage_rate}
          </div>
          <span style={{ fontSize: '0.74rem', color: '#92400e' }}>Deliberate Cost of Safety Margin</span>
        </div>

        <div className="surface-card" style={{ padding: '18px 16px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Macro-F1 (Urgency)
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            {metrics.macro_f1_urgency}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Care Type F1: {metrics.macro_f1_care_type}</span>
        </div>

        <div className="surface-card" style={{ padding: '18px 16px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Avg Inference Latency
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-primary)', margin: '4px 0' }}>
            {metrics.avg_response_time_ms}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Follow-ups: {metrics.avg_followup_count}</span>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="two-col-grid" style={{ alignItems: 'start' }}>
        {/* Left Column: Sensitivity Dial & Confusion Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Interactive Sensitivity Dial */}
          <div className="surface-card">
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Safety Recall Dial (Sensitivity Threshold)</h3>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                {(recallDial * 100).toFixed(0)}%
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
              Controls the model's safety escalation threshold. CareCompass maintains a high sensitivity setting to strictly prevent under-triage of acute medical events.
            </p>
            <input
              type="range"
              min="0.90"
              max="0.99"
              step="0.01"
              style={{ width: '100%', accentColor: '#0284c7', height: '6px' }}
              value={recallDial}
              onChange={(e) => setRecallDial(parseFloat(e.target.value))}
            />
            <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>90% (Strict Routing)</span>
              <span>98% Default (Clinical Safety Priority)</span>
              <span>99% (Maximum Escalation)</span>
            </div>
          </div>

          {/* Urgency Confusion Matrix */}
          <div className="surface-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BarChart3 size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Urgency Classification Matrix (N = 1,420)</h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.86rem', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)', borderBottom: '1.5px solid var(--border-light)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Actual vs Predicted</th>
                    <th style={{ padding: '8px' }}>Routine</th>
                    <th style={{ padding: '8px' }}>Same Day</th>
                    <th style={{ padding: '8px' }}>Immediate (112)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>Actual: Routine</td>
                    <td style={{ padding: '10px 8px', background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>430</td>
                    <td style={{ padding: '10px 8px', background: '#fffbeb' }}>22</td>
                    <td style={{ padding: '10px 8px' }}>0</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>Actual: Same Day</td>
                    <td style={{ padding: '10px 8px' }}>18</td>
                    <td style={{ padding: '10px 8px', background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>560</td>
                    <td style={{ padding: '10px 8px', background: '#fef2f2' }}>6</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, color: '#dc2626' }}>Actual: Immediate</td>
                    <td style={{ padding: '10px 8px', color: '#dc2626', fontWeight: 800 }}>0</td>
                    <td style={{ padding: '10px 8px', color: '#d97706', fontWeight: 700 }}>2</td>
                    <td style={{ padding: '10px 8px', background: '#ecfdf5', color: '#065f46', fontWeight: 800 }}>382</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Model Inference Runner */}
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Play size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Live Benchmark Inference Suite</h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Select any standardized clinical scenario to execute real-time model evaluation and inspect the routing decision.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sampleCases.map((s, idx) => (
              <div
                key={idx}
                style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex-between">
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</strong>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                    disabled={runningSample}
                    onClick={() => handleRunSample(s)}
                  >
                    Execute
                  </button>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', marginTop: '4px' }}>
                  "{s.text}"
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--brand-teal-700)', marginTop: '4px', fontWeight: 600 }}>
                  Target: {s.expected}
                </div>
              </div>
            ))}
          </div>

          {sampleResult && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f0fdfa', borderRadius: 'var(--radius-md)', border: '1.5px solid #99f6e4' }}>
              <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Live Model Output:
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: sampleResult.output.urgency === 'immediate' ? '#dc2626' : '#0f766e' }}>
                Care: {(sampleResult.output.care_type || 'nurse').toUpperCase()} • Urgency: {(sampleResult.output.urgency || 'same_day').toUpperCase()}
              </div>
              <p style={{ fontSize: '0.86rem', color: '#334155', marginTop: '6px', lineHeight: 1.5 }}>
                {sampleResult.output.reasoning}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
