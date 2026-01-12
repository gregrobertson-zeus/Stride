import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  // Only create client in browser
  if (typeof window === 'undefined') {
    return null
  }

  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SB_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SB_KEY

  console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET')
  console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'NOT SET')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
