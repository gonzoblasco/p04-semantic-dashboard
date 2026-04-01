import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createSession, updateSession, deleteSession, getSession } from '../writing'
import { createClient } from '@/lib/supabase/server'

const mockCreateClient = vi.mocked(createClient)

function buildSupabaseMock({
  user = { id: 'user-123' } as { id: string } | null,
  fetchResult = { data: null, error: { message: 'not found' } } as { data: unknown; error: { message: string } | null },
  mutateResult = { data: null, error: null } as { data: unknown; error: { message: string } | null },
} = {}) {
  const single = vi.fn()
  const select = vi.fn(() => ({ single }))
  const eq = vi.fn(function (this: unknown) { return { eq, single, select } })

  // Chain for ownership-check fetch: .select().eq().eq().single()
  const fetchSingle = vi.fn().mockResolvedValue(fetchResult)
  const fetchEq2 = vi.fn(() => ({ single: fetchSingle }))
  const fetchEq1 = vi.fn(() => ({ eq: fetchEq2, single: fetchSingle }))
  const fetchSelect = vi.fn(() => ({ eq: fetchEq1 }))

  // Chain for mutate: .insert/.update/.delete().select().single() or just .eq()
  const mutateSingle = vi.fn().mockResolvedValue(mutateResult)
  const mutateSelect = vi.fn(() => ({ single: mutateSingle }))
  const mutateEq = vi.fn(() => ({ select: mutateSelect, single: mutateSingle }))

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn(() => ({
      // ownership-check select chain
      select: fetchSelect,
      // insert chain
      insert: vi.fn(() => ({ select: mutateSelect })),
      // update chain
      update: vi.fn(() => ({ eq: mutateEq })),
      // delete chain
      delete: vi.fn(() => ({ eq: mutateEq })),
    })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createSession', () => {
  it('returns error when no user is authenticated', async () => {
    mockCreateClient.mockResolvedValue(buildSupabaseMock({ user: null }) as any)

    const result = await createSession('Test')

    expect(result).toEqual({ data: null, error: 'Usuario no autenticado' })
  })
})

describe('updateSession', () => {
  it('returns error when session does not belong to the user', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({
        user: { id: 'user-123' },
        fetchResult: { data: null, error: { message: 'Row not found' } },
      }) as any
    )

    const result = await updateSession('session-other', { title: 'Hacked' })

    expect(result).toEqual({ data: null, error: 'Sesión no encontrada o acceso denegado' })
  })
})

describe('getSession', () => {
  it('returns data null when session does not belong to the user', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({
        user: { id: 'user-123' },
        fetchResult: { data: null, error: { message: 'Row not found' } },
      }) as any
    )

    const result = await getSession('session-other')

    expect(result.data).toBeNull()
  })
})

describe('deleteSession', () => {
  it('returns error when session does not belong to the user', async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseMock({
        user: { id: 'user-123' },
        fetchResult: { data: null, error: { message: 'Row not found' } },
      }) as any
    )

    const result = await deleteSession('session-other')

    expect(result).toEqual({ error: 'Sesión no encontrada o acceso denegado' })
  })
})
