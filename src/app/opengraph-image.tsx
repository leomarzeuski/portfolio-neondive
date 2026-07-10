import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Leonardo Marzeuski — NEON DIVE portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a0a1e 0%, #050510 60%, #02020a 100%)',
          color: '#e6edff',
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: '0.06em',
        }}
      >
        <div style={{ display: 'flex', textShadow: '0 0 32px rgba(34,211,238,0.8)' }}>LEONARDO MARZEUSKI</div>
        <div style={{ display: 'flex', fontSize: 30, marginTop: 18, color: '#22d3ee', letterSpacing: '0.3em' }}>
          FULLSTACK ENGINEER · AI / LLM · NEON DIVE
        </div>
      </div>
    ),
    size,
  )
}
