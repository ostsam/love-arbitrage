import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enhanced logging
app.use('*', logger(console.log))
app.use('*', cors())

// Error handler
app.onError((err, c) => {
  console.error('SERVER_ERROR:', err)
  return c.json({ error: 'INTERNAL_SERVER_ERROR', message: err.message }, 500)
})

const getSupabase = () => {
  const url = Deno.env.get('SUPABASE_URL') || ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  if (!url || !key) {
    console.error('SUPABASE_CONFIG_MISSING: URL or Key is not set in environment.')
  }
  
  return createClient(url, key)
}

// Helper to handle BOTH prefixed and non-prefixed routes (for robustness across Supabase versions)
const routeHandler = (path: string, handler: any, method: 'get' | 'post' = 'get', useAuth = true) => {
  const fullPath = path.startsWith('/') ? path : `/${path}`
  const prefixedPath = `/make-server-c0ec1358${fullPath}`
  
  const wrappedHandler = async (c: any) => {
    if (useAuth) {
      // Use X-User-Token to bypass potential gateway JWT verification issues
      const userToken = c.req.header('X-User-Token') || c.req.header('Authorization')?.split(' ')[1]
      
      if (!userToken || userToken === Deno.env.get('SUPABASE_ANON_KEY')) {
        return c.json({ error: 'Unauthorized', details: 'Valid user session required' }, 401)
      }
      
      const supabase = getSupabase()
      const { data: { user }, error } = await supabase.auth.getUser(userToken)
      
      if (error || !user) {
        console.error('AUTH_FAILED:', error?.message || 'User not found')
        return c.json({ 
          error: 'Unauthorized', 
          details: error?.message || 'Session invalid or expired',
          hint: 'Please logout and login again to refresh your terminal session.'
        }, 401)
      }
      
      c.set('user', user)
    }
    return handler(c)
  }

  if (method === 'get') {
    app.get(fullPath, wrappedHandler)
    app.get(prefixedPath, wrappedHandler)
  } else {
    app.post(fullPath, wrappedHandler)
    app.post(prefixedPath, wrappedHandler)
  }
}

// Routes
routeHandler('signup', async (c) => {
  const { email, password, name } = await c.req.json()
  const supabase = getSupabase()
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  })
  
  if (error) return c.json({ error: error.message }, 400)
  
  const profile = {
    id: data.user.id,
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    joined: new Date().toISOString(),
    balance: 10000,
    portfolio: [],
    onboarded: false
  }
  
  await kv.set(`user:profile:${data.user.id}`, profile)
  await kv.set(`user:search:email:${email.toLowerCase()}`, { id: data.user.id, name })
  await kv.set(`user:search:name:${name.toLowerCase()}`, { id: data.user.id, name })
  
  return c.json({ user: data.user, profile })
}, 'post', false)

routeHandler('profile', async (c) => {
  const user = c.get('user')
  let profile = await kv.get(`user:profile:${user.id}`)
  
  if (!profile) {
    profile = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous Operator',
      email: user.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      joined: user.created_at || new Date().toISOString(),
      balance: 10000,
      portfolio: [],
      onboarded: false
    }
    await kv.set(`user:profile:${user.id}`, profile)
  }
  return c.json(profile)
})

routeHandler('update-profile', async (c) => {
  const user = c.get('user')
  const { name } = await c.req.json()
  const profile = await kv.get(`user:profile:${user.id}`) || {}
  
  const updatedProfile = {
    ...profile,
    id: user.id,
    name,
    email: user.email,
    onboarded: true
  }
  
  await kv.set(`user:profile:${user.id}`, updatedProfile)
  await kv.set(`user:search:name:${name.toLowerCase()}`, { id: user.id, name })
  
  return c.json(updatedProfile)
}, 'post')

routeHandler('analyze-relationship', async (c) => {
  const { logs, names } = await c.req.json()
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!apiKey) {
    return c.json({
      price: (Math.random() * 100 + 10).toFixed(2),
      volatility: ['HIGH', 'MED', 'LOW', 'EXTREME'][Math.floor(Math.random() * 4)],
      sentiment: Math.random(),
      odds: {
        yes: `${Math.floor(Math.random() * 90 + 5)}%`,
        no: `${Math.floor(Math.random() * 90 + 5)}%`
      },
      chart: Array.from({ length: 20 }, () => Math.random() * 100),
      summary: "Sentiment analysis indicates a high probability of friction. Manual bypass active due to missing API key."
    })
  }

  const prompt = `Analyze relationship between ${names}. logs: ${logs}. Return JSON: {price:0-200, volatility:string, sentiment:0-1, odds:{yes:string, no:string}, chart:number[], summary:string}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text
    return c.json(JSON.parse(content))
  } catch (err) {
    return c.json({ error: 'LLM_CRUNCH_FAILED', details: err.message }, 500)
  }
}, 'post')

routeHandler('private-assets', async (c) => {
  const user = c.get('user')
  try {
    const assets = (await kv.getByPrefix(`user:assets:${user.id}:`)) || []
    return c.json(assets)
  } catch (err) {
    return c.json([])
  }
})

routeHandler('save-private-asset', async (c) => {
  const user = c.get('user')
  const asset = await c.req.json()
  const key = `user:assets:${user.id}:${asset.symbol}`
  await kv.set(key, asset)
  return c.json({ success: true })
}, 'post')

routeHandler('search-users', async (c) => {
  const query = c.req.query('q')?.toLowerCase()
  if (!query) return c.json([])
  const emailResults = (await kv.getByPrefix(`user:search:email:${query}`)) || []
  const nameResults = (await kv.getByPrefix(`user:search:name:${query}`)) || []
  const results = [...emailResults, ...nameResults]
  const uniqueIds = new Set()
  const finalResults = []
  for (const res of results) {
    if (res && res.id && !uniqueIds.has(res.id)) {
      uniqueIds.add(res.id)
      const fullProfile = await kv.get(`user:profile:${res.id}`)
      if (fullProfile) finalResults.push(fullProfile)
    }
  }
  return c.json(finalResults)
})

routeHandler('friends', async (c) => {
  const user = c.get('user')
  const friendIds = (await kv.get(`user:friends:${user.id}`)) || []
  const friendProfiles = await Promise.all(friendIds.map(id => kv.get(`user:profile:${id}`)))
  return c.json(friendProfiles.filter(Boolean))
})

routeHandler('add-friend', async (c) => {
  const user = c.get('user')
  const { friendId } = await c.req.json()
  const friends = (await kv.get(`user:friends:${user.id}`)) || []
  if (!friends.includes(friendId)) {
    friends.push(friendId)
    await kv.set(`user:friends:${user.id}`, friends)
  }
  return c.json({ success: true })
}, 'post')

Deno.serve(app.fetch)
