// Initialize Supabase client
export const supabaseUrl = 'https://tkiqqpqplbgrebcbsiop.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraXFxcHFwbGJncmViY2JzaW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzM3MzYsImV4cCI6MjA2MzA0OTczNn0.FJ0C0d4PYJTTUSL55tDroIpz5jcW9gvYX9eSKoB3Iz4';
// Create a single supabase client for interacting with your database
export const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);
