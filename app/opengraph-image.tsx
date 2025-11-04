import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'TecHub Battles - Epic Developer Profile Battles';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #581c87 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #eab308 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          ⚔️ TecHub Battles ⚔️
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#cbd5e1',
            marginTop: '40px',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Watch developer profiles battle with unique stats, archetypes, and special moves!
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
