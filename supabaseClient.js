import { createClient } from '@supabase/supabase-js'

// --- GANTI BAGIAN DI BAWAH INI DENGAN DATA DARI DASHBOARD SUPABASE KAMU ---

const supabaseUrl = 'https://spfkxihsufeldtqdfykt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZmt4aWhzdWZlbGR0cWRmeWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTIwODYsImV4cCI6MjA4Mzg2ODA4Nn0.CwOosy9Wiq5lp2uwJLOD9jrWb0K4PPQ7FhPLOpX7p_Q'

// --------------------------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey)