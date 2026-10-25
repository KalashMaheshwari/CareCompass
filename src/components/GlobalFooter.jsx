import React from 'react';
import { useApp } from '../context/AppContext';

export const GlobalFooter = () => {
  const { navigate } = useApp();

  return (
    <footer className="footer-end-to-end" aria-label="CareCompass Global Footer">
      {/* Top Grid Section */}
      <div className="footer-top-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <button
            type="button"
            className="footer-brand-title"
            onClick={() => navigate('/')}
            title="CareCompass Home"
            aria-label="CareCompass Home"
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <img 
              src="/logo.png" 
              alt="CareCompass Logo" 
              className="footer-brand-logo" 
            />
          </button>
          <p className="footer-tagline">
            Dedicated to your health, every day
          </p>
        </div>

        {/* Column 1: Quick links */}
        <div className="footer-nav-col">
          <h4 className="footer-col-heading">Quick links</h4>
          <div className="footer-link-list">
            <button type="button" className="footer-link-item" onClick={() => navigate('/')}>
              Home
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/describe')}>
              Check Symptoms
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/caregivers')}>
              Our Services
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/settings')}>
              Patient Portal
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/caregivers')}>
              Book Appointment
            </button>
          </div>
        </div>

        {/* Column 2: Access Channels */}
        <div className="footer-nav-col">
          <h4 className="footer-col-heading">Channels</h4>
          <div className="footer-link-list">
            <button type="button" className="footer-link-item" onClick={() => navigate('/call-sim')}>
              Phone IVR
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/call-sim')}>
              WhatsApp Bot
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/caregivers')}>
              Doorstep Visit
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/caregivers')}>
              Paramedic Fleet
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/emergency')} style={{ color: '#ef4444', fontWeight: 700 }}>
              Emergency 112
            </button>
          </div>
        </div>

        {/* Column 3: Resources */}
        <div className="footer-nav-col">
          <h4 className="footer-col-heading">Resources</h4>
          <div className="footer-link-list">
            <button type="button" className="footer-link-item" onClick={() => navigate('/dashboard')}>
              Clinical Safety
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/checkin')}>
              Active Check-Ins
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/caregivers')}>
              Verified Fleet
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/result')}>
              Lab Partner Tests
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/dashboard')}>
              Audit Metrics
            </button>
          </div>
        </div>

        {/* Column 4: Supports */}
        <div className="footer-nav-col">
          <h4 className="footer-col-heading">Supports</h4>
          <div className="footer-link-list">
            <button type="button" className="footer-link-item" onClick={() => navigate('/privacy')}>
              Technical Support
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/privacy')}>
              Feedback Form
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/privacy')}>
              Privacy Policy
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/privacy')}>
              Terms of Use
            </button>
            <button type="button" className="footer-link-item" onClick={() => navigate('/call-sim')}>
              Help Center
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Giant Bleeding Wordmark in Exact Outfit Geometric Display Font */}
      <div className="footer-hero-wordmark-container">
        <div className="footer-hero-wordmark">
          CareCompass
        </div>
      </div>
    </footer>
  );
};
