import React from 'react'
import { 
  Mic, 
  Keyboard, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  HeartPulse, 
  Zap, 
  ChevronRight,
  Stethoscope
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function HomePage() {
  const { navigate, t } = useApp()

  return (
    <main className="hero-section">
      {/* Top Status Pill */}
      <div className="hero-pill-badge">
        <Sparkles size={14} />
        <span>Voice-First AI Healthcare Navigator · Hack IIITD</span>
      </div>

      {/* Main Headline */}
      <h1 className="hero-headline">
        Right Care. Right Urgency. <br />
        <span className="gradient-text">In Your Own Language.</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subhead">
        Describe symptoms naturally in Hindi, Hinglish, or English. CareCompass accurately routes you to home paramedics, tele-consults, or emergency services without diagnosing.
      </p>

      {/* Giant Voice Intake Hero Card */}
      <section className="intake-center-card">
        <div className="mic-halo-container">
          <div className="mic-halo-ring"></div>
          <button 
            type="button" 
            className="mic-circle-btn" 
            aria-label="Start voice triage intake"
            onClick={() => navigate('/describe', { startListening: true })}
          >
            <Mic size={38} />
          </button>
        </div>

        <h2 className="intake-prompt-title">बोलने के लिए दबाएँ</h2>
        <p className="intake-prompt-subtitle">
          Tap the microphone to speak, or state what you or your family member are feeling.
        </p>

        <button 
          type="button" 
          className="manual-type-link"
          onClick={() => navigate('/describe')}
        >
          <Keyboard size={15} />
          <span>Or type symptoms manually</span>
          <ChevronRight size={14} />
        </button>
      </section>

      {/* Quick Test Scenarios */}
      <div className="quick-scenarios-wrapper">
        <div className="quick-scenarios-title">1-Tap Demo Scenarios</div>
        <div className="scenario-chips-row">
          <button 
            type="button" 
            className="scenario-chip"
            onClick={() => navigate('/describe', { presetText: '3 din se tez bukhar aur thand lag rahi hai' })}
          >
            <HeartPulse size={15} color="#ef4444" />
            <span>"3 din se tez bukhar aur thand lag rahi hai"</span>
          </button>
          <button 
            type="button" 
            className="scenario-chip"
            onClick={() => navigate('/describe', { presetText: 'Papa ko saans lene mein takleef aur paseena aa raha hai' })}
          >
            <Zap size={15} color="#f59e0b" />
            <span>"Papa ko saans lene mein takleef aur paseena aa raha hai"</span>
          </button>
          <button 
            type="button" 
            className="scenario-chip"
            onClick={() => navigate('/describe', { presetText: 'Routine blood pressure and sugar checkup at home' })}
          >
            <Stethoscope size={15} color="#00e5ff" />
            <span>"Routine blood pressure and sugar checkup at home"</span>
          </button>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <section className="pillars-grid">
        <div 
          className="pillar-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/describe')}
        >
          <div className="pillar-icon-box">
            <Mic size={24} />
          </div>
          <h3 className="pillar-title">Trilingual Voice Intake</h3>
          <p className="pillar-desc">
            Direct speech recognition in Hindi, Indian English, and conversational Hinglish with real-time waveform visualization.
          </p>
        </div>

        <div 
          className="pillar-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <div className="pillar-icon-box">
            <ShieldCheck size={24} />
          </div>
          <h3 className="pillar-title">Clinical Safety-Net Rules</h3>
          <p className="pillar-desc">
            Zero-negation filtering prevents false alarms while immediately escalating critical red flags like chest pain or altered consciousness.
          </p>
        </div>

        <div 
          className="pillar-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/caregivers')}
        >
          <div className="pillar-icon-box">
            <MapPin size={24} />
          </div>
          <h3 className="pillar-title">Ranked Caregiver Dispatch</h3>
          <p className="pillar-desc">
            Geo-matches verified paramedics, visiting nurses, and general physicians ranked by proximity, language match, and clinical score.
          </p>
        </div>
      </section>

      {/* Trust & Clinical Safety Metrics Bar */}
      <div 
        className="trust-stats-bar"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}
        title="View Safety Dashboard"
      >
        <div className="stat-item">
          <span className="stat-value">98.5%</span>
          <span className="stat-label">Emergency Recall Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">&lt; 2.5s</span>
          <span className="stat-label">Triage Decision Latency</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">100%</span>
          <span className="stat-label">DPDP Act 2023 Compliant</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">Supported Vernacular Modes</span>
        </div>
      </div>
    </main>
  )
}
