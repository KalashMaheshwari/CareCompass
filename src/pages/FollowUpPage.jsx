import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Send, Volume2, FastForward, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';
import { runTriage } from '../services/triageEngine';
import { speechService } from '../services/speech';

export const FollowUpPage = () => {
  const {
    t,
    language,
    triageData,
    setTriageData,
    navigate,
    autoSpeak,
    activePatient
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceAnswer, setVoiceAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);

  const currentQuestion = triageData.latest_response?.follow_up_question || '';
  const options = triageData.latest_response?.follow_up_options || [t('yes'), t('no'), t('not_sure')];
  const history = triageData.conversation_history || [];
  const questionNumber = history.length + 1;

  useEffect(() => {
    if (currentQuestion) {
      autoSpeak(currentQuestion);
    }
  }, [currentQuestion]);

  const handleSelectOption = async (selectedAnswer) => {
    speechService.stopSpeaking();
    setIsSubmitting(true);

    const updatedHistory = [
      ...history,
      {
        question: currentQuestion,
        answer: selectedAnswer
      }
    ];

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
        user_input: triageData.user_input,
        language: triageData.detected_language || language,
        conversation_history: updatedHistory,
        patient_context: patientContext
      });

      setTriageData(prev => ({
        ...prev,
        conversation_history: updatedHistory,
        latest_response: response
      }));

      setIsSubmitting(false);

      if (response.requires_emergency_path || response.urgency === 'immediate') {
        navigate('/emergency');
      } else if (response.follow_up_question && updatedHistory.length < 3) {
        // Continue follow-up
      } else {
        navigate('/result');
      }
    } catch (err) {
      console.error('Follow-up triage error:', err);
      setIsSubmitting(false);
      navigate('/result');
    }
  };

  const handleSkipToResult = async () => {
    setIsSubmitting(true);
    const patientContext = activePatient ? {
      name: activePatient.full_name,
      conditions: activePatient.existing_conditions || ''
    } : null;

    const response = await runTriage({
      user_input: triageData.user_input,
      language: triageData.detected_language || language,
      conversation_history: [...history, { question: currentQuestion, answer: 'skipped' }],
      patient_context: patientContext
    });

    setTriageData(prev => ({
      ...prev,
      latest_response: response
    }));

    setIsSubmitting(false);
    navigate('/result');
  };

  const toggleMicAnswer = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        language: language === 'hi' ? 'hi' : 'en',
        onResult: ({ transcript, isFinal }) => {
          setVoiceAnswer(transcript);
          if (isFinal) {
            setIsListening(false);
            handleSelectOption(transcript);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', width: '100%' }}>
      {/* Stepper Header */}
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '7px 14px', fontSize: '0.85rem' }}
          onClick={() => navigate('/describe')}
        >
          <ArrowLeft size={16} />
          <span>Modify Description</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Clinical Follow-Up: Question {questionNumber} of 2
        </span>
      </div>

      {/* Main Question Card */}
      <div className="surface-card" style={{ padding: '32px 28px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <SpeakerButton text={currentQuestion} size={20} />
        </div>

        <h3 style={{ fontSize: '1.5rem', lineHeight: 1.45, marginBottom: '28px', padding: '0 28px', color: 'var(--text-primary)' }}>
          {currentQuestion}
        </h3>

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              id={`followup-option-${idx}`}
              type="button"
              className="btn btn-secondary btn-lg"
              style={{
                fontSize: '1.05rem',
                justifyContent: 'center',
                backgroundColor: idx === 0 ? '#f0fdfa' : '#ffffff',
                borderColor: idx === 0 ? '#99f6e4' : 'var(--border-light)',
                color: idx === 0 ? '#0f766e' : 'var(--text-primary)',
                fontWeight: 700
              }}
              disabled={isSubmitting}
              onClick={() => handleSelectOption(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Voice Dictate Alternative */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            className={`btn btn-secondary ${isListening ? 'listening' : ''}`}
            style={{ fontSize: '0.88rem', borderColor: isListening ? '#ef4444' : 'var(--border-light)' }}
            onClick={toggleMicAnswer}
          >
            <Mic size={16} color={isListening ? '#ef4444' : 'var(--brand-primary)'} />
            <span>{isListening ? 'Listening... Speak Answer' : 'Or Answer Spoken Voice'}</span>
          </button>
          {voiceAnswer && (
            <span style={{ fontSize: '0.85rem', color: '#0284c7' }}>
              Recognized: "{voiceAnswer}"
            </span>
          )}
        </div>
      </div>

      {/* Skip Button */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.86rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={handleSkipToResult}
        >
          <span>{t('skip_question')}</span>
          <FastForward size={14} />
        </button>
      </div>

      {isSubmitting && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--brand-teal-700)', fontWeight: 600 }}>
            Analyzing clinical parameters...
          </span>
        </div>
      )}
    </div>
  );
};
