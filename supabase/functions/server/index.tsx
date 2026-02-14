import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Diagnostic root route
app.get('/', (c) => c.json({ status: 'TERMINAL_ONLINE', version: '2.0.4' }))

// Middleware
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
  return createClient(url, key)
}

// Market Data Utility (defined early)
const calculateAndUpdateGli = async () => {
  let assets = await kv.getByPrefix('market:asset:')
  let scaledValue = 3500;
  
  if (assets && assets.length > 0) {
    const totalValue = assets.reduce((sum: number, a: any) => sum + parseFloat(a.price || 0), 0)
    const averageValue = totalValue / assets.length
    scaledValue = parseFloat((averageValue * 75).toFixed(2))
  }
  
  let history = await kv.get('market:gli:history') || []
  if (history.length === 0) {
    history = Array.from({ length: 48 }, (_, i) => ({
      time: `${Math.floor(i/2).toString().padStart(2, '0')}:${(i%2)*30 || '00'}`,
      value: parseFloat((scaledValue - 100 + (i/48)*100 + (Math.random()-0.5)*20).toFixed(2)),
      timestamp: Date.now() - (50 - i) * 1800000
    }))
  }

  const newEntry = {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: scaledValue,
    timestamp: Date.now()
  }
  
  await kv.set('market:gli:history', [...history, newEntry].slice(-100))
}

// Helper to handle BOTH prefixed and non-prefixed routes
const routeHandler = (path: string, handler: any, method: 'get' | 'post' = 'get', useAuth = true) => {
  const fullPath = path.startsWith('/') ? path : `/${path}`
  const prefixedPath = `/make-server-c0ec1358${fullPath}`
  
  const wrappedHandler = async (c: any) => {
    if (useAuth) {
      const userToken = c.req.header('X-User-Token') || c.req.header('Authorization')?.split(' ')[1]
      
      if (!userToken || userToken === Deno.env.get('SUPABASE_ANON_KEY')) {
        return c.json({ error: 'Unauthorized', details: 'Valid user session required' }, 401)
      }
      
      const supabase = getSupabase()
      const { data: { user }, error } = await supabase.auth.getUser(userToken)
      
      if (error || !user) {
        return c.json({ error: 'Unauthorized', details: error?.message || 'Session invalid' }, 401)
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

// Auth Routes
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

// Financial Routes
routeHandler('deposit', async (c) => {
  const user = c.get('user')
  const { amount } = await c.req.json()
  const profile = await kv.get(`user:profile:${user.id}`)
  
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  
  profile.balance = (profile.balance || 0) + Number(amount)
  await kv.set(`user:profile:${user.id}`, profile)
  
  return c.json({ success: true, balance: profile.balance })
}, 'post')

routeHandler('place-bet', async (c) => {
  const user = c.get('user')
  const { asset, betType, amount, question, odds } = await c.req.json()
  const profile = await kv.get(`user:profile:${user.id}`)
  
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  if (profile.balance < amount) return c.json({ error: 'Insufficient liquidity in terminal' }, 400)
  
  const bet = {
    id: `BET_${Date.now()}`,
    symbol: asset.symbol,
    names: asset.names,
    side: betType,
    amount,
    price: asset.price,
    question,
    odds,
    status: 'OPEN',
    timestamp: new Date().toISOString(),
    pnl: '$0.00',
    pnlUp: true
  }
  
  profile.balance -= amount
  profile.portfolio = [bet, ...(profile.portfolio || [])]
  
  await kv.set(`user:profile:${user.id}`, profile)
  
  return c.json({ success: true, profile })
}, 'post')

routeHandler('sell-bet', async (c) => {
  const user = c.get('user')
  const { betId } = await c.req.json()
  const profile = await kv.get(`user:profile:${user.id}`)
  
  if (!profile || !profile.portfolio) return c.json({ error: 'Profile or portfolio not found' }, 404)
  
  const betIndex = profile.portfolio.findIndex((b: any) => b.id === betId)
  if (betIndex === -1) return c.json({ error: 'Position not found' }, 404)
  
  const bet = profile.portfolio[betIndex]
  const liquidationValue = Number(bet.amount)
  
  profile.balance += liquidationValue
  profile.portfolio.splice(betIndex, 1)
  
  await kv.set(`user:profile:${user.id}`, profile)
  
  return c.json({ success: true, balance: profile.balance, portfolio: profile.portfolio })
}, 'post')

// Market Data Routes (GLOBAL REALTIME)
routeHandler('get-gli-history', async (c) => {
  let history = await kv.get('market:gli:history') || []
  
  if (history.length === 0) {
    await calculateAndUpdateGli()
    history = await kv.get('market:gli:history') || []
  }
  
  return c.json({ history })
})

routeHandler('get-markets', async (c) => {
  const assets = await kv.getByPrefix('market:asset:')
  if (!assets || assets.length === 0) {
    return c.json({ assets: [], needsSeeding: true })
  }
  
  // Repair assets with missing propBets on the fly
  let repaired = false;
  for (const asset of assets) {
    if (!asset.propBets || asset.propBets.length === 0) {
      asset.propBets = Array.from({ length: 12 }, (_, i) => ({
        id: `repair_prop_${i}_${Date.now()}`,
        question: [
          "Will they be seen together this week?", "Will they post a selfie?", 
          "Will they delete a photo?", "Will a third party intervene?",
          "Will they announce a split?", "Will they get engaged?",
          "Will they go on a trip?", "Will they move house?",
          "Will they attend a red carpet?", "Will they block each other?",
          "Will a family member comment?", "Will they start a business?"
        ][i],
        yesOdds: `${Math.floor(Math.random() * 80 + 10)}%`,
        noOdds: `${Math.floor(Math.random() * 80 + 10)}%`,
        rsi: Math.floor(Math.random() * 100),
        volume: '$0',
        expiry: '30D'
      }));
      await kv.set(`market:asset:${asset.symbol}`, asset);
      repaired = true;
    }
  }

  return c.json({ assets: repaired ? await kv.getByPrefix('market:asset:') : assets })
})

routeHandler('seed-global-markets', async (c) => {
  const { defaultAssets } = await c.req.json()
  for (const asset of defaultAssets) {
    const existing = await kv.get(`market:asset:${asset.symbol}`)
    if (!existing) {
      // Ensure every asset has prop bets on initialization
      if (!asset.propBets || asset.propBets.length === 0) {
        asset.propBets = Array.from({ length: 12 }, (_, i) => ({
          id: `seed_prop_${i}`,
          question: [
            "Will they be seen together this week?", "Will they post a selfie?", 
            "Will they delete a photo?", "Will a third party intervene?",
            "Will they announce a split?", "Will they get engaged?",
            "Will they go on a trip?", "Will they move house?",
            "Will they attend a red carpet?", "Will they block each other?",
            "Will a family member comment?", "Will they start a business?"
          ][i],
          yesOdds: `${Math.floor(Math.random() * 80 + 10)}%`,
          noOdds: `${Math.floor(Math.random() * 80 + 10)}%`,
          rsi: Math.floor(Math.random() * 100),
          volume: '$0',
          expiry: '30D'
        }));
      }
      await kv.set(`market:asset:${asset.symbol}`, { ...asset, lastUpdated: new Date().toISOString() })
    }
  }

  // Seed initial intel logs if empty
  const logs = await kv.get('intel:logs')
  if (!logs || logs.length === 0) {
    const initialLogs = [
      { id: 1, source: 'WIRETAP_BETA', symbol: '$TAY-TRAV', message: "Low-frequency argument detected in private suite. Keyword: 'pre-nup'.", time: '2m ago', severity: 'HIGH' },
      { id: 2, source: 'PABLO_GOSSIP', symbol: '$BEN-JEN', message: "Affleck seen moving boxes out of West Hollywood estate. 42% confidence.", time: '14m ago', severity: 'CRITICAL' },
      { id: 3, source: 'SAT_INTEL', symbol: '$TOM-ZEND', message: "Zendaya's stylist unfollowed Holland on private Alt. Bearish signal.", time: '45m ago', severity: 'MED' },
    ]
    await kv.set('intel:logs', initialLogs)
  }
  
  await calculateAndUpdateGli()

  return c.json({ success: true })
}, 'post')

routeHandler('save-private-asset', async (c) => {
  const user = c.get('user')
  const asset = await c.req.json()
  const assetData = { 
    ...asset, 
    creatorId: user.id, 
    isGlobal: true, 
    lastUpdated: new Date().toISOString() 
  }
  await kv.set(`market:asset:${assetData.symbol}`, assetData)
  return c.json({ success: true, asset: assetData })
}, 'post')

routeHandler('get-intel', async (c) => {
  let logs = await kv.get('intel:logs')
  
  // Auto-seed if empty to prevent "Waiting Forever" state
  if (!logs || logs.length === 0) {
    logs = [
      { id: Date.now(), source: 'SYSTEM_BOOT', symbol: '$SYS', message: "Global intelligence node synchronized. Monitoring high-frequency social metadata...", time: 'JUST_NOW', severity: 'LOW' },
      { id: Date.now() - 1000, source: 'WIRETAP_BETA', symbol: '$TAY-TRAV', message: "Encrypted packet intercepted: 'NDA' mentioned in legal correspondence.", time: '1m ago', severity: 'HIGH' },
      { id: Date.now() - 2000, source: 'PABLO_GOSSIP', symbol: '$BEN-JEN', message: "Geospatial data shows $BEN at local Dunkin. Vibe: AGITATED.", time: '2m ago', severity: 'MED' }
    ]
    await kv.set('intel:logs', logs)
  }
  
  return c.json({ logs })
})

routeHandler('refresh-market-pulse', async (c) => {
  const { symbol } = await c.req.json()
  const asset = await kv.get(`market:asset:${symbol}`)
  if (!asset) return c.json({ error: 'Asset not found' }, 404)

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    const priceChange = (Math.random() * 4 - 2).toFixed(2)
    asset.price = (parseFloat(asset.price) + parseFloat(priceChange)).toFixed(2)
    asset.change = `${parseFloat(priceChange) >= 0 ? '+' : ''}${priceChange}%`
    asset.isUp = parseFloat(priceChange) >= 0
    asset.lastUpdated = new Date().toISOString()
    asset.aiSummary = "MOCK_INTERCEPT: Subtle shifts in public social metadata detected."
    // Update mock odds too
    if (asset.propBets) {
      asset.propBets = asset.propBets.map((pb: any) => ({
        ...pb,
        yesOdds: `${Math.floor(Math.random() * 90 + 5)}%`,
        noOdds: `${Math.floor(Math.random() * 90 + 5)}%`,
        rsi: Math.floor(Math.random() * 100)
      }))
    }
    await kv.set(`market:asset:${symbol}`, asset)

    const logs = await kv.get('intel:logs') || []
    const newLog = {
      id: Date.now(),
      time: 'JUST_NOW',
      symbol: symbol,
      source: 'MOCK_NODE',
      message: `System detected metadata movement for ${symbol}. Significance: ${asset.isUp ? 'BULLISH' : 'BEARISH'}.`,
      severity: 'LOW'
    }
    await kv.set('intel:logs', [newLog, ...logs].slice(0, 50))
    
    await calculateAndUpdateGli()

    return c.json({ asset, newLog })
  }

  const prompt = `Generate a short fake tabloid news headline (max 15 words) and market update for the couple ${asset.names} (${symbol}). 
  Also generate 10-12 relevant prop bets based on this news.
  Finally, generate an "Insider Intel" log entry - this should be a "leaked" or "intercepted" snippet like a transcript fragment, a valet observation, or a bank leak. 
  Return ONLY JSON: { 
    "news": string, 
    "priceUpdate": number, 
    "newRsi": number, 
    "sentiment": number,
    "propBets": Array<{id:string, question:string, yesOdds:string, noOdds:string, rsi:number}>,
    "intel": { "source": string, "message": string, "severity": "LOW" | "MED" | "HIGH" | "CRITICAL" }
  }. 
  The priceUpdate should be between -5 and 5.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const result = JSON.parse(data.content[0].text.match(/\{[\s\S]*\}/)[0])
    
    asset.price = (parseFloat(asset.price) + result.priceUpdate).toFixed(2)
    asset.change = `${result.priceUpdate >= 0 ? '+' : ''}${result.priceUpdate.toFixed(2)}%`
    asset.isUp = result.priceUpdate >= 0
    asset.aiSummary = result.news
    asset.propBets = result.propBets.map((pb: any) => ({ ...pb, volume: `$${(Math.random() * 10).toFixed(1)}M`, expiry: '30D' }))
    asset.lastUpdated = new Date().toISOString()
    
    await kv.set(`market:asset:${symbol}`, asset)

    // Add to global intel feed
    const logs = await kv.get('intel:logs') || []
    const newLog = {
      id: Date.now(),
      time: 'JUST_NOW',
      symbol: symbol,
      ...result.intel
    }
    await kv.set('intel:logs', [newLog, ...logs].slice(0, 50)) // Keep last 50
    
    await calculateAndUpdateGli()

    return c.json({ asset, newLog })
  } catch (err) {
    return c.json({ error: 'PULSE_FAILED' }, 500)
  }
}, 'post')

// AI Analysis Route
routeHandler('analyze-relationship', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: 'INVALID_JSON' }, 400);
  }

  const { logs, names } = body;
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  
  const mockResult = {
    price: (Math.random() * 100 + 10).toFixed(2),
    volatility: ['HIGH', 'MED', 'LOW', 'EXTREME'][Math.floor(Math.random() * 4)],
    sentiment: Math.random(),
    propBets: Array.from({ length: 12 }, (_, i) => ({
      id: `prop_${i}`,
      question: [
        "Will they move in together?", "Will they block each other?", 
        "Will a public argument occur?", "Will an ex-partner intervene?",
        "Will they announce a breakup?", "Will they attend a gala?",
        "Will they go on vacation?", "Will they delete shared photos?",
        "Will a third party be leaked?", "Will they get engaged?",
        "Will they start a podcast?", "Will they adopt a pet?"
      ][i],
      yesOdds: `${Math.floor(Math.random() * 90 + 5)}%`,
      noOdds: `${Math.floor(Math.random() * 90 + 5)}%`,
      rsi: Math.floor(Math.random() * 100)
    })),
    chart: Array.from({ length: 20 }, () => Math.random() * 100),
    summary: "Sentiment analysis indicates a high probability of friction."
  };

  if (!apiKey || apiKey === 'your_api_key_here') return c.json(mockResult)

  const prompt = `Analyze relationship between ${names}. logs: ${logs}. 
  Return ONLY a JSON object: {
    price: number, 
    volatility: string, 
    sentiment: number, 
    propBets: Array<{id:string, question:string, yesOdds:string, noOdds:string, rsi:number}> (Generate 12 relevant prop bets),
    chart: number[], 
    summary: string
  }. No conversational text.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return c.json(jsonMatch ? JSON.parse(jsonMatch[0]) : mockResult);
  } catch (err) {
    return c.json(mockResult);
  }
}, 'post')

// Social Routes
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

routeHandler('seed-test-users', async (c) => {
  const testUsers = [
    { name: 'Chad Harrison', email: 'chad@finance.com', bio: 'High Frequency Trader. Low Frequency Dater.' },
    { name: 'Brittany Vanes', email: 'britt@vibe.io', bio: 'Influencer. 14 open lawsuits. 2 divorces.' },
    { name: 'Devon Miller', email: 'devon@alpha.tech', bio: 'Technical Founder. Scaling relationships like microservices.' },
    { name: 'Sasha Sterling', email: 'sasha@pr.com', bio: 'PR Crisis Manager. I bury scandals for a living.' },
    { name: 'Jaxon Rivers', email: 'jaxon@gym.fit', bio: 'Elite Coach. Your relationship is my cardio.' },
    { name: 'Elena Rossi', email: 'elena@art.gallery', bio: 'Art Curator. Investing in high-net-worth drama.' },
    { name: 'Marcus Thorne', email: 'marcus@law.corp', bio: 'Divorce Attorney. I see the liquidation coming before you do.' },
    { name: 'Tiff Chen', email: 'tiff@web3.xyz', bio: 'DeFi Degen. Hedging my heart with leverage.' },
    { name: 'Leo Moretti', email: 'leo@lux.com', bio: 'Hospitality Mogul. I know which rooms are being booked.' },
    { name: 'Zoe Wilder', email: 'zoe@green.org', bio: 'Sustainability Expert. Recycling exes for maximum ROI.' }
  ]

  for (let i = 0; i < testUsers.length; i++) {
    const u = testUsers[i];
    const id = `test_node_${i + 1}`;
    const profile = {
      id, name: u.name, email: u.email, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(' ', '')}`,
      joined: new Date().toISOString(), balance: 50000, portfolio: [], onboarded: true, bio: u.bio
    };
    await kv.set(`user:profile:${id}`, profile);
    await kv.set(`user:search:email:${u.email.toLowerCase()}`, { id, name: u.name });
    await kv.set(`user:search:name:${u.name.toLowerCase()}`, { id, name: u.name });
  }
  return c.json({ success: true, count: testUsers.length });
}, 'post')

// DEBUG: Catch-all for routing diagnostics
app.use('*', async (c, next) => {
  console.log(`[ROUTING_DIAGNOSTIC] ${c.req.method} ${c.req.url}`)
  await next()
})

routeHandler('ping', (c) => c.json({ status: 'PONG', timestamp: new Date().toISOString() }), 'get', false)

// Test GET for webhook to verify routing
routeHandler('telegram-webhook', (c) => c.json({ 
  status: 'WEBHOOK_ENDPOINT_ONLINE', 
  guidance: 'SEND_POST_REQUEST_WITH_VOICE_DATA' 
}), 'get', false)

// WIRE TAP SYSTEM: Telegram + Deepgram
routeHandler('telegram-webhook', async (c) => {
  console.log('TELEGRAM_WEBHOOK_RECEIVED: INCOMING_PACKET')
  
  // Log headers to see if it's actually Telegram
  const headers = {}
  c.req.header().forEach((v, k) => headers[k] = v)
  console.log('REQUEST_HEADERS:', JSON.stringify(headers, null, 2))

  let body;
  try {
    body = await c.req.json()
    console.log('WEBHOOK_BODY:', JSON.stringify(body, null, 2))
  } catch (e) {
    console.error('FAILED_TO_PARSE_JSON_BODY:', e)
    return c.json({ status: 'error', message: 'invalid_json' }, 400)
  }

  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const deepgramKey = Deno.env.get('DEEPGRAM_API_KEY')

  if (!token) console.error('MISSING_SECRET: TELEGRAM_BOT_TOKEN')
  if (!deepgramKey) console.error('MISSING_SECRET: DEEPGRAM_API_KEY')

  if (!body.message) {
    console.log('WEBHOOK_IGNORED: NO_MESSAGE_OBJECT')
    return c.json({ status: 'ignored' })
  }

  const chatId = body.message.chat.id

  // Auto-reply for text messages
  if (body.message.text && token) {
    console.log('REPLYING_TO_TEXT_MESSAGE...')
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "NODE_ACTIVE: Standard text signal received. However, target extraction requires VOICE_DATA intercepts for sentiment diarization. Please upload audio."
      })
    })
    return c.json({ status: 'ok' })
  }

  if (!body.message.voice) {
    console.log('WEBHOOK_IGNORED: MESSAGE_TYPE_IS_NOT_VOICE')
    return c.json({ status: 'ignored' })
  }

  // Auto-reply "Thanks" for audio immediately to confirm reception
  if (token) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "SIGNAL_LOCKED: Audio packet received. Commencing Deepgram diarization and target analysis..."
      })
    })
  }

  const voice = body.message.voice
  console.log(`PROCESSING_VOICE_FILE: ID=${voice.file_id}, CHAT_ID=${chatId}`)

  try {
    // 1. Get file path from Telegram
    console.log('FETCHING_FILE_METADATA_FROM_TELEGRAM...')
    const fileResp = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${voice.file_id}`)
    const fileData = await fileResp.json()
    
    if (!fileData.ok) {
      console.error('TELEGRAM_API_ERROR:', fileData)
      throw new Error(`Telegram error: ${fileData.description}`)
    }

    const filePath = fileData.result.file_path
    const audioUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
    console.log('AUDIO_URL_RESOLVED:', audioUrl)

    // 2. Send to Deepgram for analysis
    console.log('INITIATING_DEEPGRAM_SENTIMENT_ANALYSIS...')
    const dgParams = new URLSearchParams({
      model: 'nova-2',
      diarize: 'true',
      sentiment: 'true',
      intents: 'true',
      punctuate: 'true',
      filler_words: 'true'
    })

    const dgResp = await fetch(`https://api.deepgram.com/v1/listen?${dgParams.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: audioUrl })
    })

    const dgResult = await dgResp.json()
    console.log('DEEPGRAM_RAW_RESPONSE:', JSON.stringify(dgResult, null, 2))

    const transcript = dgResult.results?.channels[0]?.alternatives[0]?.transcript || "No transcript"
    console.log('TRANSCRIPTION_SUCCESS:', transcript)

    const isConflict = transcript.toLowerCase().includes('stop') || 
                       transcript.toLowerCase().includes('why') || 
                       transcript.toLowerCase().includes('never') ||
                       transcript.toLowerCase().includes('over') ||
                       transcript.toLowerCase().includes('hate') ||
                       transcript.toLowerCase().includes('done')

    console.log(`CONFLICT_DETECTION: ${isConflict ? 'CRITICAL_FRICTION_DETECTED' : 'NOMINAL_ATMOSPHERE'}`)

    // 3. Update $MIKE-REB Market Data
    console.log('UPDATING_MARKET_ASSET: $MIKE-REB')
    const asset = await kv.get('market:asset:$MIKE-REB')
    if (asset) {
      const oldPrice = asset.price
      asset.price = (parseFloat(asset.price) * (isConflict ? 0.3 : 0.8)).toFixed(2)
      asset.change = isConflict ? "-72.1%" : "-15.4%"
      asset.isUp = false
      asset.aiSummary = `WIRETAP_CONFIRMED: ${isConflict ? 'CRITICAL_FRICTION' : 'SUBTLE_TENSION'} detected. Transcript analysis confirms interpersonal volatility.`
      
      if (asset.propBets) {
        asset.propBets = asset.propBets.map((pb: any) => {
          if (pb.question.toLowerCase().includes('split') || 
              pb.question.toLowerCase().includes('break') || 
              pb.question.toLowerCase().includes('office')) {
            return { ...pb, yesOdds: '94%', noOdds: '6%', rsi: 99 }
          }
          return pb
        })
      }
      
      await kv.set('market:asset:$MIKE-REB', asset)
      console.log(`ASSET_UPDATE_COMMITTED: ${oldPrice} -> ${asset.price}`)
      
      const logs = await kv.get('intel:logs') || []
      const newLog = {
        id: Date.now(),
        time: 'JUST_NOW',
        symbol: '$MIKE-REB',
        source: 'TELEGRAM_WIRETAP',
        message: `Audio intercept analyzed: "${transcript.slice(0, 60)}...". Vibe: ${isConflict ? 'HOSTILE' : 'COLD'}.`,
        severity: isConflict ? 'CRITICAL' : 'HIGH'
      }
      await kv.set('intel:logs', [newLog, ...logs].slice(0, 50))
      console.log('INTEL_LOG_INJECTED:', newLog.message)
      
      await calculateAndUpdateGli()
      console.log('GLI_RECALCULATION_COMPLETE')
    } else {
      console.error('ASSET_NOT_FOUND: $MIKE-REB (Make sure it is seeded!)')
    }

    // 4. Reply to user in Telegram
    console.log('SENDING_TELEGRAM_CONFIRMATION_TO_OPERATOR...')
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `NODE_SIGNAL_RECEIVED: Intercept processed.\n\nTARGET: $MIKE-REB\nSTATUS: LIQUIDATION_MODE\nSENTIMENT: ${isConflict ? 'HOSTILE' : 'TENSE'}\n\n"Analysis uploaded to Love Arbitrage Terminal."`
      })
    })

  } catch (err) {
    console.error('WIRETAP_CRITICAL_FAILURE:', err)
  }

  return c.json({ status: 'ok' })
}, 'post', false)

Deno.serve(app.fetch)
