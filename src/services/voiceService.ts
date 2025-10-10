// src/services/voiceService.ts - WITH MANUAL COMMIT
import { startAudioCapture, stopAudioCapture } from './audioCapture';

let ws: WebSocket | null = null;
let onFunctionCall: ((call: any) => void) | null = null;

export const connectVoiceAssistant = (handleFunctionCall: (call: any) => void) => {
  onFunctionCall = handleFunctionCall;

  return new Promise<void>((resolve, reject) => {
    ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('✅ Connected to voice server');
      resolve();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'function_call') {
        onFunctionCall?.(data.payload);
      } else if (data.type === 'error') {
        console.error('Voice error:', data.message);
      } else if (data.type === 'transcript') {
        console.log('📝 Transcript:', data.text);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      reject(err);
    };
  });
};

export const startListening = () => {
  if (!ws) throw new Error('Not connected');
  console.log('🔊 Starting audio capture');
  return startAudioCapture((audioChunk) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(audioChunk);
    }
  });
};

// 🔥 NEW: Manual commit when user stops speaking
export const commitAudioBuffer = () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('Not connected');
  }
  
  console.log('✋ Committing audio buffer manually');
  ws.send(JSON.stringify({ type: 'commit_audio' }));
};

export const stopVoiceAssistant = () => {
  stopAudioCapture();
  if (ws) {
    ws.close();
    ws = null;
  }
};