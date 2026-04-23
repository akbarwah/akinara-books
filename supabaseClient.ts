import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL atau ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        // ✅ Disable Next.js internal fetch caching untuk Supabase requests
        // Tanpa ini, Next.js meng-cache response fetch() secara agresif di server components
        // Page-level caching tetap ditangani oleh ISR (revalidate) atau force-dynamic
        fetch: (url, options = {}) => {
            return fetch(url, { ...options, cache: 'no-store' })
        },
    },
})