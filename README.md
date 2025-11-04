# 🎮 TecHub Battles

<img width="3784" height="1739" alt="image" src="https://github.com/user-attachments/assets/50fc019d-90cc-43a2-b56e-f1fab9d3a059" />

A Next.js battle viewer for TecHub GitHub developer cards with **100% client-side simulation** for zero server costs!

## Features

- ⚔️ **Live Battle Animation** - Watch battles play out turn-by-turn
- 💚 **HP Bars** - Smooth color-changing health bars with Framer Motion
- 🎯 **Type Advantages** - 12 archetypes with Pokémon-style matchups
- 🦘 **Spirit Animals** - 33 animals with unique stat modifiers
- ✨ **Passive Abilities** - Each archetype has special powers
- 🎨 **Beautiful UI** - Tailwind CSS with dark mode
- 🚀 **Client-Side Logic** - All battles run in browser (FREE on Vercel!)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Axios** - API client
- **Lucide React** - Icons

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API

Create `.env.local`:

```bash
NEXT_PUBLIC_TECHUB_API=http://localhost:3000/api/v1
```

For production:
```bash
NEXT_PUBLIC_TECHUB_API=https://techub.life/api/v1
```

### 3. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Make Sure Rails is Running

The Rails API must be running to fetch fighter data:

```bash
cd ../rails/techub
rails s
```

## Usage

1. **Select Fighters** - Choose two profiles from dropdowns
2. **Start Battle** - Click "Start Battle!" to begin
3. **Watch Animation** - Click "Play Battle" to see it animated
4. **Control Speed** - Adjust playback (0.5x to 4x)

## Architecture

### Client-Side Battle Engine

All battle logic runs in TypeScript in the browser:

```typescript
// lib/battle-engine.ts
export class BattleEngine {
  // Applies type advantages
  // Calculates damage with spirit animal modifiers
  // Handles passive abilities
  // Generates complete battle log
}
```

### Rails API (Data Only)

Rails only serves game data - no compute:

- `GET /api/v1/game-data/all` - Archetypes, type chart, spirit animals
- `GET /api/v1/profiles/:username/card` - Fighter stats
- `GET /api/v1/profiles/battle-ready` - List of fighters

## Battle Mechanics

### Type Advantages
- **Strong**: 1.5x damage
- **Weak**: 0.75x damage
- **Neutral**: 1.0x damage

### Spirit Animal Modifiers
- **Taipan**: Speed 1.3x, Attack 1.2x
- **Loftbubu**: Speed 1.3x, Attack 1.2x, Defense 1.1x
- **Dragon**: Attack 1.4x, Defense 1.2x, Speed 1.1x

### Passive Abilities
- **Magician**: +10% damage vs weak types
- **Hero**: +5% defense when HP < 50%
- **Rebel**: ±25% damage variance (chaos!)
- **Explorer**: +15% speed always
- **Jester**: 10% dodge chance
- **Caregiver**: Regenerate 2 HP/turn
- **Lover**: More damage as HP decreases

### Damage Formula

```typescript
baseDamage = (ATK / DEF) * 10
randomFactor = 0.85 to 1.15 (±15%)
typeMultiplier = 0.75x, 1.0x, or 1.5x
finalDamage = baseDamage * randomFactor * typeMultiplier
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Fighter selection
│   └── battle/page.tsx       # Battle viewer
├── components/
│   ├── BattleArena.tsx       # Main battle display
│   ├── FighterCard.tsx       # Fighter with HP bar
│   ├── HPBar.tsx             # Animated health bar
│   ├── BattleLog.tsx         # Turn-by-turn log
│   └── BattleControls.tsx    # Play/pause/speed
└── lib/
    ├── battle-engine.ts      # Core simulation
    ├── techub-api.ts         # API client
    └── types.ts              # TypeScript types
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
# NEXT_PUBLIC_TECHUB_API=https://techub.life/api/v1
```

**Free tier includes:**
- Unlimited deployments
- Edge functions
- Automatic HTTPS
- Global CDN

## Cost Optimization

### Before (Rails-only):
- Every battle = Rails compute
- Railway costs scale with usage
- Expensive at scale

### After (Next.js):
- **Rails**: Just JSON responses (~$0.01/1000 requests)
- **Next.js**: Battle runs client-side (FREE)
- **Vercel**: Free tier = unlimited battles
- **Total**: ~$0 for battles! 🎉

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Links

- **TecHub**: https://techub.life
- **Rails API**: See `docs/api/battle-game-data.md` in Rails repo
- **Battle Mechanics**: See `docs/api/battle-system-complete.md`

---

Built with ❤️ for TecHub - Where GitHub developers battle!
