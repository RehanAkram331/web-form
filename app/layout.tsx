// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Advance Heating & Cooling | Request Service Online',
  description: 'Expert HVAC service – heating, cooling, heat pumps, and more. Request service online in minutes.',
  openGraph: {
    title: 'Advance Heating & Cooling',
    description: 'Expert HVAC service for your home or business.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
