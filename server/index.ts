// server/index.ts - FINAL FIXED VERSION
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in server/.env');
  process.exit(1);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_WS_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

wss.on('connection', (clientWs: WebSocket) => {
  console.log('🎙️ Client connected');

  let openaiWs: WebSocket | null = null;
  let openaiReady = false;
  const audioBuffer: Buffer[] = [];

  openaiWs = new WebSocket(OPENAI_WS_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  openaiWs.on('open', () => {
    console.log('✅ Connected to OpenAI Realtime');

    // 🔥 CRITICAL FIX: Remove 'type' field - it's read-only!
    openaiWs!.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: `You are Ikigai, a compassionate life improvement assistant.
Help the user manage habits, tasks, and daily plans using the Four Pillars:
- mental: meditation, reading, journaling, learning
- physical: exercise, nutrition, sleep, hydration
- social: calling friends, family time, gratitude
- intellectual: volunteering, creative hobbies, nature

ALWAYS use function calls to perform actions. Never assume.
Ask for clarification if time, pillar, or frequency is missing.`,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          voice: 'alloy',
          temperature: 0.8,
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          tools: [
            {
              type: 'function',
              name: 'createTask',
              description: 'Create a new habit or task in the user\'s Ikigai app',
              parameters: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string', 
                    description: 'Task name, e.g., "Meditate" or "Morning run"' 
                  },
                  pillar: { 
                    type: 'string', 
                    enum: ['mental', 'physical', 'social', 'intellectual'],
                    description: 'Which life pillar this task belongs to'
                  },
                  duration: { 
                    type: 'number', 
                    description: 'Duration in minutes (default 30)' 
                  },
                  repeatFrequency: { 
                    type: 'string', 
                    enum: ['once', 'daily', 'custom'],
                    description: 'How often the task repeats'
                  },
                  customDays: {
                    type: 'array',
                    items: { 
                      type: 'string', 
                      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
                    },
                    description: 'Only if repeatFrequency is "custom"'
                  },
                },
                required: ['name', 'pillar'],
              },
            },
            {
              type: 'function',
              name: 'completeTask',
              description: 'Mark a task as completed today',
              parameters: {
                type: 'object',
                properties: {
                  taskId: { type: 'string' },
                },
                required: ['taskId'],
              },
            },
          ],
        },
      })
    );

    console.log('📤 Session configuration sent');

    // Flush buffered audio
    while (audioBuffer.length > 0) {
      const chunk = audioBuffer.shift()!;
      const base64 = chunk.toString('base64');
      openaiWs!.send(
        JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: base64,
        })
      );
    }
    openaiReady = true;
  });

  // Forward audio from client → OpenAI
  clientWs.on('message', (data: Buffer | string) => {
    if (!(data instanceof Buffer)) return;
  
    if (openaiReady && openaiWs?.readyState === WebSocket.OPEN) {
      const base64 = data.toString('base64');
      openaiWs.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64,
      }));
      console.log('📊 Sent audio chunk:', data.length, 'bytes');
    } else {
      audioBuffer.push(data);
    }
  });

  // Forward OpenAI messages → client
  openaiWs.on('message', (data: string | Buffer) => {
    const msgStr = Buffer.isBuffer(data) ? data.toString('utf8') : data;
    if (!msgStr.trim()) return;

    let msg: any;
    try {
      msg = JSON.parse(msgStr);
    } catch (e) {
      console.warn('⚠️ Failed to parse:', msgStr.substring(0, 200));
      return;
    }

    // 🔍 Log important events
    console.log('📥 OpenAI Event:', msg.type);

    // Handle session updates
    if (msg.type === 'session.created' || msg.type === 'session.updated') {
      console.log('✅ Session ready');
      console.log('   Tools configured:', msg.session?.tools?.length || 0);
    }

    // Handle errors
    if (msg.type === 'error') {
      console.error('❌ OpenAI Error:', JSON.stringify(msg.error, null, 2));
    }

    // Handle input audio buffer events
    if (msg.type === 'input_audio_buffer.speech_started') {
      console.log('🎤 Speech detected!');
    }
    if (msg.type === 'input_audio_buffer.speech_stopped') {
      console.log('🛑 Speech stopped - processing...');
    }
    if (msg.type === 'input_audio_buffer.committed') {
      console.log('✅ Audio buffer committed');
    }

    // Handle conversation events
    if (msg.type === 'conversation.item.created') {
      console.log('💬 Item created:', msg.item?.type);
    }

    // Handle transcriptions (for debugging)
    if (msg.type === 'conversation.item.input_audio_transcription.completed') {
      console.log('📝 User said:', msg.transcript);
    }

    // Handle function calls
    if (msg.type === 'response.function_call_arguments.done') {
      console.log('🔧 Function call received:', msg.name);
      console.log('   Arguments:', msg.arguments);
      
      try {
        const args = typeof msg.arguments === 'string' 
          ? JSON.parse(msg.arguments) 
          : msg.arguments;

        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: 'function_call',
              payload: {
                name: msg.name,
                arguments: args,
                callId: msg.call_id,
              },
            })
          );
          console.log('✅ Forwarded function call to client');
        }
      } catch (parseErr) {
        console.error('❌ Failed to parse function arguments:', msg.arguments);
      }
    }

    // Handle responses
    if (msg.type === 'response.done') {
      console.log('✅ Response completed');
      if (msg.response?.output?.[0]?.content?.[0]?.transcript) {
        console.log('🤖 Assistant said:', msg.response.output[0].content[0].transcript);
      }
    }
  });

  openaiWs.on('error', (err: Error) => {
    console.error('❌ OpenAI WebSocket error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({ type: 'error', message: err.message })
      );
    }
  });

  clientWs.on('error', (err: Error) => {
    console.error('❌ Client WebSocket error:', err.message);
  });

  const cleanup = () => {
    openaiReady = false;
    audioBuffer.length = 0;
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
    openaiWs = null;
  };

  clientWs.on('close', cleanup);
  openaiWs.on('close', cleanup);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Voice proxy running on ws://localhost:${PORT}`);
});