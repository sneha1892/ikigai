# 📱 Mobile Deployment Guide for Ikigai Voice Assistant

## 🆓 FREE Hosting Options

### Option 1: Render.com (Recommended - 100% Free)

```bash
# 1. Go to https://render.com
# 2. Sign up with GitHub
# 3. Connect your repository
# 4. Create "New Web Service"
# 5. Configure:
#    - Build Command: cd server && npm ci && npm run build
#    - Start Command: cd server && npm start
#    - Environment: OPENAI_API_KEY=your_key_here
# 6. Deploy!
# 7. Your WebSocket URL: wss://your-app-name.onrender.com
```

### Option 2: Railway.app (Free Tier)

```bash
# 1. Go to https://railway.app
# 2. Sign up with GitHub
# 3. "Deploy from GitHub repo"
# 4. Select your repo
# 5. Set environment variable: OPENAI_API_KEY
# 6. Deploy!
# 7. Your WebSocket URL: wss://your-app-name.up.railway.app
```

### Option 3: Heroku (Free Alternative)

```bash
# 1. Install Heroku CLI
# 2. Login: heroku login
# 3. Create app: heroku create your-voice-server
# 4. Set env: heroku config:set OPENAI_API_KEY=your_key
# 5. Deploy: git push heroku main
# 6. Your WebSocket URL: wss://your-voice-server.herokuapp.com
```

### Option 4: Glitch.com (Easiest)

```bash
# 1. Go to https://glitch.com
# 2. "New Project" → "Import from GitHub"
# 3. Select your repo
# 4. In .env file, add: OPENAI_API_KEY=your_key
# 5. Deploy automatically!
# 6. Your WebSocket URL: wss://your-project.glitch.me
```

## 🚀 Quick Start (5 minutes)

### Step 1: Deploy Voice Server (Choose any free option above)

**I recommend Render.com** - it's the most reliable free option:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. "New Web Service" → Connect your repo
4. Configure:
   - **Build Command**: `cd server && npm ci && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: `OPENAI_API_KEY=your_openai_key_here`
5. Deploy!
6. Copy your URL: `https://your-app-name.onrender.com`
7. Your WebSocket URL: `wss://your-app-name.onrender.com`

### Step 2: Configure Frontend

Create `.env.local` in `ikigai-app/`:
```env
VITE_VOICE_WS_URL=wss://your-app-name.onrender.com
```

### Step 3: Deploy Frontend

**Option A: Vercel (Recommended for mobile)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ikigai-app
vercel --prod

# Set environment variable
vercel env add VITE_VOICE_WS_URL
# Enter: wss://ikigai-voice-server-xxx.fly.dev
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd ikigai-app
npm run build
netlify deploy --prod --dir=dist

# Set environment variable in Netlify dashboard
# VITE_VOICE_WS_URL = wss://ikigai-voice-server-xxx.fly.dev
```

## Mobile-Specific Optimizations

### Voice Service Improvements
- ✅ WebSocket URL configuration via environment
- ✅ HTTPS/WSS enforcement for production
- ✅ Mobile-friendly error messages
- ✅ Connection logging for debugging

### Mobile Testing Checklist
- [ ] Test on actual mobile device (not just browser dev tools)
- [ ] Test on both WiFi and cellular data
- [ ] Test microphone permissions
- [ ] Test voice input/output quality
- [ ] Test background/foreground transitions

### Common Mobile Issues & Solutions

**Issue: "Failed to start - check server"**
- ✅ Fixed: Voice server now properly deployed with health checks
- ✅ Fixed: WebSocket URL properly configured

**Issue: Microphone not working on mobile**
- Check browser permissions (Chrome/Safari)
- Ensure HTTPS (required for microphone access)
- Test in incognito mode to avoid permission issues

**Issue: Audio quality poor on mobile**
- Mobile browsers have different audio processing
- Consider adding mobile-specific audio settings

## Production URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app` (or Netlify URL)
- **Voice Server**: `wss://ikigai-voice-server-xxx.fly.dev`

## Monitoring & Debugging

### Check Voice Server Health
```bash
# Check server status
fly status

# View logs
fly logs

# Check health endpoint
curl https://ikigai-voice-server-xxx.fly.dev/health
```

### Mobile Debugging
1. Open Chrome DevTools on mobile
2. Go to `chrome://inspect` on desktop
3. Connect your phone
4. Check Console for WebSocket connection logs

## 💰 Cost Breakdown

### Voice Server Hosting
- **Render.com**: 100% FREE (750 hours/month)
- **Railway.app**: FREE tier (500 hours/month)
- **Glitch.com**: 100% FREE (always-on)
- **Heroku**: FREE tier available

### Frontend Hosting
- **Vercel**: FREE tier (unlimited personal projects)
- **Netlify**: FREE tier (100GB bandwidth/month)
- **GitHub Pages**: 100% FREE

### Total Cost: $0/month! 🎉

## Security Notes

- ✅ OpenAI API key stored securely in hosting platform secrets
- ✅ HTTPS/WSS enforced
- ✅ No sensitive data in frontend bundle
- ✅ CORS properly configured

## Troubleshooting

### Voice Server Won't Start
```bash
# Check logs (varies by platform):
# Render: Check dashboard logs
# Railway: railway logs
# Glitch: Check console output
# Heroku: heroku logs --tail

# Common issues:
# 1. Missing OPENAI_API_KEY
# 2. Port binding issues (use process.env.PORT)
# 3. Memory limits (free tiers have limits)
```

### Frontend Can't Connect
1. Check `VITE_VOICE_WS_URL` is set correctly
2. Ensure URL uses `wss://` (not `ws://`)
3. Check browser console for errors
4. Verify voice server is running: `fly status`

### Mobile-Specific Issues
1. **HTTPS Required**: Mobile browsers require HTTPS for microphone
2. **Permissions**: User must allow microphone access
3. **Network**: Some corporate WiFi blocks WebSocket connections
4. **Battery**: iOS/Android may throttle background audio processing

## Next Steps

1. **Deploy voice server** (5 min)
2. **Deploy frontend** (5 min)  
3. **Test on mobile** (2 min)
4. **Share with users** 🎉

Your voice assistant will work perfectly on mobile devices once deployed!
