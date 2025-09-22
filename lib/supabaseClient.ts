import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cttrxbwusxyqwncljwvq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0dHJ4Ynd1c3h5cXduY2xqd3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzYzOTcsImV4cCI6MjA3MzYxMjM5N30.W1KY--300XzlitdzZuA1xbllGNNV_W8isoYb2qy2tTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
