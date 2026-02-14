import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', logger(console.log))
app.use('*', cors())

// Helper to get Supabase client
const getSupabase = (c: any) => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// Routes prefixed with /make-server-c0ec1358
const routes = app.basePath('/make-server-c0ec1358')

routes.get('/market-data', async (c) => {
  try {
    const data = await kv.getByPrefix('market:')
    if (data.length === 0) {
      // Seed data if empty
      const initialData = {
        'market:$TAY-TRAV': { symbol: '$TAY-TRAV', price: 42.50, change: 2.4 },
        'market:$BEN-JEN': { symbol: '$BEN-JEN', price: 12.15, change: -15.2 },
      }
      for (const [key, val] of Object.entries(initialData)) {
        await kv.set(key, val)
      }
      return c.json(Object.values(initialData))
    }
    return c.json(data)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

routes.post('/place-bet', async (c) => {
  const body = await c.req.json()
  const { symbol, side, amount, userId } = body
  
  const betKey = `bet:${userId}:${Date.now()}`
  await kv.set(betKey, { symbol, side, amount, timestamp: Date.now() })
  
  return c.json({ success: true, message: `Position ${side.toUpperCase()} opened on ${symbol}` })
})

Deno.serve(app.fetch)
