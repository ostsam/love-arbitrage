import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

declare const Deno: {
  env: { get(key: string): string | undefined }
  serve(handler: (req: Request) => Response | Promise<Response>): void
}

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

const DEEPGRAM_LISTEN_URL = 'https://api.deepgram.com/v1/listen'
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'

type RelationshipDirection = 'LONG' | 'SHORT' | 'HOLD'
type RelationshipState = 'strengthening' | 'deteriorating' | 'mixed' | 'unclear'

interface RelationshipAnalysis {
  headline: string
  state: RelationshipState
  confidence: number
  relationshipScore: number
  position: RelationshipDirection
  marketMovePercent: number
  rationale: string
  marketUpdateText: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const normalizeRelationshipAnalysis = (data: Partial<RelationshipAnalysis>): RelationshipAnalysis => {
  const position = data.position === 'LONG' || data.position === 'SHORT' || data.position === 'HOLD'
    ? data.position
    : 'HOLD'
  const state = data.state === 'strengthening' || data.state === 'deteriorating' || data.state === 'mixed' || data.state === 'unclear'
    ? data.state
    : 'unclear'

  return {
    headline: (data.headline ?? 'Wiretap update available').slice(0, 120),
    state,
    confidence: clamp(Math.round(data.confidence ?? 50), 0, 100),
    relationshipScore: clamp(Math.round(data.relationshipScore ?? 50), 0, 100),
    position,
    marketMovePercent: clamp(Number((data.marketMovePercent ?? 0).toFixed(2)), -10, 10),
    rationale: (data.rationale ?? 'Not enough signal to make a clear call.').slice(0, 500),
    marketUpdateText: (data.marketUpdateText ?? 'Wiretap processed. Signal is still forming.').slice(0, 260),
  }
}

const jsonFromMaybeWrappedContent = (content: string | null | undefined): Record<string, unknown> => {
  if (!content) return {}
  try {
    return JSON.parse(content)
  } catch (_error) {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return {}
    try {
      return JSON.parse(match[0])
    } catch (_nestedError) {
      return {}
    }
  }
}

const summarizeSentiment = (deepgramResponse: any): string => {
  const sentiments = deepgramResponse?.results?.sentiments
  const average = sentiments?.average
  const segments = Array.isArray(sentiments?.segments) ? sentiments.segments : []

  if (!average && segments.length === 0) {
    return 'No explicit sentiment returned by Deepgram.'
  }

  const pieces: string[] = []
  if (average?.sentiment && typeof average?.sentiment_score === 'number') {
    pieces.push(`Average sentiment: ${average.sentiment} (${average.sentiment_score.toFixed(2)}).`)
  }

  if (segments.length > 0) {
    const preview = segments.slice(0, 3).map((segment: any) => {
      const score = typeof segment?.sentiment_score === 'number'
        ? segment.sentiment_score.toFixed(2)
        : 'n/a'
      const text = (segment?.text ?? '').slice(0, 80)
      return `${segment?.sentiment ?? 'unknown'} (${score}) on "${text}"`
    })
    pieces.push(`Key segments: ${preview.join('; ')}`)
  }

  return pieces.join(' ')
}

const summarizeIntents = (deepgramResponse: any): string => {
  const segments = Array.isArray(deepgramResponse?.results?.intents?.segments)
    ? deepgramResponse.results.intents.segments
    : []

  if (segments.length === 0) {
    return 'No explicit intent segments returned by Deepgram.'
  }

  const intentStats = new Map<string, { count: number; bestScore: number }>()

  for (const segment of segments) {
    const intents = Array.isArray(segment?.intents) ? segment.intents : []
    for (const item of intents) {
      const intentName = String(item?.intent ?? '').trim()
      if (!intentName) continue
      const score = typeof item?.confidence_score === 'number' ? item.confidence_score : 0
      const previous = intentStats.get(intentName)
      if (!previous) {
        intentStats.set(intentName, { count: 1, bestScore: score })
      } else {
        previous.count += 1
        previous.bestScore = Math.max(previous.bestScore, score)
      }
    }
  }

  const ranked = Array.from(intentStats.entries())
    .sort((a, b) => {
      if (b[1].count !== a[1].count) return b[1].count - a[1].count
      return b[1].bestScore - a[1].bestScore
    })
    .slice(0, 5)

  const summaryLine = ranked.length > 0
    ? `Top intents: ${ranked
        .map(([intent, stats]) => `${intent} (x${stats.count}, max ${(stats.bestScore * 100).toFixed(0)}%)`)
        .join('; ')}.`
    : 'No intent labels were extractable from returned segments.'

  const sampleSegments = segments.slice(0, 3).map((segment: any) => {
    const firstIntent = Array.isArray(segment?.intents) ? segment.intents[0] : null
    const label = firstIntent?.intent ?? 'unknown'
    const score = typeof firstIntent?.confidence_score === 'number'
      ? `${(firstIntent.confidence_score * 100).toFixed(0)}%`
      : 'n/a'
    const text = String(segment?.text ?? '').slice(0, 90)
    return `${label} (${score}) on "${text}"`
  })

  if (sampleSegments.length === 0) {
    return summaryLine
  }

  return `${summaryLine} Example segments: ${sampleSegments.join('; ')}`
}

const summarizeDeepgramWarnings = (deepgramResponse: any): string => {
  const warnings = Array.isArray(deepgramResponse?.warnings)
    ? deepgramResponse.warnings
    : []

  if (warnings.length === 0) return 'No Deepgram warnings.'

  return warnings
    .slice(0, 5)
    .map((warning: any) => {
      const parameter = warning?.parameter ? `[${warning.parameter}]` : '[warning]'
      const message = warning?.message ?? warning?.type ?? 'Unknown warning'
      return `${parameter} ${message}`
    })
    .join(' | ')
}

const buildDiarizedTranscript = (deepgramResponse: any): { rawTranscript: string; diarizedTranscript: string } => {
  const rawTranscript =
    deepgramResponse?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''

  const utterances = Array.isArray(deepgramResponse?.results?.utterances)
    ? deepgramResponse.results.utterances
    : []

  if (utterances.length === 0) {
    return {
      rawTranscript,
      diarizedTranscript: rawTranscript || '(No transcript available)',
    }
  }

  const diarizedTranscript = utterances
    .map((utterance: any) => {
      const speaker = typeof utterance?.speaker === 'number'
        ? `Speaker ${utterance.speaker + 1}`
        : 'Speaker ?'
      const text = (utterance?.transcript ?? '').trim()
      return `${speaker}: ${text}`
    })
    .filter(Boolean)
    .join('\n')

  return {
    rawTranscript,
    diarizedTranscript: diarizedTranscript || rawTranscript || '(No transcript available)',
  }
}

const transcribeAudioWithDeepgram = async (file: File) => {
  const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY')
  if (!deepgramApiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured in function environment')
  }

  const audioBytes = await file.arrayBuffer()

  const requestDeepgram = async (params: URLSearchParams) => {
    const response = await fetch(`${DEEPGRAM_LISTEN_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: audioBytes,
    })

    const payload = await response.json()
    if (!response.ok) {
      const message = payload?.err_msg ?? payload?.message ?? 'Deepgram transcription failed'
      throw new Error(message)
    }

    return payload
  }

  try {
    return await requestDeepgram(new URLSearchParams({
      model: 'nova-3',
      punctuate: 'true',
      smart_format: 'true',
      diarize: 'true',
      utterances: 'true',
      sentiment: 'true',
      intents: 'true',
      topics: 'true',
      detect_language: 'true',
    }))
  } catch (error) {
    console.warn('Deepgram rich intelligence flags failed, retrying with base STT params', error)

    return requestDeepgram(new URLSearchParams({
      model: 'nova-3',
      punctuate: 'true',
      smart_format: 'true',
      diarize: 'true',
      utterances: 'true',
    }))
  }
}

const analyzeRelationshipState = async (
  symbol: string,
  rawTranscript: string,
  diarizedTranscript: string,
  sentimentSummary: string,
  intentSummary: string,
  deepgramWarnings: string,
): Promise<RelationshipAnalysis> => {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured in function environment')
  }

  const systemPrompt = `
You are an expert relationship market analyst.
You are given an unfiltered conversation transcript and sentiment metadata.
Return only valid JSON matching this schema:
{
  "headline": "string, <= 120 chars",
  "state": "strengthening" | "deteriorating" | "mixed" | "unclear",
  "confidence": "integer 0-100",
  "relationshipScore": "integer 0-100 (higher = healthier relationship)",
  "position": "LONG" | "SHORT" | "HOLD",
  "marketMovePercent": "number between -10 and 10",
  "rationale": "string, concise explanation grounded in transcript evidence",
  "marketUpdateText": "string, one insider-feed update <= 260 chars"
}

Rules:
- Base the analysis strictly on provided transcript and sentiment.
- If evidence is mixed or thin, choose "mixed" or "unclear" with lower confidence.
- Do not add facts not present in the transcript.
- No markdown and no extra keys.
  `.trim()

  const userPrompt = `
Market Symbol: ${symbol}

Deepgram Sentiment Summary:
${sentimentSummary}

Deepgram Intent Summary:
${intentSummary}

Deepgram Warning Notes:
${deepgramWarnings}

Raw Transcript:
${rawTranscript || '(empty)'}

Diarized Transcript:
${diarizedTranscript || '(empty)'}
  `.trim()

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    const message = payload?.error?.message ?? 'OpenAI relationship analysis failed'
    throw new Error(message)
  }

  const content = payload?.choices?.[0]?.message?.content
  const parsed = jsonFromMaybeWrappedContent(content) as Partial<RelationshipAnalysis>
  return normalizeRelationshipAnalysis(parsed)
}

const applyMarketUpdate = async (symbol: string, movePercent: number, confidence: number) => {
  const existing = await kv.get(`market:${symbol}`)
  const basePrice = typeof existing?.price === 'number' ? existing.price : 50

  const confidenceFactor = clamp(confidence / 100, 0.25, 1)
  const adjustedMove = Number((movePercent * confidenceFactor).toFixed(2))
  const nextPrice = Number((basePrice * (1 + adjustedMove / 100)).toFixed(2))

  const marketSnapshot = {
    symbol,
    price: clamp(nextPrice, 0.5, 9999),
    change: adjustedMove,
    lastUpdatedAt: new Date().toISOString(),
  }

  await kv.set(`market:${symbol}`, marketSnapshot)
  return marketSnapshot
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

routeHandler('market-data', async (c) => {
  try {
    const data = await kv.getByPrefix('market:')
    if (data.length === 0) {
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
}, 'get', false)

routeHandler('place-bet', async (c) => {
  const body = await c.req.json()
  const { symbol, side, amount, userId } = body

  const betKey = `bet:${userId || 'anonymous'}:${Date.now()}`
  await kv.set(betKey, { symbol, side, amount, timestamp: Date.now() })

  return c.json({ success: true, message: `Position ${String(side).toUpperCase()} opened on ${symbol}` })
}, 'post', false)

routeHandler('market-updates/:symbol', async (c) => {
  try {
    const symbol = decodeURIComponent(c.req.param('symbol') || '')
    if (!symbol) {
      return c.json({ error: 'symbol is required' }, 400)
    }

    const updates = await kv.getByPrefix(`market-update:${symbol}:`)
    const sorted = updates
      .sort((a: any, b: any) => {
        const at = new Date(a?.createdAt ?? 0).getTime()
        const bt = new Date(b?.createdAt ?? 0).getTime()
        return bt - at
      })
      .slice(0, 30)

    return c.json(sorted)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
}, 'get', false)

routeHandler('analyze-recording', async (c) => {
  try {
    const form = await c.req.formData()
    const audio = form.get('audio')
    const symbol = String(form.get('symbol') || '$CHAD-BRITT')

    if (!(audio instanceof File)) {
      return c.json({ error: 'audio file is required (multipart/form-data field \"audio\")' }, 400)
    }

    if (audio.size === 0) {
      return c.json({ error: 'audio file is empty' }, 400)
    }

    const deepgramResponse = await transcribeAudioWithDeepgram(audio)
    const { rawTranscript, diarizedTranscript } = buildDiarizedTranscript(deepgramResponse)
    const sentimentSummary = summarizeSentiment(deepgramResponse)
    const intentSummary = summarizeIntents(deepgramResponse)
    const deepgramWarnings = summarizeDeepgramWarnings(deepgramResponse)

    const relationshipAnalysis = await analyzeRelationshipState(
      symbol,
      rawTranscript,
      diarizedTranscript,
      sentimentSummary,
      intentSummary,
      deepgramWarnings,
    )

    const marketSnapshot = await applyMarketUpdate(
      symbol,
      relationshipAnalysis.marketMovePercent,
      relationshipAnalysis.confidence,
    )

    const marketUpdate = {
      id: `wiretap-${Date.now()}`,
      symbol,
      user: 'WIRETAP_AI',
      time: 'JUST NOW',
      quote: relationshipAnalysis.marketUpdateText,
      headline: relationshipAnalysis.headline,
      rationale: relationshipAnalysis.rationale,
      confidence: relationshipAnalysis.confidence,
      relationshipScore: relationshipAnalysis.relationshipScore,
      position: relationshipAnalysis.position,
      state: relationshipAnalysis.state,
      marketMovePercent: relationshipAnalysis.marketMovePercent,
      createdAt: new Date().toISOString(),
      transcript: rawTranscript,
      diarizedTranscript,
      sentimentSummary,
      intentSummary,
      deepgramWarnings,
      deepgramMetadata: {
        model: deepgramResponse?.metadata?.model_info,
        requestId: deepgramResponse?.metadata?.request_id,
      },
    }

    await kv.set(`market-update:${symbol}:${Date.now()}`, marketUpdate)

    return c.json({
      symbol,
      market: marketSnapshot,
      update: marketUpdate,
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
}, 'post', false)

Deno.serve(app.fetch)
