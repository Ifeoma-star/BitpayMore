# BitPay WebSocket Server

Standalone WebSocket server for real-time blockchain event broadcasting.

## Quick Start

```bash
npm install
npm start
```

## Deploy to Render

1. Push this directory to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Render will auto-detect the `render.yaml` config
5. Add environment variable `ALLOWED_ORIGINS` with your Vercel frontend URL
6. Deploy!

## Environment Variables

- `PORT` - Server port (default: 4000, Render uses 10000)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `NODE_ENV` - Environment (production/development)

## Endpoints

- `GET /health` - Health check
- `POST /broadcast` - Trigger WebSocket broadcasts (called from your Next.js API routes)

## Broadcast Format

```json
{
  "type": "user|stream|marketplace|global",
  "target": "wallet-address-or-stream-id",
  "event": "event-name",
  "payload": { ... }
}
```
