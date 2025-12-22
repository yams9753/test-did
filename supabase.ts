
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnsljworgkrneqvmqmiy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2xqd29yZ2tybmVxdm1xbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDYyMTMsImV4cCI6MjA4MTk4MjIxM30.UVok-Tv766tAZMGKIzz2h7ilFPx_9GYmR0qgBqta0Wg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
