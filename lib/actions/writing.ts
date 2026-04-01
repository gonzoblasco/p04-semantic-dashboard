'use server'

import { createClient } from '@/lib/supabase/server'

export async function createSession(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Usuario no autenticado' }
  }

  const { data, error } = await supabase
    .from('writing_sessions')
    .insert({ user_id: user.id, title })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function updateSession(
  id: string,
  fields: { title?: string; content?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Usuario no autenticado' }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('writing_sessions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { data: null, error: 'Sesión no encontrada o acceso denegado' }
  }

  const { data, error } = await supabase
    .from('writing_sessions')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function getSessions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Usuario no autenticado' }
  }

  const { data, error } = await supabase
    .from('writing_sessions')
    .select('id, title, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return { data, error: error?.message ?? null }
}

export async function getSession(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Usuario no autenticado' }
  }

  const { data, error } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return { data, error: error?.message ?? null }
}

export async function deleteSession(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario no autenticado' }
  }

  const { data: existing, error: fetchError } = await supabase
    .from('writing_sessions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { error: 'Sesión no encontrada o acceso denegado' }
  }

  const { error } = await supabase
    .from('writing_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return { error: error?.message ?? null }
}
