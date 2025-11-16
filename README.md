# TecHub Battles

<img width="3784" height="1739" alt="TecHub Battles Interface" src="https://github.com/user-attachments/assets/50fc019d-90cc-43a2-b56e-f1fab9d3a059" />

TecHub Battles is an innovative battle simulation system that transforms GitHub developer profiles into epic combatants. Built as a Next.js frontend companion to the TecHub Rails API, this application creates engaging Pokémon-style battles where developers' skills, archetypes, and spirit animals determine their combat prowess. The system features sophisticated client-side battle mechanics, real-time animations, and intelligent caching strategies that deliver a seamless gaming experience while minimizing server costs.

## About The Application

TecHub Battles represents a unique fusion of developer culture and gaming mechanics, turning technical profiles into strategic battle cards. Each GitHub developer becomes a fighter with stats derived from their coding activity, assigned an archetype that defines their combat style, and paired with a spirit animal that provides unique stat modifiers. The battle system employs complex calculations including type advantages (like Pokémon's strengths/weaknesses), passive abilities that trigger under specific conditions, and dynamic damage formulas that create unpredictable yet balanced encounters. What makes this system particularly innovative is its client-side architecture - all battle computations happen instantly in the user's browser, eliminating server costs while providing immediate feedback and smooth animations. The application automatically syncs fighter data from the Rails API, caches it intelligently in Firestore, and can even detect when users are accessing from Twitter's in-app browser to suggest a better experience. From the dramatic 3-2-1 countdown to the speed advantage display and special move effects, every element is designed to create an engaging, competitive atmosphere that celebrates the diversity and skills within the developer community.

## Key Features

### Battle System

- **Auto-Starting Battles** - No manual play button needed! Battles begin automatically with a dramatic 3-2-1 countdown
- **Dynamic HP Bars** - Smooth, color-changing health indicators that transition from green to yellow to red based on damage taken
- **Type Advantage System** - 12 unique archetypes with Pokémon-style strength/weakness mechanics (1.5x strong, 0.75x weak damage)
- **Spirit Animal Modifiers** - 33 different animals providing unique stat boosts (speed, attack, defense enhancements)
- **Speed Advantage Display** - Shows which fighter attacks first based on speed stats, displayed between countdown and battle start
- **Passive Abilities** - Each archetype has special powers that trigger under specific conditions
- **Turn-by-Turn Animation** - Smooth battle animations with attack messages, damage indicators, and special move effects
- **Winner Celebration** - Animated trophy and confetti effects for battle victors

### User Experience

- **Dark Mode Support** - Full dark/light theme compatibility with Tailwind CSS
- **Mobile Responsive** - Optimized for all screen sizes with landscape orientation detection
- **Twitter Detection** - Automatically detects Twitter/X in-app browser users and suggests opening in a regular browser
- **Intelligent Caching** - Incremental sync system that only updates changed fighters, reducing API calls
- **Instant Performance** - Client-side battle simulation provides immediate results without server delays
- **Battle Controls** - Pause, reset, and restart functionality for battle management

### Technical Excellence

- **Type Safety** - Full TypeScript implementation with comprehensive type definitions
- **Comprehensive Testing** - Full test suite covering battle engine, components, and API integration
- **Battle Storage** - Firebase integration for storing battle results and leaderboards
- **Beautiful Animations** - Framer Motion powered transitions and effects
- **Optimized Build** - Turbopack support for fast development builds

## Technology Stack

### Frontend Framework

- **Next.js 16.0.1** - React framework with App Router and Server Components
- **TypeScript** - End-to-end type safety and IntelliSense support
- **Tailwind CSS v4** - Utility-first styling with dark mode support
- **Framer Motion** - Production-ready animations and transitions

### API & Data

- **Axios** - HTTP client for Rails API communication
- **Firebase Firestore** - Real-time database for caching and battle storage
- **Lucide React** - Modern icon library for UI components

### Development & Testing

- **Jest** - Testing framework with comprehensive test coverage
- **React Testing Library** - Component testing utilities
- **ESLint** - Code quality and consistency enforcement

## Getting Started

### Prerequisites

- Node.js 18+ installed
- TecHub Rails API running (for initial data sync)
- Firebase project configured (for caching/storage)

### Installation

1. **Clone and Install Dependencies**

```bash
git clone <repository-url>
cd techub-battles
npm install
```

2. **Environment Configuration**
   Create `.env.local` with your API endpoints:

```bash
# Development (local Rails)
NEXT_PUBLIC_TECHUB_API=http://localhost:3000/api/v1

# Production
NEXT_PUBLIC_TECHUB_API=https://techub.life/api/v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=app_id
```

3. **Start Development Server**

```bash
npm run dev
```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Data Setup

The application requires fighter data from the Rails API:

1. **Ensure Rails API is running:**

```bash
cd ../rails/techub
rails s
```

2. **Automatic Sync** - The app will automatically sync fighter data on first load
3. **HTTP Caching** - Uses standard HTTP caching (304 Not Modified) for efficient API calls
4. **Offline Capability** - Firestore cache enables battles when API is unreachable

## Battle Mechanics Deep Dive

### Core Combat System

The battle engine uses a sophisticated calculation system:

```typescript
// Base damage calculation
baseDamage = (attacker.attack / defender.defense) * baseMultiplier

// Random variance for unpredictability
randomFactor = 0.85 to 1.15 (±15% variance)

// Type advantage multiplier
typeMultiplier = {
  strong: 1.5,    // Super effective
  neutral: 1.0,   // Normal damage
  weak: 0.75      // Not very effective
}

// Final damage with all modifiers
finalDamage = baseDamage * randomFactor * typeMultiplier * spiritAnimalModifier
```

### Archetype System

12 unique archetypes, each with distinct playstyles:

| Archetype            | Style       | Passive Ability             |
| -------------------- | ----------- | --------------------------- |
| **Code Warrior**     | Offensive   | +10% damage vs weak types   |
| **Bug Hunter**       | Tactical    | +5% critical hit chance     |
| **Architect**        | Defensive   | +10% defense when HP < 50%  |
| **Data Scientist**   | Analytical  | +15% accuracy               |
| **DevOps Engineer**  | Support     | Heal 5 HP every 3 turns     |
| **UI/UX Designer**   | Creative    | 10% dodge chance            |
| **Product Manager**  | Strategic   | +20% speed when losing      |
| **Security Expert**  | Protective  | Reflect 10% damage taken    |
| **Cloud Engineer**   | Adaptive    | Weather-based stat boosts   |
| **AI Engineer**      | Smart       | Predict next opponent move  |
| **Database Admin**   | Stable      | 25% reduced damage variance |
| **Technical Writer** | Informative | Reveal enemy stats          |

### Spirit Animal Enhancements

33 spirit animals providing strategic stat modifications:

- **Speed Specialists**: Taipan, Loftbubu, Cheetah (+30% speed)
- **Power Boosters**: Dragon, Gorilla, Bear (+40% attack)
- **Defensive Guardians**: Turtle, Elephant, Rhino (+30% defense)
- **Balanced Fighters**: Wolf, Eagle, Lion (+20% all stats)
- **Exotic Variants**: Phoenix (resurrect once), Unicorn (heal boost), Dragon (ultimate power)

### Special Move System

Each fighter has a unique special move that charges during battle:

- **Charge Rate**: Builds up as damage is dealt/received
- **Activation**: Automatic when fully charged
- **Effects**: Range from massive damage to healing and status effects
- **Visual Feedback**: Glowing card effects and dramatic animations

## Project Architecture

```
techub-battles/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home - fighter selection
│   ├── battle/page.tsx          # Battle arena
│   ├── player/[login]/page.tsx  # Individual profiles
│   ├── leaderboard/page.tsx     # Rankings and stats
│   ├── directory/page.tsx       # Fighter browser
│   └── sitemap.ts               # SEO sitemap
├── components/                   # React components
│   ├── BattleArena.tsx          # Main battle interface
│   ├── FighterCard.tsx          # Fighter display with HP
│   ├── BattleControls.tsx       # Play/pause/reset controls
│   └── TwitterBanner.tsx        # Browser detection banner
├── lib/                         # Core business logic
│   ├── battle-engine.ts         # Battle simulation engine
│   ├── battle-storage.ts        # Firebase operations
│   ├── fighter-sync.ts          # Incremental data sync
│   ├── techub-api.ts            # Rails API client
│   ├── twitter-detection.ts     # Client-side browser detection
│   ├── firebase.ts              # Firebase configuration
│   └── types.ts                 # TypeScript definitions
└── __tests__/                    # Test suites
    ├── components/              # Component tests
    ├── lib/                     # Logic tests
    └── integration/             # End-to-end tests
```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run dev:webpack     # Use Webpack instead of Turbopack

# Building & Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint checking
npm run type-check       # TypeScript validation
npm run test             # Run test suite
npm run test:watch       # Watch mode testing
npm run test:coverage    # Coverage report
```

### Testing Strategy

The application maintains comprehensive test coverage:

- **Unit Tests**: Battle engine calculations, API utilities
- **Component Tests**: React component behavior and rendering
- **Integration Tests**: Full battle flow and data synchronization
- **Type Safety**: Full TypeScript coverage with strict mode

### Performance Optimizations

- **Incremental Sync**: Only updates changed fighters from Rails API
- **Client-Side Simulation**: Zero server computation during battles
- **HTTP Caching**: Leverages 304 responses to minimize bandwidth and API costs
- **Firestore Cache**: Local cache for offline capability and fallback
- **Bundle Optimization**: Tree shaking and code splitting
- **Image Optimization**: Next.js automatic image optimization

## Deployment Guide

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy Project**

```bash
vercel --prod
```

3. **Configure Environment Variables**
   In Vercel dashboard, set:

- `NEXT_PUBLIC_TECHUB_API=https://techub.life/api/v1`
- Firebase configuration variables

### Environment-Specific Configurations

**Development:**

- Local Rails API: `http://localhost:3000/api/v1`
- Hot reload enabled
- Detailed error messages
- Console logging for debugging

**Production:**

- Production Rails API: `https://techub.life/api/v1`
- Optimized builds
- Error reporting
- Performance monitoring

## Cost Analysis & Optimization

### Architecture Benefits

**Traditional Server-Side Battles:**

- Rails compute for every battle
- Database queries per turn
- Server costs scale with user engagement
- Potential bottlenecks during high traffic

**TecHub Battles Approach:**

- Rails: JSON responses only (~$0.01/1000 requests)
- Next.js: Client-side battles (FREE on Vercel)
- Firebase: Caching and storage (~$0-20/month based on usage)
- **Result**: ~90% cost reduction at scale

### Scaling Advantages

- **Unlimited Battles**: Client-side computation means no server scaling needed
- **Global CDN**: Vercel Edge Network for instant loading worldwide
- **Smart Caching**: Incremental sync reduces API calls by 80-90%
- **Offline Capability**: Cached data enables battles without internet

## Troubleshooting Guide

### Common Issues

**"Server unable to be reached" Error**

- **Cause**: Rails API not running or network issues
- **Solution**: App automatically falls back to cached Firestore data
- **Prevention**: Firestore cache provides graceful degradation

**No Fighters Available**

- **Cause**: First-time setup without initial sync
- **Solution**: Ensure Rails API is running and refresh page
- **Verification**: Check `.env.local` API configuration

**Twitter Browser Issues**

- **Cause**: Twitter's in-app browser limitations
- **Solution**: App detects and suggests browser switch
- **User Experience**: Non-intrusive banner with easy dismissal

**Build Errors**

- **Cause**: TypeScript type mismatches or missing dependencies
- **Solution**: Run `npm run type-check` and `npm install`
- **Prevention**: Regular test suite execution

### Performance Issues

**Slow Initial Load**

- **Cause**: First-time data sync from Rails
- **Solution**: Implement loading states and progress indicators
- **Optimization**: Pre-populate Firestore with seed data

**Battle Lag**

- **Cause**: Complex animations on low-end devices
- **Solution**: Reduce animation quality or disable effects
- **Monitoring**: Performance metrics and user feedback

## API Integration

### Required Rails Endpoints

The application expects these Rails API endpoints:

```bash
# Game Data
GET /api/v1/game-data/all
# Returns: archetypes, type_chart, spirit_animals, abilities, mechanics

# Individual Fighter
GET /api/v1/profiles/:username/card
# Returns: profile info, battle stats, archetype, spirit animal

# Battle-Ready Fighters
GET /api/v1/profiles/battle-ready
# Returns: Array of all available fighters
# Supports: ETag/Last-Modified headers for 304 caching

# Battle Results (Optional)
POST /api/v1/battles
# Records battle outcome for leaderboards
```

### HTTP Caching Implementation (Rails)

To minimize API costs and bandwidth, implement conditional GET support:

```ruby
# app/controllers/api/v1/profiles_controller.rb
def battle_ready
  # Use the latest updated_at timestamp as ETag
  last_modified = Profile.battle_ready.maximum(:updated_at)

  # Rails automatically returns 304 if client's ETag matches
  if stale?(last_modified: last_modified, public: true)
    @profiles = Profile.battle_ready.includes(:card)
    render json: { profiles: @profiles }
  end
  # If not stale, Rails sends 304 Not Modified (no body, minimal bandwidth)
end
```

**Benefits:**

- 304 responses are ~200 bytes vs full JSON (potentially KB/MB)
- No database queries or JSON serialization on cache hits
- Significantly reduces hosting costs and API load
- Client always gets fresh data when it changes

````

### Data Schema

**Profile Structure:**
```typescript
interface Profile {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  updated_at?: string; // For incremental sync
}
````

**Battle Card Structure:**

```typescript
interface ProfileCard {
  archetype: string;
  spirit_animal: string;
  attack: number;
  defense: number;
  speed: number;
  special_move?: string;
  special_move_description?: string;
}
```

## Future Enhancements

### Planned Features

- **Real-Time Multiplayer**: WebSocket-based spectator battles
- **Tournament Mode**: Bracket-style competitions
- **Advanced Analytics**: Battle statistics and win rates
- **Custom Battles**: User-defined rule sets and modifiers
- **Achievement System**: Unlockable titles and badges
- **Battle Replays**: Save and share epic battles
- **Leaderboard Globalization**: Regional and team rankings

### Technical Improvements

- **PWA Support**: Offline battles and installable app
- **Advanced Animations**: Particle effects and sound design
- **AI Opponents**: Computer-controlled fighters for practice
- **Live Streaming**: Twitch integration for battle broadcasts
- **Mobile App**: React Native version for iOS/Android

## License & Contributing

This project is part of the TecHub ecosystem and follows the same licensing terms. Contributions are welcome through the standard GitHub pull request process.

### Development Guidelines

- Follow TypeScript strict mode conventions
- Maintain test coverage above 90%
- Use conventional commit messages
- Ensure mobile responsiveness for all changes
- Document new features in README

---

**TecHub**: [https://techub.life](https://techub.life)  
**Battle Arena**: [https://techub.life/battle](https://techub.life/battle)  
