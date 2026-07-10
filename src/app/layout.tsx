import type { Metadata } from 'next'
import { Oxanium, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const display = Oxanium({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--font-display' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Leonardo Marzeuski · Fullstack Software Engineer · AI / LLM',
  description:
    'A cinematic dive through a neon city — the portfolio of Leonardo Marzeuski, Fullstack Software Engineer building AI-powered products end to end.',
  keywords: ['Leonardo Marzeuski', 'Fullstack', 'AI', 'LLM', 'React', 'Next.js', 'Three.js', 'portfolio'],
  openGraph: {
    title: 'Leonardo Marzeuski · NEON DIVE',
    description: 'A cinematic dive through a neon city — fullstack engineer, AI/LLM products end to end.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
