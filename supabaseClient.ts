import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL atau ANON_KEY');
}

// ✅ Use default fetch behavior so Next.js can use its own caching strategy (ISR via revalidate)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)