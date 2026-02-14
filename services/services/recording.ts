import { projectId, publicAnonKey } from '../../utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c0ec1358`

export interface MarketSnapshot {
  symbol: string
  price: number
  change: number
  lastUpdatedAt?: string
}

export interface WiretapMarketUpdate {
  id: string
  symbol: string
  user: string
  time: string
  quote: string
  headline?: string
  rationale?: string
  confidence?: number
  relationshipScore?: number
  position?: 'LONG' | 'SHORT' | 'HOLD'
  state?: 'strengthening' | 'deteriorating' | 'mixed' | 'unclear'
  marketMovePercent?: number
  createdAt?: string
  transcript?: string
  diarizedTranscript?: string
  sentimentSummary?: string
  intentSummary?: string
  deepgramWarnings?: string
}

export interface AnalyzeRecordingResponse {
  symbol: string
  market: MarketSnapshot
  update: WiretapMarketUpdate
}

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json()
    return data?.error || fallback
  } catch (_error) {
    return fallback
  }
}

export class RecordingService {
  static async analyzeRecording(file: File, symbol: string): Promise<AnalyzeRecordingResponse> {
    const form = new FormData()
    form.append('audio', file)
    form.append('symbol', symbol)

    const response = await fetch(`${API_BASE}/analyze-recording`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: form,
    })

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, 'Failed to analyze recording'),
      )
    }

    return response.json()
  }

  static async getMarketUpdates(symbol: string): Promise<WiretapMarketUpdate[]> {
    const response = await fetch(
      `${API_BASE}/market-updates/${encodeURIComponent(symbol)}`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, 'Failed to fetch market updates'),
      )
    }

    return response.json()
  }
}
