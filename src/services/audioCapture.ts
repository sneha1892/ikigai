// src/services/audioCapture.ts
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let resampler: ScriptProcessorNode | null = null;

// Resample from inputSampleRate → 24000 Hz
function resampleBuffer(buffer: Float32Array, inputSampleRate: number): Int16Array {
  const outputSampleRate = 24000;
  if (inputSampleRate === outputSampleRate) {
    return float32ToInt16(buffer);
  }

  const ratio = inputSampleRate / outputSampleRate;
  const outputLength = Math.floor(buffer.length / ratio);
  const outputBuffer = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = Math.floor(i * ratio);
    outputBuffer[i] = buffer[srcIndex];
  }

  return float32ToInt16(outputBuffer);
}

function float32ToInt16(buffer: Float32Array): Int16Array {
  const int16Buffer = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    int16Buffer[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return int16Buffer;
}

export const startAudioCapture = (onAudioChunk: (buffer: ArrayBuffer) => void) => {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaStream = stream;
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    sourceNode = audioContext.createMediaStreamSource(stream);

    // Create resampler to 24kHz
    const inputSampleRate = audioContext.sampleRate;
    const bufferSize = 4096;
    resampler = audioContext.createScriptProcessor(bufferSize, 1, 1);

    resampler.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const int16 = resampleBuffer(inputData, inputSampleRate);
      onAudioChunk(int16.buffer as ArrayBuffer);
    };

    sourceNode.connect(resampler);
    resampler.connect(audioContext.destination);
    return audioContext.resume();
  });
};

export const stopAudioCapture = () => {
  if (resampler) {
    resampler.disconnect();
    resampler = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};