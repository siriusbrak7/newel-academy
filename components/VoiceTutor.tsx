import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const VoiceTutor: React.FC = () => {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported on this browser. Try Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('[VoiceTutor] Heard:', transcript);
      // Future: Send transcript to AI tutor for spoken response
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white transition-all ring-2 ring-white/20 ${listening
          ? 'bg-red-500 animate-pulse'
          : 'bg-gradient-to-br from-purple-500 to-pink-600 hover:scale-110'
        }`}
      title={listening ? 'Listening...' : 'Voice Tutor'}
    >
      {listening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
};

export default VoiceTutor;