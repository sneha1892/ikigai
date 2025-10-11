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

  const openaiWebSocket = new WebSocket(OPENAI_WS_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });
  openaiWs = openaiWebSocket;

  openaiWebSocket.on('open', () => {
    console.log('✅ Connected to OpenAI Realtime');

    // 🔥 CRITICAL FIX: Remove 'type' field - it's read-only!
    openaiWebSocket.send(
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

AVAILABLE ACTIONS:
- Create new habits/tasks with createTask (ALWAYS set startTime and challengeDuration for habits)
- Delete habits/tasks with deleteTask (when user says "delete", "remove", "get rid of")
- Mark tasks complete with completeTask

IMPORTANT: For daily/custom habits, ALWAYS set:
- startTime (required for day plan scheduling)
- challengeDuration (default: 7 days for most habits)

ALWAYS use function calls to perform actions. Never assume.

TIME EXTRACTION RULES:
- When user says "at 10 am" → startTime: "10:00"
- When user says "at 2:30 pm" → startTime: "14:30"
- When user says "at 6 pm" → startTime: "18:00"
- When user says "in the morning" → startTime: "09:00"
- When user says "in the afternoon" → startTime: "14:00"
- When user says "in the evening" → startTime: "18:00"
- Always convert AM/PM to 24-hour format
- If no time mentioned for a scheduled habit, ask for clarification

Ask for clarification if time, pillar, or frequency is missing when creating tasks.`,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          voice: 'alloy',
          temperature: 0.7,
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 700,
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
                  startTime: {
                    type: 'string',
                    description: 'Start time in 24-hour format HH:MM (e.g., "10:00" for 10 AM, "14:30" for 2:30 PM). Extract from user speech like "at 10 am" or "at 2:30 pm".'
                  },
                  duration: { 
                    type: 'number', 
                    description: 'Duration in minutes (default 30)' 
                  },
                  challengeDuration: {
                    type: 'number',
                    enum: [3, 7, 21, 66],
                    description: 'Habit challenge duration in days. Default is 7 for most habits. Use 21 for medium-term goals, 66 for long-term habit formation.'
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
            {
              type: 'function',
              name: 'deleteTask',
              description: 'Delete a task or habit from the user\'s list. Use when user says "delete", "remove", or "get rid of" a habit.',
              parameters: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    description: 'The name of the task/habit to delete. Match this with existing task names.'
                  },
                },
                required: ['name'],
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
      openaiWebSocket.send(
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
  openaiWebSocket.on('message', (data: string | Buffer) => {
    const msgStr = Buffer.isBuffer(data) ? data.toString('utf8') : data;
    if (!msgStr.trim()) return;

    let msg: any;
    try {
      msg = JSON.parse(msgStr);
    } catch (e) {
      console.warn('⚠️ Failed to parse:', msgStr.substring(0, 200));
      return;
    }

    // 🔍 Log important events (less verbose for audio deltas)
    if (!msg.type.includes('audio.delta') && !msg.type.includes('audio_transcript.delta')) {
      console.log('📥 OpenAI Event:', msg.type);
    }

    // 🔥 FORWARD ALL MESSAGES TO CLIENT (especially audio!)
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(msgStr);
    }

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
      if (msg.item?.type === 'message') {
        console.log('   Role:', msg.item?.role);
      }
    }
    
    // Handle response creation
    if (msg.type === 'response.created') {
      console.log('🎤 Response starting, status:', msg.response?.status);
    }

    // Handle transcriptions (for debugging)
    if (msg.type === 'conversation.item.input_audio_transcription.completed') {
      console.log('📝 User said:', msg.transcript);
    }

    // Handle function calls (for logging - already forwarded above)
    if (msg.type === 'response.function_call_arguments.done') {
      console.log('🔧 Function call received:', msg.name);
      console.log('   Arguments:', msg.arguments);
    }

    // Handle audio output
    if (msg.type === 'response.audio.delta') {
      // Only log first chunk to avoid spam
      if (!msg._logged) {
        console.log('🔊 Audio playback started');
        msg._logged = true;
      }
    }
    
    // Handle responses
    if (msg.type === 'response.done') {
      console.log('✅ Response completed');
      console.log('   Status:', msg.response?.status);
      
      // Try to find transcript in multiple locations
      const output = msg.response?.output;
      if (output && output.length > 0) {
        for (const item of output) {
          if (item.type === 'message' && item.content) {
            for (const content of item.content) {
              if (content.type === 'audio' && content.transcript) {
                console.log('🤖 Assistant said:', content.transcript);
                break;
              }
            }
          }
        }
      }
    }
  });

  openaiWebSocket.on('error', (err: Error) => {
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
    if (openaiWebSocket && openaiWebSocket.readyState === WebSocket.OPEN) {
      openaiWebSocket.close();
    }
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
    openaiWs = null;
  };

  clientWs.on('close', cleanup);
  openaiWebSocket.on('close', cleanup);
});

// Health check endpoint for mobile deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ikigai-voice-server'
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Voice proxy running on port ${PORT}`);
  console.log(`📱 Mobile-ready WebSocket: wss://${process.env.FLY_APP_NAME || 'localhost'}.fly.dev`);
});