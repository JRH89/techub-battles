# Testing Guide

## Overview

This project follows Rails-inspired testing best practices adapted for Next.js:

- **Unit Tests**: Test individual functions and utilities in isolation
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test feature workflows end-to-end
- **Coverage Requirements**: Minimum 70% coverage for all metrics

## Test Structure

```
__tests__/
├── lib/                    # Unit tests for business logic
│   ├── battle-engine.test.ts
│   ├── battle-storage.test.ts
│   └── fighter-sync.test.ts
├── components/             # Component tests
│   ├── FighterCard.test.tsx
│   ├── BattleArena.test.tsx
│   └── Navbar.test.tsx
└── integration/            # Integration tests
    ├── battle-flow.test.tsx
    └── leaderboard.test.tsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- battle-engine.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Battle Engine"
```

## Writing Tests

### Unit Tests (lib/)

Test pure functions and business logic:

```typescript
import { simulateBattle } from '@/lib/battle-engine';

describe('Battle Engine', () => {
  it('should return a valid battle result', () => {
    const result = simulateBattle(challenger, opponent, gameData);
    expect(result).toHaveProperty('winner');
    expect(result).toHaveProperty('loser');
  });
});
```

### Component Tests (components/)

Test React components with user interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import FighterCard from '@/components/FighterCard';

describe('FighterCard', () => {
  it('renders fighter information', () => {
    render(<FighterCard fighter={mockFighter} hp={100} maxHp={100} />);
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });
});
```

### Integration Tests (integration/)

Test complete user workflows:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('Battle Flow', () => {
  it('completes a full battle from selection to results', async () => {
    // Test multi-step user journey
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad**: Testing internal state
```typescript
expect(component.state.count).toBe(5);
```

✅ **Good**: Testing user-visible behavior
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ **Bad**: `it('works', () => {})`

✅ **Good**: `it('should display winner badge when battle is complete', () => {})`

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate damage correctly', () => {
  // Arrange
  const attacker = createMockFighter({ attack: 100 });
  const defender = createMockFighter({ defense: 50 });
  
  // Act
  const damage = calculateDamage(attacker, defender);
  
  // Assert
  expect(damage).toBeGreaterThan(0);
});
```

### 4. Mock External Dependencies

```typescript
// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  app: {},
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

### 5. Test Edge Cases

- Empty states
- Error conditions
- Boundary values
- Null/undefined inputs
- Maximum/minimum values

## Coverage Requirements

Maintain minimum 70% coverage for:
- **Branches**: Conditional logic paths
- **Functions**: All exported functions
- **Lines**: Code execution
- **Statements**: Individual statements

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Main branch pushes

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- FighterCard.test.tsx

# Debug in VS Code
# Add breakpoint and use "Jest: Debug" configuration
```

## Common Patterns

### Testing Async Operations

```typescript
it('loads battle data', async () => {
  render(<BattlePage />);
  
  await waitFor(() => {
    expect(screen.getByText('Battle Arena')).toBeInTheDocument();
  });
});
```

### Testing User Events

```typescript
it('starts battle on button click', () => {
  render(<BattleControls />);
  
  const playButton = screen.getByRole('button', { name: /play/i });
  fireEvent.click(playButton);
  
  expect(screen.getByText('Battle in progress')).toBeInTheDocument();
});
```

### Testing Forms

```typescript
it('submits fighter selection', () => {
  render(<FighterSelector />);
  
  const select = screen.getByLabelText('Challenger');
  fireEvent.change(select, { target: { value: 'fighter1' } });
  
  const submitButton = screen.getByRole('button', { name: /start/i });
  fireEvent.click(submitButton);
  
  expect(mockRouter.push).toHaveBeenCalledWith('/battle?challenger=fighter1');
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
