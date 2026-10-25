import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square } from 'lucide-react';
import { speechService } from '../services/speech';
import { useApp } from '../context/AppContext';

export const SpeakerButton = ({
  text = '',
  size = 18,
  showLabel = false,
  variant = 'default', // 'default' | 'pill' | 'emergency'
  className = '',
  title = null
}) => {
  const { language } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        speechService.stopSpeaking();
      }
    };
  }, [isPlaying]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stopSpeaking();
      setIsPlaying(false);
    } else {
      if (!text || !text.trim()) return;
      speechService.speak(text, {
        language: language === 'hi' ? 'hi' : 'en',
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false)
      });
    }
  };

  const getLabel = () => {
    if (isPlaying) {
      if (language === 'hi') return 'रोकें';
      if (language === 'hinglish') return 'Rokein';
      return 'Stop';
    }
    if (language === 'hi') return 'सुनें';
    if (language === 'hinglish') return 'Sunein';
    return 'Listen';
  };

  const isEmergency = variant === 'emergency';
  const isPill = showLabel || variant === 'pill';

  return (
    <>
      <style>{`
        .tts-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 9999px;
          border: 1px solid var(--tts-border, rgba(37, 99, 235, 0.2));
          background: var(--tts-bg, #ffffff);
          color: var(--tts-color, #2563eb);
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          font-weight: 600;
          line-height: 1;
          padding: var(--tts-padding, 7px 12px);
          cursor: pointer;
          user-select: none;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          outline: none;
        }

        .tts-btn.is-icon-only {
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 50%;
        }

        .tts-btn:hover {
          transform: translateY(-1.5px);
          border-color: var(--tts-hover-border, #2563eb);
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.18);
          background: var(--tts-hover-bg, #f8fafc);
        }

        .tts-btn:active {
          transform: translateY(0) scale(0.96);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .tts-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
        }

        /* Playing state */
        .tts-btn.is-playing {
          background: var(--tts-active-bg, #eff6ff);
          border-color: var(--tts-active-border, #3b82f6);
          color: var(--tts-active-color, #1d4ed8);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 4px 14px -1px rgba(37, 99, 235, 0.22);
          animation: tts-pulse 2.2s infinite ease-in-out;
        }

        /* Emergency theme */
        .tts-btn.is-emergency {
          --tts-border: rgba(220, 38, 38, 0.25);
          --tts-color: #dc2626;
          --tts-bg: #fff5f5;
          --tts-hover-border: #dc2626;
          --tts-hover-bg: #fee2e2;
          --tts-active-bg: #fef2f2;
          --tts-active-border: #ef4444;
          --tts-active-color: #b91c1c;
        }

        .tts-btn.is-emergency.is-playing {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2), 0 4px 14px -1px rgba(220, 38, 38, 0.28);
        }

        /* Equalizer Soundwave Animation */
        .tts-equalizer {
          display: inline-flex;
          align-items: center;
          gap: 2.5px;
          height: 14px;
        }

        .tts-equalizer span {
          display: inline-block;
          width: 2.5px;
          height: 100%;
          background: currentColor;
          border-radius: 99px;
          animation: tts-equalize 1s infinite ease-in-out;
          transform-origin: bottom;
        }

        .tts-equalizer span:nth-child(1) { animation-delay: 0.1s; height: 40%; }
        .tts-equalizer span:nth-child(2) { animation-delay: 0.3s; height: 95%; }
        .tts-equalizer span:nth-child(3) { animation-delay: 0.15s; height: 65%; }

        @keyframes tts-equalize {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        @keyframes tts-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 4px 14px -1px rgba(37, 99, 235, 0.22); }
          50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.28), 0 6px 18px -1px rgba(37, 99, 235, 0.3); }
        }
      `}</style>

      <button
        type="button"
        className={`tts-btn ${!isPill ? 'is-icon-only' : ''} ${isPlaying ? 'is-playing' : ''} ${isEmergency ? 'is-emergency' : ''} ${className}`}
        onClick={handleToggle}
        aria-label={isPlaying ? 'Stop audio' : 'Listen to text'}
        aria-pressed={isPlaying}
        title={title || (isPlaying ? 'Click to stop reading' : 'Click to listen aloud')}
      >
        {isPlaying ? (
          <>
            <div className="tts-equalizer" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            {isPill && <span>{getLabel()}</span>}
          </>
        ) : (
          <>
            <Volume2 size={size} strokeWidth={2.2} />
            {isPill && <span>{getLabel()}</span>}
          </>
        )}
      </button>
    </>
  );
};

export default SpeakerButton;
