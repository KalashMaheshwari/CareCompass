import React, { useState, useEffect } from 'react';
import { Send, RotateCcw, AlertTriangle, Users, AlertOctagon, Mic, MicOff, Volume2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { runTriage, checkClientSideRedFlags } from '../services/triageEngine';
import { supabaseService } from '../services/supabase';

export const DescribePage = ({ startListening = false, presetText = '' }) => {
  const {
    t,
    language,
    activePatient,
    triageData,
    setTriageData,
    navigate
  } = useApp();

  const [inputTranscript, setInputTranscript] = useState(presetText || triageData.user_input || '');
  const [micStatus, setMicStatus] = useState('idle');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [clientRedFlag, setClientRedFlag] = useState(null);

  useEffect(() => {
    if (startListening) {
      handleToggleVoice();
    }
    return () => {
      speechService.stopListening();
    };
  }, [startListening]);

  useEffect(() => {
    const flag = checkClientSideRedFlags(inputTranscript);
    setClientRedFlag(flag);
  }, [inputTranscript]);

  const handleToggleVoice = () => {
    if (micStatus === 'listening') {
      speechService.stopListening();
    } else {
      setMicStatus('listening');
      const activeLang = language || 'en';
      const started = speechService.startListening({
        language: activeLang,
        onResult: ({ transcript, isFinal }) => {
          setInputTranscript(transcript);
          if (isFinal) {
            setMicStatus('idle');
          }
        },
        onTranscribing: (isTranscribing) => {
          setMicStatus(isTranscribing ? 'transcribing' : 'idle');
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
          setMicStatus('idle');
        },
        onEnd: () => {
          setMicStatus('idle');
        }
      });

      if (!started) {
        setMicStatus('idle');
      }
    }
  };

  const handleSendTriage = async (e) => {
    if (e) e.preventDefault();
    if (!inputTranscript.trim()) return;

    speechService.stopListening();
    setIsEvaluating(true);

    try {
      const patientContext = activePatient ? {
        name: activePatient.full_name,
        relationship: activePatient.relationship,
        age: activePatient.date_of_birth
          ? Math.abs(new Date(Date.now() - new Date(activePatient.date_of_birth).getTime()).getUTCFullYear() - 1970)
          : null,
        conditions: activePatient.existing_conditions || ''
      } : null;

      const response = await runTriage({
        user_input: inputTranscript,
        language: language === 'auto' ? 'auto' : language,
        conversation_history: [],
        patient_context: patientContext
      });

      const sessId = `sess-${Date.now()}`;
      setTriageData({
        user_input: inputTranscript,
        detected_language: language,
        conversation_history: [],
        latest_response: response,
        sessionId: sessId
      });

      // Persist session to Supabase tables
      supabaseService.recordTriageSession({
        sessionId: sessId,
        userInput: inputTranscript,
        detectedLanguage: language,
        conversationHistory: [],
        decision: response
      });

      setIsEvaluating(false);

      if (response.requires_emergency_path || response.urgency === 'immediate') {
        navigate('/emergency');
      } else if (response.follow_up_question) {
        navigate('/followup');
      } else {
        navigate('/result');
      }
    } catch (err) {
      console.error('Triage error:', err);
      setIsEvaluating(false);
      alert('Unable to process symptoms. Please check connection or call 112 for emergency help.');
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Back button and Patient Header */}
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.85rem' }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          <span>{t('back_to_overview')}</span>
        </button>

        {activePatient ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <Users size={16} color="var(--brand-primary)" />
            <span>
              {t('target_patient')} <strong style={{ color: 'var(--text-primary)' }}>{activePatient.full_name}</strong> ({activePatient.relationship})
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{t('anonymous_intake')}</span>
        )}
      </div>

      {/* Main Clinical Input Surface */}
      <div className="surface-card">
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{t('describe_heading')}</h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            {t('describe_subheading')}
          </p>
        </div>

        {/* Client-Side Safety Net Red Flag Banner */}
        {clientRedFlag && (
          <div
            style={{
              background: '#fef2f2',
              border: '1.5px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <AlertOctagon size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>
                Critical Emergency Symptom Flagged: {clientRedFlag.label}
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '2px' }}>
                If the patient is in acute distress, bypass triage and connect to emergency response services immediately.
              </p>
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginTop: '10px', padding: '8px 16px', fontSize: '0.88rem' }}
                onClick={() => navigate('/emergency')}
              >
                Proceed to Emergency Dispatch (112)
              </button>
            </div>
          </div>
        )}

        {/* Audio Recording Strip */}
        <div className="voice-recording-strip" style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="audio-frequency-meter">
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
              <div className={`frequency-bar ${micStatus === 'listening' ? 'listening' : ''}`}></div>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {micStatus === 'listening'
                  ? t('voice_recording')
                  : (micStatus === 'transcribing'
                      ? 'Transcribing audio...'
                      : t('voice_ready'))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {micStatus === 'listening'
                  ? (language === 'hi' ? 'बोलना जारी रखें... समाप्त होने पर टैप करें' : (language === 'hinglish' ? 'Bolte rahein... bolna khatam hone par tap karein' : 'Speak naturally in Hindi or English... tap when finished'))
                  : 'Multilingual STT (Hindi & English active)'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`voice-action-pill ${micStatus === 'listening' ? 'recording' : ''}`}
            onClick={handleToggleVoice}
            disabled={micStatus === 'transcribing'}
          >
            {micStatus === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
            <span>
              {micStatus === 'listening'
                ? t('finish_speaking')
                : (micStatus === 'transcribing' ? 'Transcribing...' : t('start_recording'))}
            </span>
          </button>
        </div>

        {/* Transcript Box */}
        <div style={{ marginBottom: '14px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('transcript_notes')}
            </span>
            {inputTranscript && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setInputTranscript('')}
              >
                <RotateCcw size={13} />
                <span>{t('clear_input')}</span>
              </button>
            )}
          </div>

          <textarea
            className="form-control"
            rows={5}
            style={{ fontSize: '1.05rem', lineHeight: 1.5, padding: '14px' }}
            placeholder={t('symptom_placeholder')}
            value={inputTranscript}
            onChange={(e) => setInputTranscript(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Example: <em>"Papa ko do din se bukhar hai aur khansi bhi hai"</em>
          </span>

          <button
            id="submit-triage-button"
            type="button"
            className="btn btn-primary btn-lg"
            disabled={!inputTranscript.trim() || isEvaluating}
            onClick={handleSendTriage}
          >
            {isEvaluating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', margin: 0, borderWidth: '2px' }}></span>
                <span>{t('evaluating_pathway')}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{t('run_triage_btn')}</span>
                <Send size={18} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
