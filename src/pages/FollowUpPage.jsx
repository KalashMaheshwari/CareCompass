import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, FastForward, Check, ArrowRight, Loader2, Activity } from 'lucide-react';
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
    lower.includes('specify') ||
    lower.includes('elaborate') ||
    lower.includes('kuch aur') ||
    lower.includes('aur batayein') ||
    lower.includes('विस्तार')
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
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = triageData.latest_response?.follow_up_question || '';
  const rawOptions = triageData.latest_response?.options || triageData.latest_response?.follow_up_options;
  const baseOptions = Array.isArray(rawOptions) && rawOptions.length > 0 ? rawOptions : [t('yes'), t('no'), t('not_sure')];
  
  // Ensure an elaborate/other option is available so it can be combined with any single choice
  const hasElab = baseOptions.some(isElaborateOption);
  const options = hasElab
    ? baseOptions
    : [
        ...baseOptions,
        language === 'hi'
          ? 'कुछ और (विस्तार से बताएं)'
          : language === 'hinglish'
            ? 'Other (aur batayein)'
            : 'Other (please describe)'
      ];

  const history = triageData.conversation_history || [];
  const questionNumber = history.length + 1;

  useEffect(() => {
    setSelectedOption(null);
    setShowCustomInput(false);
    setCustomText('');
    if (currentQuestion) {
      autoSpeak(currentQuestion);
    }
  }, [currentQuestion]);

  // Support pressing Enter to submit current selections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showCustomInput && selectedOption && !isSubmitting) {
        e.preventDefault();
        handleConfirmSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, showCustomInput, isSubmitting, customText]);

  const handleToggleOption = (opt) => {
    if (isElaborateOption(opt)) {
      setShowCustomInput(prev => !prev);
      return;
    }

    // Drop multiple select: choosing a regular option sets it as the single selected choice
    setSelectedOption(prev => prev === opt ? null : opt);
  };

  const handleConfirmSelection = async () => {
    let combinedAnswers = [];
    if (selectedOption) {
      combinedAnswers.push(selectedOption);
    }
    if (showCustomInput && customText.trim()) {
      combinedAnswers.push(customText.trim());
    } else if (!selectedOption && customText.trim()) {
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
      } else if (response.follow_up_question && response.status !== 'recommendation' && updatedHistory.length < 10) {
        setShowCustomInput(false);
        setCustomText('');
        setSelectedOption(null);
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

  // Adaptive progress calculation:
  // Smoothly advances towards completion based on preferred ~4 baseline or scaling up to 10
  const progressPercent = questionNumber <= 4
    ? (questionNumber / 4) * 85
    : Math.min(96, 85 + ((questionNumber - 4) / 6) * 11);

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
            {t('question_counter', { current: questionNumber })}
          </span>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(63, 100, 174, 0.08)',
            color: '#3f64ae',
            fontWeight: 600
          }}>
            {t('adaptive_triage_badge')}
          </span>
        </div>
      </div>

      {/* Thin Linear Progress Bar */}
      <div className="followup-progress-track">
        <div className="followup-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main Question Surface */}
      <div className="surface-card" style={{ padding: '32px 30px', position: 'relative', overflow: 'hidden' }}>
        {/* Analyzing Answers Clinical Loading Spinner Overlay */}
        {isSubmitting && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 25,
            padding: '24px'
          }}>
            {/* Dual Concentric Pulsing Spinners */}
            <div style={{ position: 'relative', width: '58px', height: '58px', marginBottom: '16px' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3.5px solid #e0f2fe',
                borderTopColor: '#3f64ae',
                animation: 'spin 0.85s linear infinite'
              }} />
              <div style={{
                position: 'absolute',
                inset: '7px',
                borderRadius: '50%',
                border: '2.5px solid #edf4fe',
                borderTopColor: '#2b4984',
                animation: 'spin 1.25s linear infinite reverse'
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={18} color="#3f64ae" />
              </div>
            </div>

            <div style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '6px'
            }}>
              {language === 'hi'
                ? 'उत्तर का विश्लेषण किया जा रहा है...'
                : (language === 'hinglish' ? 'Answer analyze kiya ja raha hai...' : 'Analyzing clinical response...')}
            </div>

            <div style={{
              fontSize: '0.84rem',
              color: '#64748b',
              maxWidth: '340px',
              textAlign: 'center',
              lineHeight: 1.45
            }}>
              Calibrating symptom progression & determining clinical next steps...
            </div>
          </div>
        )}

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

        {/* Clean Options List: Single Select for regular choices + Elaborate option combinable */}
        <div className="followup-options-list">
          {options.map((opt, idx) => {
            const isElab = isElaborateOption(opt);
            const isSelected = isElab ? showCustomInput : selectedOption === opt;

            return (
              <div
                key={idx}
                id={`followup-option-${idx}`}
                role={isElab ? "checkbox" : "radio"}
                aria-checked={isSelected}
                tabIndex={0}
                className={`followup-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => !isSubmitting && handleToggleOption(opt)}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !isSubmitting) {
                    e.preventDefault();
                    handleToggleOption(opt);
                  }
                }}
              >
                <div className={`followup-control-indicator ${isElab ? 'is-checkbox' : 'is-radio'}`}>
                  {isSelected && (
                    isElab
                      ? <Check size={13} strokeWidth={2.8} />
                      : <div className="followup-radio-dot" />
                  )}
                </div>
                <span className="followup-card-text">{opt}</span>
                {isElab && (
                  <span style={{ fontSize: '0.8rem', color: '#3f64ae', fontWeight: 600 }}>
                    {showCustomInput ? (t('hide_text') || 'Hide details') : (t('add_text') || '+ Add details')}
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
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1.5px solid #3f64ae',
                fontSize: '0.94rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
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
              disabled={isSubmitting}
              title="Speak your answer"
            >
              <Mic size={15} />
              <span>{isListening ? t('voice_listening') : t('voice_answer_btn')}</span>
            </button>
            {voiceAnswer && (
              <span style={{ fontSize: '0.82rem', color: '#3f64ae' }}>
                "{voiceAnswer}"
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.92rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            disabled={(!selectedOption && !customText.trim()) || isSubmitting}
            onClick={handleConfirmSelection}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Analyzing answer...</span>
              </>
            ) : (
              <>
                <span>{t('continue_btn')}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skip Question Link */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          disabled={isSubmitting}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.84rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          onClick={handleSkipToResult}
        >
          <span>{t('skip_question')}</span>
          <FastForward size={13} />
        </button>
      </div>
    </div>
  );
};
