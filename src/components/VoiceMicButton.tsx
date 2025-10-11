// src/components/VoiceMicButton.tsx
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { connectVoiceAssistant, startListening, stopVoiceAssistant } from '../services/voiceService';
import { toastService } from '../services/toastService';

interface VoiceMicButtonProps {
  onFunctionCall: (call: any) => void;
}

const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({ onFunctionCall }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopVoiceAssistant();
      }
    };
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopVoiceAssistant();
      setIsRecording(false);
    } else {
      setIsConnecting(true);
      try {
        await connectVoiceAssistant(onFunctionCall);
        await startListening();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start voice assistant:', error);
        toastService.error('Voice Assistant', 'Failed to start. Check server.');
      } finally {
        setIsConnecting(false);
      }
    }
  };

  let Icon = Mic;
  if (isConnecting) Icon = Loader;
  else if (isRecording) Icon = MicOff;

  return (
    <button
      className="md-fab elevation-2"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '70px',
        backgroundColor: isRecording ? '#EF4444' : '#10B981',
        color: 'white',
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1001,   
      }}
      onClick={toggleRecording}
      disabled={isConnecting}
      aria-label={isRecording ? 'Stop listening' : 'Start voice assistant'}
    >
      <Icon size={24} className={isConnecting ? 'animate-spin' : ''} />
    </button>
  );
};

export default VoiceMicButton;