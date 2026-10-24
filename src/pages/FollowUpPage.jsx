import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, FastForward, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakerButton } from '../components/SpeakerButton';
import { runTriage } from '../services/triageEngine';
import { speechService } from '../services/speech';
import { supabaseService } from '../services/supabase';

const isNegativeOption = (opt) => {
  if (!opt) return false;
  const lower = opt.toLowerCase();
  return (
    lower.startsWith('nahi') ||
    lower.startsWith('no') ||
    lower.includes('koi nahi') ||
    lower.includes('kuch nahi') ||
    lower.includes('none') ||
    lower.includes('normal')
  );
};

const isElaborateOption = (opt) => {
  if (!opt) return false;
  const lower = opt.toLowerCase();
  return (
    opt === 'Elaborate' ||
    lower.includes('other') ||
    lower.includes('describe') ||
    lower.includes('specify')
  );
};

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
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const currentQuestion = triageData.latest_response?.follow_up_question || '';
  const rawOptions = triageData.latest_response?.options || triageData.latest_response?.follow_up_options;
  const options = Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions : [t('yes'), t('no'), t('not_sure')];
  const history = triageData.conversation_history || [];
  const questionNumber = history.length + 1;

  useEffect(() => {
    setSelectedOptions([]);
    setShowCustomInput(false);
    setCustomText('');
    if (currentQuestion) {
      autoSpeak(currentQuestion);
    }
  }, [currentQuestion]);

  // Support pressing Enter to submit current selections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showCustomInput && selectedOptions.length > 0 && !isSubmitting) {
        e.preventDefault();
        handleConfirmSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOptions, showCustomInput, isSubmitting, customText]);

  const handleToggleOption = (opt) => {
    if (isElaborateOption(opt)) {
      setShowCustomInput(prev => !prev);
      return;
    }

    setSelectedOptions(prev => {
      if (prev.includes(opt)) {
        return prev.filter(item => item !== opt);
      } else {
        if (isNegativeOption(opt)) {
          return [opt];
        }
        const filtered = prev.filter(item => !isNegativeOption(item));
        return [...filtered, opt];
      }
    });
  };

  const handleConfirmSelection = async () => {
    let combinedAnswers = [...selectedOptions];
    if (customText.trim()) {
      combinedAnswers.push(customText.trim());
    }

    if (combinedAnswers.length === 0) return;

    const finalAnswer = combinedAnswers.join(', ');
    await submitAnswer(finalAnswer);
  };

  const submitAnswer = async (selectedAnswer) => {
    if (!selectedAnswer) return;

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

      const activeLang = language || triageData.detected_language || 'en';

      const response = await runTriage({
        user_input: triageData.user_input,
        language: activeLang,
        conversation_history: updatedHistory,
        patient_context: patientContext
      });

      setTriageData(prev => ({
        ...prev,
        conversation_history: updatedHistory,
        latest_response: response
      }));

      // Persist to Supabase
      supabaseService.recordTriageSession({
        sessionId: triageData.sessionId,
        userInput: triageData.user_input,
        detectedLanguage: activeLang,
        conversationHistory: updatedHistory,
        decision: response
      });

      setIsSubmitting(false);

      if (response.requires_emergency_path || response.urgency === 'immediate') {
        navigate('/emergency');
      } else if (response.follow_up_question && updatedHistory.length < 4) {
        setShowCustomInput(false);
        setCustomText('');
        setSelectedOptions([]);
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

    const skipHistory = [...history, { question: currentQuestion, answer: 'skipped' }];
    const response = await runTriage({
      user_input: triageData.user_input,
      language: triageData.detected_language || language,
      conversation_history: skipHistory,
      patient_context: patientContext
    });

    setTriageData(prev => ({
      ...prev,
      latest_response: response
    }));

    supabaseService.recordTriageSession({
      sessionId: triageData.sessionId,
      userInput: triageData.user_input,
      detectedLanguage: triageData.detected_language || language,
      conversationHistory: skipHistory,
      decision: response
    });

    setIsSubmitting(false);
    navigate('/result');
  };

  const toggleMicAnswer = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      const activeLang = language || triageData.detected_language || 'en';
      speechService.startListening({
        language: activeLang,
        onResult: ({ transcript, isFinal }) => {
          setVoiceAnswer(transcript);
          if (isFinal) {
            setIsListening(false);
            submitAnswer(transcript);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  const progressPercent = (Math.min(questionNumber, 4) / 4) * 100;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Sleek Top Navigation & Step Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.84rem' }}
          onClick={() => navigate('/describe')}
        >
          <ArrowLeft size={15} />
          <span>{t('modify_description')}</span>
        </button>

        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
          {t('question_counter', { current: Math.min(questionNumber, 4) })}
        </span>
      </div>

      {/* Thin Linear Progress Bar */}
      <div className="followup-progress-track">
        <div className="followup-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main Question Surface */}
      <div className="surface-card" style={{ padding: '32px 30px' }}>
        {/* Question & Audio Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.42,
            margin: 0
          }}>
            {currentQuestion}
          </h2>
          <SpeakerButton text={currentQuestion} size={18} />
        </div>

        <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 20px 0' }}>
          {t('followup_tip')}
        </p>

        {/* Clean Options List */}
        <div className="followup-options-list">
          {options.map((opt, idx) => {
            const isSelected = selectedOptions.includes(opt);
            const isElab = isElaborateOption(opt);

            return (
              <div
                key={idx}
                id={`followup-option-${idx}`}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                className={`followup-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleToggleOption(opt)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleToggleOption(opt);
                  }
                }}
              >
                <div className="followup-checkbox">
                  {isSelected && <Check size={13} strokeWidth={2.8} />}
                </div>
                <span className="followup-card-text">{opt}</span>
                {isElab && (
                  <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 500 }}>
                    {showCustomInput ? t('hide_text') : t('add_text')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Clean Text Box for Elaboration */}
        {showCustomInput && (
          <div style={{ marginTop: '14px', marginBottom: '8px' }}>
            <input
              type="text"
              className="text-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={triageData.latest_response?.other_option_placeholder || (language === 'hi' ? 'अपने लक्षण यहाँ विस्तार से लिखें...' : (language === 'hinglish' ? 'Apne lakshan yahan likhein...' : 'Describe your symptoms here...'))}
              autoFocus
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1.5px solid #0284c7',
                fontSize: '0.94rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmSelection();
                }
              }}
            />
          </div>
        )}

        {/* Action Row */}
        <div style={{
          marginTop: '26px',
          paddingTop: '18px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className={`btn-voice-input ${isListening ? 'active' : ''}`}
              onClick={toggleMicAnswer}
              title="Speak your answer"
            >
              <Mic size={15} />
              <span>{isListening ? t('voice_listening') : t('voice_answer_btn')}</span>
            </button>
            {voiceAnswer && (
              <span style={{ fontSize: '0.82rem', color: '#0284c7' }}>
                "{voiceAnswer}"
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.92rem', borderRadius: '8px' }}
            disabled={(selectedOptions.length === 0 && !customText.trim()) || isSubmitting}
            onClick={handleConfirmSelection}
          >
            <span>
              {selectedOptions.length > 1
                ? t('continue_count_btn', { count: selectedOptions.length })
                : t('continue_btn')}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Skip Question Link */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          onClick={handleSkipToResult}
        >
          <span>{t('skip_question')}</span>
          <FastForward size={13} />
        </button>
      </div>

      {isSubmitting && (
        <div style={{ textAlign: 'center', marginTop: '14px' }}>
          <span style={{ fontSize: '0.84rem', color: '#0284c7', fontWeight: 500 }}>
            {t('analyzing_clinical')}
          </span>
        </div>
      )}
    </div>
  );
};
