import React, { useState } from 'react';
import { Phone, MessageSquare, Mic, Play, Pause, Send, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speech';
import { runTriage } from '../services/triageEngine';

export const CallSimPage = () => {
  const { t, language } = useApp();
  const [activeChannel, setActiveChannel] = useState('call');

  // --- Voice Call Simulation State ---
  const [callStep, setCallStep] = useState(0); // 0: Idle, 1: IVR Lang, 2: Listening, 3: Spoken Result
  const [callLang, setCallLang] = useState('hi');
  const [callResult, setCallResult] = useState(null);

  const startPhoneCall = () => {
    setCallStep(1);
    speechService.speak('केयरकम्पास में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। For English, press 2.', {
      language: 'hi'
    });
  };

  const handlePressKey = (key) => {
    if (callStep === 1) {
      if (key === '1') {
        setCallLang('hi');
        setCallStep(2);
        speechService.speak('कृपया अपनी बीमारी या समस्या के बारे में बोलिए। हम सुन रहे हैं।', {
          language: 'hi'
        });
      } else {
        setCallLang('en');
        setCallStep(2);
        speechService.speak('Please describe the health issue in your own words. We are listening.', {
          language: 'en'
        });
      }
    }
  };

  const handleSimulateUserSpeech = async (speechText) => {
    setCallStep(3);
    const triage = await runTriage({
      user_input: speechText,
      language: callLang
    });
    setCallResult(triage);

    const spokenOutput = callLang === 'hi'
      ? `आपके लक्षणों के अनुसार, ${triage.care_type === 'nurse' ? 'एक नर्स आज आपके घर आकर जाँच करेंगी' : 'पैरामेडिक टीम सहायता के लिए उपलब्ध है'}। यदि साँस में तकलीफ़ हो तो तुरंत 112 डायल करें।`
      : `Based on your symptoms, a nurse can visit you at home today. Call 112 immediately if breathing becomes difficult.`;

    speechService.speak(spokenOutput, { language: callLang });
  };

  const hangUpCall = () => {
    speechService.stopSpeaking();
    setCallStep(0);
    setCallResult(null);
  };

  // --- WhatsApp Simulation State ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to CareCompass WhatsApp Care Routing. You can type or send voice descriptions in Hindi, English, or Hinglish.',
      time: '10:00 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput('');

    const response = await runTriage({
      user_input: currentInput,
      language: 'auto'
    });

    let botReply = `🩺 *${response.urgency === 'immediate' ? 'CRITICAL DISPATCH ESCALATION' : 'Recommended Care Pathway'}*\n\n` +
      `Recommended Care: *${(response.care_type || 'nurse').toUpperCase().replace('_', ' ')}*\n` +
      `Urgency Level: *${(response.urgency || 'same_day').toUpperCase()}*\n\n` +
      `${response.reasoning}\n\n` +
      `⚠️ *Safety Net:* If breathing becomes difficult or acute chest pain occurs, dial 112 immediately.`;

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>
          Multichannel Triage Simulator
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Demonstrates reach to feature-phone and low-literacy users via automated Toll-Free IVR and verified WhatsApp Chatbot channels.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          className={`btn ${activeChannel === 'call' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            speechService.stopSpeaking();
            setActiveChannel('call');
          }}
        >
          <Phone size={18} />
          <span>Interactive Automated IVR (1800-CARE)</span>
        </button>
        <button
          type="button"
          className={`btn ${activeChannel === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            speechService.stopSpeaking();
            setActiveChannel('whatsapp');
          }}
        >
          <MessageSquare size={18} />
          <span>WhatsApp Care Dispatch Bot</span>
        </button>
      </div>

      {/* IVR SIMULATOR */}
      {activeChannel === 'call' && (
        <div className="surface-card" style={{ background: '#133b70', color: '#ffffff', padding: '36px 24px', textAlign: 'center', borderColor: '#1e293b' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            CareCompass Automated Toll-Free Telephony Gateway
          </div>

          {callStep === 0 && (
            <div style={{ margin: '36px 0' }}>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)' }}>
                <Phone size={34} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '6px' }}>Feature Phone Tele-Triage</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Simulate a patient or elderly family member dialing into the automated voice routing server from a basic keypad phone.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ background: '#10b981' }}
                onClick={startPhoneCall}
              >
                <span>Initiate Call (Dial 1800-CARE)</span>
              </button>
            </div>
          )}

          {callStep === 1 && (
            <div style={{ margin: '24px 0' }}>
              <div style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '18px', lineHeight: 1.5 }}>
                🔊 "केयरकम्पास में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। For English, press 2."
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '240px', margin: '0 auto 20px auto' }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                  <button
                    key={key}
                    type="button"
                    className="btn btn-secondary"
                    style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155', minHeight: '48px', fontSize: '1.2rem', fontWeight: 700 }}
                    onClick={() => handlePressKey(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-danger" onClick={hangUpCall}>
                End Call
              </button>
            </div>
          )}

          {callStep === 2 && (
            <div style={{ margin: '24px 0' }}>
              <div style={{ fontSize: '1.05rem', color: '#38bdf8', marginBottom: '16px' }}>
                🔊 "कृपया अपनी समस्या के बारे में बोलें। हम सुन रहे हैं..."
              </div>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '14px' }}>
                Simulate caller describing their situation:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '480px', margin: '0 auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateUserSpeech('Papa ko do din se bukhar hai aur khansi bhi')}
                >
                  <span>"Papa ko do din se bukhar hai aur khansi bhi"</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ background: '#1e293b', color: '#ffffff', borderColor: '#ef4444', fontSize: '0.9rem', justifyContent: 'flex-start' }}
                  onClick={() => handleSimulateUserSpeech('Saans nahi aa rahi, behosh ho rahe hain')}
                >
                  <span style={{ color: '#fca5a5' }}>"Saans nahi aa rahi, behosh ho rahe hain" (Emergency)</span>
                </button>
              </div>
              <button type="button" className="btn btn-danger" style={{ marginTop: '22px' }} onClick={hangUpCall}>
                End Call
              </button>
            </div>
          )}

          {callStep === 3 && callResult && (
            <div style={{ margin: '20px auto', maxWidth: '520px', textAlign: 'left', background: '#1e293b', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Automated Voice Synthesizer Response:
              </span>
              <p style={{ fontSize: '1rem', color: '#ffffff', marginTop: '6px', lineHeight: 1.55 }}>
                {callLang === 'hi'
                  ? `आपके लक्षणों के अनुसार, ${callResult.care_type === 'nurse' ? 'एक नर्स आज आपके घर आकर जाँच करेंगी' : 'पैरामेडिक टीम सहायता के लिए उपलब्ध है'}।`
                  : `A nurse can visit you at home today based on your reported symptoms.`}
              </p>
              <div style={{ marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                <button type="button" className="btn btn-danger btn-block" onClick={hangUpCall}>
                  Terminate Call
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WHATSAPP SIMULATOR */}
      {activeChannel === 'whatsapp' && (
        <div className="surface-card" style={{ background: '#efeae2', padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div style={{ background: '#075e54', color: '#ffffff', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#128c7e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
              🧭
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>CareCompass Health Navigator</div>
              <div style={{ fontSize: '0.76rem', color: '#dcf8c6' }}>Online · Verified Dispatch Integration</div>
            </div>
          </div>

          <div style={{ padding: '20px', minHeight: '300px', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#dcf8c6' : '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  maxWidth: '78%',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-line'
                }}
              >
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'right', marginTop: '4px' }}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} style={{ background: '#f0f0f0', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minHeight: '44px', borderRadius: '24px', background: '#ffffff', border: 'none', padding: '0 18px' }}
              placeholder="Send message in Hindi, English, or Hinglish..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minHeight: '44px', width: '44px', borderRadius: '50%', padding: 0, background: '#128c7e' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
