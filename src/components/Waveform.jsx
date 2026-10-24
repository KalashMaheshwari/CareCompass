import React from 'react';

export const Waveform = ({ isListening = false }) => {
  return (
    <div className={`waveform-bars ${isListening ? 'listening' : ''}`} aria-hidden="true">
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
      <div className="waveform-bar"></div>
    </div>
  );
};
