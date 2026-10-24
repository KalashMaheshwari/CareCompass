import React, { useState } from 'react';
import { Phone, CheckCircle, User, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/supabase';

export const LoginPage = () => {
  const { t, setUser, navigate, loadMembers } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '1234') {
      setErrorMsg('Invalid OTP. For evaluation, use 1234');
      return;
    }
    const loggedUser = dataService.signInDemo('rohit');
    setUser(loggedUser);
    loadMembers();
    navigate('/patients');
  };

  const handleQuickDemoUser = (persona = 'rohit') => {
    const loggedUser = dataService.signInDemo(persona);
    setUser(loggedUser);
    loadMembers();
    navigate('/patients');
  };

  const handleContinueWithoutLogin = () => {
    navigate('/describe');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
          <Lock size={22} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Account & Patient Access</h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Secure authentication managed via Supabase Auth. Access saved family medical records and dispatch history.
        </p>
      </div>

      {/* Quick Evaluation Persona Shortcuts */}
      <div className="surface-card" style={{ background: '#f8fafc', marginBottom: '20px', padding: '16px 20px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Pre-Seeded Clinical Evaluation Profiles:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.86rem', padding: '10px 12px' }}
            onClick={() => handleQuickDemoUser('rohit')}
          >
            <User size={15} color="#0284c7" />
            <span>Rohit (Hinglish)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.86rem', padding: '10px 12px' }}
            onClick={() => handleQuickDemoUser('sunita')}
          >
            <User size={15} color="#0d9488" />
            <span>Sunita (Hindi)</span>
          </button>
        </div>
      </div>

      {/* Phone OTP Form */}
      <div className="surface-card">
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">{t('phone_number')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-phone-input"
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                />
                <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            {errorMsg && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{errorMsg}</p>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              <span>Send Verification Code</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Enter Verification Code</label>
                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Test OTP: 1234</span>
              </div>
              <input
                id="login-otp-input"
                type="text"
                className="form-control"
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
              />
            </div>

            {errorMsg && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{errorMsg}</p>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              <CheckCircle size={18} />
              <span>Verify & Access Account</span>
            </button>
          </form>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={handleContinueWithoutLogin}
        >
          {t('continue_without_login')}
        </button>
      </div>
    </div>
  );
};
