// Supabase configuration
// Create a config.js file in the same directory exporting supabaseUrl and supabaseAnonKey
// e.g. copy config.example.js to config.js and fill in your credentials
import { supabaseUrl, supabaseAnonKey } from './config.js';

export const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
