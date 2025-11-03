import type {
  Fighter,
  GameData,
  BattleEvent,
  BattleResult,
  FighterStats,
} from './types';

export class BattleEngine {
  private gameData: GameData;
  private challenger: Fighter;
  private opponent: Fighter;
  private challengerStats: FighterStats;
  private opponentStats: FighterStats;
  private battleLog: BattleEvent[] = [];
  private turn: number = 0;

  constructor(challenger: Fighter, opponent: Fighter, gameData: GameData) {
    this.gameData = gameData;
    this.challenger = challenger;
    this.opponent = opponent;

    console.log('=== BATTLE ENGINE INIT ===');
    console.log('Game data:', gameData);
    console.log('Archetype abilities:', gameData?.archetype_abilities);
    console.log('Challenger special move:', challenger.card.special_move);
    console.log('Opponent special move:', opponent.card.special_move);

    // Initialize stats with spirit animal modifiers
    this.challengerStats = this.calculateModifiedStats(challenger);
    this.opponentStats = this.calculateModifiedStats(opponent);
  }

  /**
   * Apply spirit animal modifiers to base stats
   */
  private calculateModifiedStats(fighter: Fighter): FighterStats {
    const { card } = fighter;
    const modifiers = this.gameData.spirit_animals[card.spirit_animal] || {
      attack: 1.0,
      defense: 1.0,
      speed: 1.0,
    };

    return {
      attack: card.attack * modifiers.attack,
      defense: card.defense * modifiers.defense,
      speed: card.speed * modifiers.speed,
      hp: this.gameData.mechanics.max_hp,
      maxHp: this.gameData.mechanics.max_hp,
    };
  }

  /**
   * Get type advantage multiplier
   */
  private getTypeMultiplier(attackerArchetype: string, defenderArchetype: string): number {
    const typeChart = this.gameData.type_chart[attackerArchetype];
    if (!typeChart) return this.gameData.mechanics.type_multipliers.neutral;

    if (typeChart.strong_against.includes(defenderArchetype)) {
      return this.gameData.mechanics.type_multipliers.strong;
    }

    if (typeChart.weak_against.includes(defenderArchetype)) {
      return this.gameData.mechanics.type_multipliers.weak;
    }

    return this.gameData.mechanics.type_multipliers.neutral;
  }

  /**
   * Calculate damage for an attack
   */
  private calculateDamage(
    attackerStats: FighterStats,
    defenderStats: FighterStats,
    attackerArchetype: string,
    defenderArchetype: string,
    isRebel: boolean = false
  ): number {
    // Base damage
    const baseDamage =
      (attackerStats.attack / defenderStats.defense) *
      this.gameData.mechanics.base_damage_multiplier;

    // Random variance (±15% or ±25% for Rebel)
    const variance = isRebel ? 0.25 : 0.15;
    const randomFactor = Math.random() * (variance * 2) + (1 - variance);

    // Type advantage
    const typeMultiplier = this.getTypeMultiplier(attackerArchetype, defenderArchetype);

    // Final damage
    const finalDamage = baseDamage * randomFactor * typeMultiplier;

    return Math.max(this.gameData.mechanics.minimum_damage, Math.round(finalDamage * 10) / 10);
  }

  /**
   * Apply passive abilities
   */
  private applyPassives(
    attackerStats: FighterStats,
    defenderStats: FighterStats,
    attackerArchetype: string,
    defenderArchetype: string
  ): { attackerBonus: number; defenderBonus: number } {
    let attackerBonus = 1.0;
    let defenderBonus = 1.0;

    // Magician: +10% damage vs weak types
    if (attackerArchetype === 'The Magician') {
      const typeMultiplier = this.getTypeMultiplier(attackerArchetype, defenderArchetype);
      if (typeMultiplier === this.gameData.mechanics.type_multipliers.strong) {
        attackerBonus *= 1.1;
      }
    }

    // Hero: +5% defense when below 50% HP
    if (defenderArchetype === 'The Hero' && defenderStats.hp < defenderStats.maxHp * 0.5) {
      defenderBonus *= 1.05;
    }

    // Ruler: +10% all stats when HP > 75%
    if (attackerArchetype === 'The Ruler' && attackerStats.hp > attackerStats.maxHp * 0.75) {
      attackerBonus *= 1.1;
    }

    // Lover: More damage as HP decreases
    if (attackerArchetype === 'The Lover') {
      const hpPercent = attackerStats.hp / attackerStats.maxHp;
      attackerBonus *= 1 + (1 - hpPercent) * 0.3; // Up to +30% at low HP
    }

    return { attackerBonus, defenderBonus };
  }

  /**
   * Determine turn order based on speed
   */
  private determineTurnOrder(): { first: 'challenger' | 'opponent'; second: 'challenger' | 'opponent' } {
    if (this.challengerStats.speed > this.opponentStats.speed) {
      return { first: 'challenger', second: 'opponent' };
    } else if (this.opponentStats.speed > this.challengerStats.speed) {
      return { first: 'opponent', second: 'challenger' };
    } else {
      // Tie - random
      return Math.random() > 0.5
        ? { first: 'challenger', second: 'opponent' }
        : { first: 'opponent', second: 'challenger' };
    }
  }

  /**
   * Get special move bonus for an archetype
   * Returns the first special move's damage bonus from the archetype
   */
  private getSpecialMoveBonus(archetype: string): number {
    const abilities = this.gameData.archetype_abilities[archetype];
    if (!abilities || !abilities.special_moves || abilities.special_moves.length === 0) {
      return 1.0; // No bonus
    }
    
    // Use the first special move's damage bonus
    const firstMove = abilities.special_moves[0];
    return firstMove.damage_bonus || 1.0;
  }

  /**
   * Execute a single attack (normal or special move)
   */
  private executeAttack(
    attacker: 'challenger' | 'opponent',
    defender: 'challenger' | 'opponent'
  ): void {
    const attackerFighter = attacker === 'challenger' ? this.challenger : this.opponent;
    const defenderFighter = defender === 'challenger' ? this.challenger : this.opponent;
    const attackerStats = attacker === 'challenger' ? this.challengerStats : this.opponentStats;
    const defenderStats = defender === 'challenger' ? this.challengerStats : this.opponentStats;

    // Check for Jester dodge (10% chance)
    if (defenderFighter.card.archetype === 'The Jester' && Math.random() < 0.1) {
      this.battleLog.push({
        type: 'passive_trigger',
        turn: this.turn,
        message: `${defenderFighter.profile.login} dodged the attack! (Jester Chaos)`,
        attacker: attackerFighter.profile.login,
        defender: defenderFighter.profile.login,
      });
      return;
    }

    // Check if using special move (every 3 turns after turn 2)
    const useSpecialMove = this.turn > 1 && this.turn % 3 === 0;
    const specialMoveName = attackerFighter.card.special_move; // Custom player name
    let specialMoveBonus = 1.0;
    
    if (useSpecialMove) {
      // Get damage bonus from archetype (not from move name)
      specialMoveBonus = this.getSpecialMoveBonus(attackerFighter.card.archetype);
    }

    // Calculate type advantage
    const typeMultiplier = this.getTypeMultiplier(
      attackerFighter.card.archetype,
      defenderFighter.card.archetype
    );

    // Calculate damage
    const isRebel = attackerFighter.card.archetype === 'The Rebel';
    let damage = this.calculateDamage(
      attackerStats,
      defenderStats,
      attackerFighter.card.archetype,
      defenderFighter.card.archetype,
      isRebel
    );

    // Apply passives
    const { attackerBonus, defenderBonus } = this.applyPassives(
      attackerStats,
      defenderStats,
      attackerFighter.card.archetype,
      defenderFighter.card.archetype
    );

    // Apply special move bonus
    damage = damage * attackerBonus * defenderBonus * specialMoveBonus;

    // Apply damage
    defenderStats.hp = Math.max(0, defenderStats.hp - damage);

    // Log attack
    if (useSpecialMove && specialMoveName) {
      this.battleLog.push({
        type: 'special_move',
        turn: this.turn,
        message: `${attackerFighter.profile.login} uses ${specialMoveName}!`,
        attacker: attackerFighter.profile.login,
        defender: defenderFighter.profile.login,
        damage: Math.round(damage * 10) / 10,
        attacker_hp: attackerStats.hp,
        defender_hp: defenderStats.hp,
        type_multiplier: typeMultiplier,
        special_move: specialMoveName,
      });
    } else {
      this.battleLog.push({
        type: 'attack',
        turn: this.turn,
        message: `${attackerFighter.profile.login} attacks ${defenderFighter.profile.login}`,
        attacker: attackerFighter.profile.login,
        defender: defenderFighter.profile.login,
        damage: Math.round(damage * 10) / 10,
        attacker_hp: attackerStats.hp,
        defender_hp: defenderStats.hp,
        type_multiplier: typeMultiplier,
      });
    }

    // Check for KO
    if (defenderStats.hp <= 0) {
      this.battleLog.push({
        type: 'knockout',
        turn: this.turn,
        message: `${defenderFighter.profile.login} has been knocked out!`,
        defender: defenderFighter.profile.login,
      });
    }
  }

  /**
   * Apply Caregiver regeneration
   */
  private applyRegeneration(): void {
    if (this.challenger.card.archetype === 'The Caregiver' && this.challengerStats.hp > 0) {
      this.challengerStats.hp = Math.min(
        this.challengerStats.maxHp,
        this.challengerStats.hp + 2
      );
    }
    if (this.opponent.card.archetype === 'The Caregiver' && this.opponentStats.hp > 0) {
      this.opponentStats.hp = Math.min(
        this.opponentStats.maxHp,
        this.opponentStats.hp + 2
      );
    }
  }

  /**
   * Simulate the entire battle
   */
  public simulate(): BattleResult {
    // Battle start
    this.battleLog.push({
      type: 'battle_start',
      message: `Battle begins! ${this.challenger.profile.login} (${this.challenger.card.archetype}) vs ${this.opponent.profile.login} (${this.opponent.card.archetype})`,
    });

    // Type advantage check
    const challengerTypeMultiplier = this.getTypeMultiplier(
      this.challenger.card.archetype,
      this.opponent.card.archetype
    );
    if (challengerTypeMultiplier === this.gameData.mechanics.type_multipliers.strong) {
      this.battleLog.push({
        type: 'type_advantage',
        message: `${this.challenger.card.archetype} has type advantage over ${this.opponent.card.archetype}!`,
      });
    } else if (challengerTypeMultiplier === this.gameData.mechanics.type_multipliers.weak) {
      this.battleLog.push({
        type: 'type_advantage',
        message: `${this.opponent.card.archetype} has type advantage over ${this.challenger.card.archetype}!`,
      });
    }

    // Speed check
    const turnOrder = this.determineTurnOrder();
    this.battleLog.push({
      type: 'speed_check',
      message: `${turnOrder.first === 'challenger' ? this.challenger.profile.login : this.opponent.profile.login} moves first! (Speed: ${Math.round(turnOrder.first === 'challenger' ? this.challengerStats.speed : this.opponentStats.speed)})`,
    });

    // Battle loop
    while (
      this.turn < this.gameData.mechanics.max_turns &&
      this.challengerStats.hp > 0 &&
      this.opponentStats.hp > 0
    ) {
      this.turn++;

      // Execute attacks in turn order
      this.executeAttack(turnOrder.first, turnOrder.second);
      if (this.challengerStats.hp > 0 && this.opponentStats.hp > 0) {
        this.executeAttack(turnOrder.second, turnOrder.first);
      }

      // Apply regeneration
      this.applyRegeneration();

      // Check for battle end
      if (this.challengerStats.hp <= 0 || this.opponentStats.hp <= 0) {
        break;
      }
    }

    // Determine winner
    const winner =
      this.challengerStats.hp > this.opponentStats.hp ? this.challenger : this.opponent;
    const loser =
      this.challengerStats.hp > this.opponentStats.hp ? this.opponent : this.challenger;

    this.battleLog.push({
      type: 'battle_end',
      message: `${winner.profile.login} wins the battle!`,
    });

    return {
      winner,
      loser,
      battle_log: this.battleLog,
      total_turns: this.turn,
      final_hp: {
        challenger: Math.round(this.challengerStats.hp * 10) / 10,
        opponent: Math.round(this.opponentStats.hp * 10) / 10,
      },
    };
  }
}

/**
 * Helper function to simulate a battle
 */
export function simulateBattle(
  challenger: Fighter,
  opponent: Fighter,
  gameData: GameData
): BattleResult {
  const engine = new BattleEngine(challenger, opponent, gameData);
  return engine.simulate();
}
