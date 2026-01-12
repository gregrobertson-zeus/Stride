/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SB_URL: process.env.NEXT_PUBLIC_SB_URL || 'https://ehrijrvefomqbobjtopj.supabase.co',
    NEXT_PUBLIC_SB_KEY: process.env.NEXT_PUBLIC_SB_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmlqcnZlZm9tcWJvYmp0b3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTI4NzgsImV4cCI6MjA4Mzc2ODg3OH0.vEJCx6jC05o3PfRismM0Q7re1RQjag4qlJ38uWW9NAo',
  },
}

module.exports = nextConfig
