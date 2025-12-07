import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ssnvtvpwdmfxwoqgskwb.supabase.co";
const supabasePublishableKey = "sb_publishable_eSbHRDZs7BpJ11s1tqz4Ag_y1_eREjv";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
