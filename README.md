# Love Arbitrage Terminal - Local Deployment

This guide explains how to deploy the **Love Arbitrage** terminal on your local machine.

## Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn
- A Supabase Project (for backend features)

## Setup Instructions

### 1. Clone/Download the Source
Ensure you have all the files from the `/src` directory.

### 2. Environment Variables
Create a file named `.env` in the root directory of your project and paste the following configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xqjszhlmfpxjwkjqrylw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanN6aGxtZnB4andranFyeWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzkxMTEsImV4cCI6MjA4NjY1NTExMX0.aXIGzaWHnI-Wv_PTApLxn14SdgGr56t3IC0NR_j30j8

# Server Function IDs
VITE_PROJECT_ID=xqjszhlmfpxjwkjqrylw

# Edge Function Configuration (Service Role Key for local testing only)
# DO NOT COMMIT THIS KEY TO GITHUB
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Install Dependencies
Run the following command in your terminal:
```bash
npm install
# OR
pnpm install
```

### 4. Run Development Server
```bash
npm run dev
# OR
pnpm run dev
```

## Backend (Supabase Edge Functions)
The application relies on a Hono server running as a Supabase Edge Function. To run this locally:
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Run `supabase start`.
3. Deploy or run functions locally using `supabase functions serve server`.

## Telegram Bot Audio Upload
The server function now includes Telegram bot routes so users can send audio/voice messages and have them uploaded via Bot API.

### Required Edge Function Environment Variables
Set these for the `server` edge function in Supabase:

```env
TELEGRAM_BOT_TOKEN=123456789:your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=choose_a_random_secret_string
TELEGRAM_UPLOAD_CHAT_ID=-1001234567890
TELEGRAM_WEBHOOK_URL=https://<your-project-ref>.supabase.co/functions/v1/server/telegram/webhook
```

- `TELEGRAM_BOT_TOKEN` is required.
- `TELEGRAM_WEBHOOK_SECRET` is optional but strongly recommended.
- `TELEGRAM_UPLOAD_CHAT_ID` is optional. If omitted, uploads stay in the sender chat.
- `TELEGRAM_WEBHOOK_URL` is optional if you pass `webhookUrl` in setup request.

### Setup Webhook
After deploying the `server` function, call:

```bash
curl -X POST "https://<your-project-ref>.supabase.co/functions/v1/server/telegram/setup-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://<your-project-ref>.supabase.co/functions/v1/server/telegram/webhook",
    "dropPendingUpdates": true
  }'
```

### Bot Behavior
- `/start` returns usage instructions.
- Sending `audio` triggers `sendAudio`.
- Sending `voice` triggers `sendVoice`.
- Sending an audio `document` triggers `sendDocument`.
- Messages are uploaded to `TELEGRAM_UPLOAD_CHAT_ID` if set; otherwise they remain in the source chat.

## Access Codes
- **Private Equity Terminal**: `ROMANCE-ALPHA-2026`

## Dynamic Search
The search system in **Friends** and **Private Equity** sections is now dynamic. It will trigger as you type (starting from the first letter) with a 300ms debounce to avoid excessive API calls.

---
*Love Arbitrage Labs © 2026*
