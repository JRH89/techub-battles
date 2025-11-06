import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FighterCard from '@/components/FighterCard';
import type { Fighter } from '@/lib/types';

const mockFighter: Fighter = {
  profile: {
    id: 1,
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.png',
  },
  card: {
    attack: 75,
    defense: 60,
    speed: 80,
    archetype: 'Code Warrior',
    spirit_animal: 'Kangaroo',
  },
};

describe('FighterCard', () => {
  it('renders fighter information correctly', () => {
    render(
      <FighterCard
        fighter={mockFighter}
        hp={100}
        maxHp={100}
        isWinner={false}
        side="left"
      />
    );

    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Code Warrior')).toBeInTheDocument();
    expect(screen.getByText(/Kangaroo/)).toBeInTheDocument();
  });

  it('displays stats correctly', () => {
    render(
      <FighterCard
        fighter={mockFighter}
        hp={100}
        maxHp={100}
        isWinner={false}
        side="left"
      />
    );

    expect(screen.getByText('75')).toBeInTheDocument(); // Attack
    expect(screen.getByText('60')).toBeInTheDocument(); // Defense
    expect(screen.getByText('80')).toBeInTheDocument(); // Speed
  });

  it('shows HP bar with correct percentage', () => {
    render(
      <FighterCard
        fighter={mockFighter}
        hp={50}
        maxHp={100}
        isWinner={false}
        side="left"
      />
    );

    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('displays winner badge when isWinner is true', () => {
    render(
      <FighterCard
        fighter={mockFighter}
        hp={100}
        maxHp={100}
        isWinner={true}
        side="left"
      />
    );

    // Check for crown emoji which indicates winner
    const crownElement = screen.getByText('👑');
    expect(crownElement).toBeInTheDocument();
  });

  it('handles zero HP correctly', () => {
    render(
      <FighterCard
        fighter={mockFighter}
        hp={0}
        maxHp={100}
        isWinner={false}
        side="left"
      />
    );

    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });
});
