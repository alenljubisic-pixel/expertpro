import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, display: 'flex' }}>ExpertPro</div>
        <div style={{ fontSize: 36, marginTop: 20, opacity: 0.9, display: 'flex' }}>
          Honorarni poslovi u Srbiji
        </div>
      </div>
    ),
    { ...size }
  )
}
