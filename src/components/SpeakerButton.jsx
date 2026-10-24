import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services/speech';
import { useApp } from '../context/AppContext';

export const SpeakerButton = ({ text = '', size = 20, className = '' }) => {
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
      speechService.speak(text, {
        language: language === 'hi' ? 'hi' : 'en',
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false)
      });
    }
  };

  return (
    <button
      type="button"
      className={`icon-btn ${isPlaying ? 'active' : ''} ${className}`}
      onClick={handleToggle}
      aria-label={isPlaying ? 'Stop speaking' : 'Read aloud'}
      title={isPlaying ? 'Stop' : 'Read aloud'}
    >
      {isPlaying ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
};
