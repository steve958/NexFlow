import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 64,
  height: 64,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f1729',
          borderRadius: '16px',
        }}
      >
        <svg width="56" height="56" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="189" cy="120" r="45" stroke="#2196F3" stroke-width="20" fill="none"/>
          <circle cx="363" cy="120" r="45" stroke="#2196F3" stroke-width="20" fill="none"/>
          <path d="M189 165 L189 240 L276 310 L363 240 L363 165" stroke="#2196F3" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M246 310 L246 350 M306 310 L306 350" stroke="#2196F3" stroke-width="20" stroke-linecap="round"/>
          <path d="M226 370 L226 390 L276 390 M326 370 L326 390 L276 390" stroke="#2196F3" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
