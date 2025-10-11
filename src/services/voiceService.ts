// src/services/voiceService.ts - WITH AUDIO PLAYBACK
import { startAudioCapture, stopAudioCapture } from './audioCapture';
import { initAudioPlayback, playAudioChunk, stopAudioPlayback, closeAudioPlayback } from './audioPlayback';

let ws: WebSocket | null = null;
let onFunctionCall: ((call: any) => void) | null = null;

export const connectVoiceAssistant = (handleFunctionCall: (call: any) => void) => {
  onFunctionCall = handleFunctionCall;
  
  // Initialize audio playback
  initAudioPlayback();

  return new Promise<void>((resolve, reject) => {
    // For Firebase hosting (no env vars on free plan)
    const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    
    const targetUrl = isProduction 
      ? 'wss://ikigai-iz5b.onrender.com'  // Production voice server
      : 'ws://localhost:3001';             // Local development

    // targetUrl is always defined now

    console.log('🔗 Connecting to voice server:', targetUrl);
    ws = new WebSocket(targetUrl);

    ws.onopen = () => {
      console.log('✅ Connected to voice server');
      resolve();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 🔍 DEBUG: Log all message types
      if (!data.type.includes('audio.delta')) {
        console.log('📨 Voice message:', data.type);
      }
      
      // Handle audio chunks from OpenAI
      if (data.type === 'response.audio.delta' && data.delta) {
        console.log('🔊 Playing audio chunk, size:', data.delta.length);
        playAudioChunk(data.delta);
      }
      // Handle function calls from OpenAI
      else if (data.type === 'response.function_call_arguments.done') {
        try {
          const args = typeof data.arguments === 'string' 
            ? JSON.parse(data.arguments) 
            : data.arguments;
          
          console.log('🔧 Function call:', data.name, 'with call_id:', data.call_id);
          
          // Execute the function locally
          onFunctionCall?.({
            name: data.name,
            arguments: args,
            callId: data.call_id,
          });
          
          // 🔥 IMPORTANT: Send function output back to OpenAI to trigger audio response
          if (ws?.readyState === WebSocket.OPEN && data.call_id) {
            const functionOutput = {
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: data.call_id,
                output: JSON.stringify({ success: true, message: `Task ${data.name} completed successfully` })
              }
            };
            console.log('📤 Sending function output back to OpenAI');
            ws.send(JSON.stringify(functionOutput));
            
            // Trigger a new response to get audio feedback
            ws.send(JSON.stringify({ type: 'response.create' }));
          }
        } catch (err) {
          console.error('Failed to parse function call arguments:', err);
        }
      } 
      // Handle errors
      else if (data.type === 'error') {
        console.error('Voice error:', data.message);
      } 
      // Handle transcripts
      else if (data.type === 'response.audio_transcript.done') {
        console.log('🤖 Assistant said:', data.transcript);
      }
      // Handle response created (prepare for new audio)
      else if (data.type === 'response.created') {
        console.log('🎙️ New response starting');
        stopAudioPlayback(); // Clear any previous audio and reset for fast playback
      }
      // Handle response done
      else if (data.type === 'response.audio.done') {
        console.log('✅ Audio response completed');
      }
      // Handle response output item added
      else if (data.type === 'response.output_item.added') {
        console.log('📤 Output item added:', data.item?.type);
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
  stopAudioPlayback();
  if (ws) {
    ws.close();
    ws = null;
  }
  closeAudioPlayback();
};