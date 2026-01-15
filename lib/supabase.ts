import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Typing über generics macht hier Probleme beim Build, daher bewusst ungetypt.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
