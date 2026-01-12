import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stride',
  description: 'Project management for vibe coders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
