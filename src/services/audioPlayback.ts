// src/services/audioPlayback.ts - Plays PCM16 audio from OpenAI Realtime API
let audioContext: AudioContext | null = null;
let audioQueue: AudioBufferSourceNode[] = [];
let nextStartTime = 0;
let isFirstChunk = true;

export const initAudioPlayback = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    nextStartTime = audioContext.currentTime;
    isFirstChunk = true;
  }
};

export const playAudioChunk = (base64Audio: string) => {
  if (!audioContext) {
    initAudioPlayback();
  }

  try {
    // Decode base64 to Int16Array (PCM16)
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);

    // Convert Int16 PCM to Float32 for Web Audio API
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0; // Normalize to [-1, 1]
    }

    // Create audio buffer (24kHz mono as per OpenAI spec)
    const audioBuffer = audioContext!.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    // Create and schedule buffer source
    const source = audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext!.destination);

    // Schedule playback to maintain continuity
    const now = audioContext!.currentTime;
    
    // 🔥 REDUCED LATENCY: Start immediately on first chunk, minimal buffering
    if (isFirstChunk) {
      nextStartTime = now + 0.05; // Only 50ms delay for first chunk
      isFirstChunk = false;
    }
    
    const startTime = Math.max(now, nextStartTime);
    source.start(startTime);
    
    // Update next start time
    nextStartTime = startTime + audioBuffer.duration;
    
    audioQueue.push(source);

    // Clean up after playback
    source.onended = () => {
      const index = audioQueue.indexOf(source);
      if (index > -1) {
        audioQueue.splice(index, 1);
      }
    };
  } catch (error) {
    console.error('Error playing audio chunk:', error);
  }
};

export const stopAudioPlayback = () => {
  // Stop all queued audio
  audioQueue.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Ignore if already stopped
    }
  });
  audioQueue = [];
  
  // Reset timing
  if (audioContext) {
    nextStartTime = audioContext.currentTime;
  }
  
  // Reset first chunk flag for next response
  isFirstChunk = true;
};

export const closeAudioPlayback = () => {
  stopAudioPlayback();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};

