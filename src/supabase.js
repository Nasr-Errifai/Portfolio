import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://oikjxuwedowzvcsqokxo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pa2p4dXdlZG93enZjc3Fva3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTUyMDAsImV4cCI6MjA1ODQzMTIwMH0.9K8QkLQmX7pX5zY5c5n5f5h5j5k5l5q5w5e5r5t5y5u5i5o5p5a5s5d5f5g5h5j5k5l"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
