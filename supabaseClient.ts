import { createClient } from '@supabase/supabase-js';

// ✅ FIX: Ambil dari environment variable, bukan hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ FIX: Validasi saat startup — crash lebih awal kalau env tidak ada
// Lebih baik error jelas daripada error misterius di runtime
if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);