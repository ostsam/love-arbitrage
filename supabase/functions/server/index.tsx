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
    pieces.push(
      `Average sentiment: ${average.sentiment} (${average.sentiment_score.toFixed(2)}).`,
    )
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
      const score =
        typeof item?.confidence_score === 'number'
          ? item.confidence_score
          : 0
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
    // Fallback keeps diarization/transcript working if a specific intelligence option is unavailable.
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

routes.get('/market-updates/:symbol', async (c) => {
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
})

routes.post('/analyze-recording', async (c) => {
  try {
    const form = await c.req.formData()
    const audio = form.get('audio')
    const symbol = String(form.get('symbol') || '$CHAD-BRITT')

    if (!(audio instanceof File)) {
      return c.json({ error: 'audio file is required (multipart/form-data field "audio")' }, 400)
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
})

Deno.serve(app.fetch)
