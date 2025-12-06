
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are missing. Please check your .env.local file.'
  )
}

// Export supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
