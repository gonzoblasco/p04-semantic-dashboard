import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Prevent real SDK calls — guards under test never reach this
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(),
}))

import { POST } from '../generate/route'
import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)

function buildSupabaseMock(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  }
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/ai/generate', () => {
  it('returns 401 when there is no active session', async () => {
    mockCreateClient.mockResolvedValue(buildSupabaseMock(null) as any)

    const res = await POST(makeRequest({ prompt: 'hello', tone: 'casual' }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when prompt is missing', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({ id: 'user-123' }) as any
    )

    const res = await POST(makeRequest({ tone: 'casual' }))

    expect(res.status).toBe(400)
  })

  it('returns 400 when tone is invalid', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({ id: 'user-123' }) as any
    )

    const res = await POST(makeRequest({ prompt: 'hello', tone: 'aggressive' }))

    expect(res.status).toBe(400)
  })

  it('returns 400 when prompt exceeds 4000 characters', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({ id: 'user-123' }) as any
    )

    const res = await POST(makeRequest({ prompt: 'a'.repeat(4001), tone: 'casual' }))

    expect(res.status).toBe(400)
  })

  it('returns 400 when context exceeds 10000 characters', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({ id: 'user-123' }) as any
    )

    const res = await POST(makeRequest({ prompt: 'hello', tone: 'casual', context: 'a'.repeat(10001) }))

    expect(res.status).toBe(400)
  })
})
