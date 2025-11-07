# Contributing to TecHub Battles

## Development Principles

This project follows Rails-inspired best practices adapted for Next.js with modern React patterns:

### 1. **Convention Over Configuration**

- Follow established file structure patterns
- Use consistent naming conventions
- Leverage Next.js app router conventions
- Maintain TypeScript strict mode compliance

### 2. **DRY (Don't Repeat Yourself)**

- Extract reusable components
- Create utility functions for common operations
- Use TypeScript types to enforce consistency
- Implement intelligent caching to reduce redundant API calls

### 3. **Test-Driven Development**

- Write tests for new features
- Maintain 90%+ code coverage (updated from 70%)
- Test behavior, not implementation
- Ensure all tests pass before merging

### 4. **Separation of Concerns**

```
lib/          - Business logic, pure functions, API clients
components/   - Presentational components with hooks
app/          - Pages and routing logic
__tests__/    - Test files mirroring source structure
```

### 5. **Performance First**

- Client-side battle simulation for instant results
- Incremental data sync to minimize API calls
- Firebase caching for offline capability
- Optimized bundle sizes with tree shaking

## Current Architecture

### File Structure (Updated)

```
techub-battles/
├── app/                    # Next.js pages (app router)
│   ├── page.tsx           # Home - fighter selection
│   ├── battle/page.tsx    # Battle arena with auto-starting battles
│   ├── leaderboard/       # Rankings and statistics
│   ├── directory/         # Fighter browser
│   ├── player/[login]/    # Dynamic player profiles
│   └── sitemap.ts         # SEO sitemap generation
├── components/            # Reusable React components
│   ├── BattleArena.tsx    # Main battle interface with animations
│   ├── FighterCard.tsx    # Fighter display with dynamic HP bars
│   ├── BattleControls.tsx # Battle playback controls
│   └── TwitterBanner.tsx  # Browser detection and guidance
├── lib/                   # Business logic & utilities
│   ├── battle-engine.ts   # Core battle simulation (client-side)
│   ├── battle-storage.ts  # Firebase operations and battle saving
│   ├── fighter-sync.ts    # Incremental data synchronization
│   ├── techub-api.ts      # Rails API client with existing endpoints
│   ├── twitter-detection.ts # Client-side browser detection
│   ├── firebase.ts        # Firebase configuration
│   └── types.ts           # Comprehensive TypeScript definitions
└── __tests__/             # Test files (18 tests passing)
    ├── lib/               # Unit tests for business logic
    ├── components/        # Component tests with React Testing Library
    └── integration/       # End-to-end workflow tests
```

### Key Architectural Decisions

#### Client-Side Battle Engine

- All battle computations run in the user's browser
- Eliminates server costs and provides instant results
- Complex damage calculations with type advantages and spirit animals
- Real-time animations with Framer Motion

#### Intelligent Data Sync

- Incremental sync using existing Rails API endpoints
- Timestamp-based comparison to only update changed fighters
- 24-hour Firestore caching with 1-hour sync intervals
- Graceful fallback to cached data when Rails is unavailable

#### Twitter Detection System

- Client-side browser detection for Twitter/X in-app browser
- Non-intrusive banner suggesting browser switch
- SSR-safe implementation with proper error handling

### Naming Conventions

**Files:**

- Components: `PascalCase.tsx` (e.g., `FighterCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `battle-engine.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

**Variables:**

- Components: `PascalCase` (e.g., `FighterCard`)
- Functions: `camelCase` (e.g., `simulateBattle`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_TURNS`)
- Types/Interfaces: `PascalCase` (e.g., `Fighter`, `BattleResult`)

## Development Workflow

### 1. Setup

```bash
npm install
cp .env.example .env.local
# Add your Firebase credentials to .env.local
```

### 2. Development

```bash
npm run dev          # Start dev server
npm run lint         # Run linter
npm run type-check   # TypeScript checks
npm test             # Run tests
```

### 3. Before Committing

```bash
npm run lint         # Fix linting issues
npm test             # Ensure tests pass
npm run build        # Verify build succeeds
```

## Writing Code

### Components

**Good Component Structure:**

```typescript
'use client';

import { useState } from 'react';
import type { Fighter } from '@/lib/types';

interface FighterCardProps {
  fighter: Fighter;
  hp: number;
  maxHp: number;
  isWinner?: boolean;
}

export default function FighterCard({
  fighter,
  hp,
  maxHp,
  isWinner = false
}: FighterCardProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Business Logic

**Keep logic in `lib/`:**

```typescript
// lib/battle-engine.ts
export function simulateBattle(
  challenger: Fighter,
  opponent: Fighter,
  gameData: GameData
): BattleResult {
  // Pure function - no side effects
  // Fully testable
}
```

### Type Safety

**Always define types:**

```typescript
// lib/types.ts
export interface Fighter {
  profile: Profile;
  card: ProfileCard;
}

export interface BattleResult {
  winner: Fighter;
  loser: Fighter;
  battle_log: BattleEvent[];
  total_turns: number;
  final_hp: { challenger: number; opponent: number };
}
```

## Testing Guidelines

### Test Coverage Requirements

- **Minimum 70%** for all metrics
- **100%** for critical business logic (battle engine)
- **Integration tests** for user workflows

### Test Structure

```typescript
describe('Feature/Component Name', () => {
  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = createMockData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Verify quality**

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit with clear messages**

   ```bash
   git commit -m "feat: add player profile page with battle history"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(battle): add type advantage multiplier
fix(leaderboard): correct win rate calculation
docs(testing): add integration test examples
refactor(components): extract reusable FighterStats component
```

## Code Style

### TypeScript

- Use strict mode
- Avoid `any` type
- Define interfaces for all data structures
- Use type inference where appropriate

### React

- Prefer functional components
- Use hooks for state management
- Keep components focused and small
- Extract complex logic to custom hooks

### Styling

- Use Tailwind CSS utility classes
- Follow existing color/spacing patterns
- Ensure dark mode compatibility
- Mobile-first responsive design

## Performance

- Minimize client-side JavaScript
- Use Next.js Image component for images
- Implement proper loading states
- Optimize Firebase queries
- Use React.memo for expensive components

## Security

- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Sanitize data before rendering
- Follow Firebase security rules

## Questions?

- Check existing code for patterns
- Review TESTING.md for test guidelines
- Ask in discussions before making large changes
