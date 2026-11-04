import { Player, PLAYER_ID } from '../player/player.ts';
import { Game } from '../game.ts';
import { Ball } from '../balls/ball.ts';
import type { BallFactory } from '../balls/ballFactory.ts';
import { Container } from 'pixi.js';

export interface AbilityState {
  game: Game,
  playerId: PLAYER_ID,
}

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  cooldown: number;

  activate(state: AbilityState): boolean;
  update(state: AbilityState): void;
}

export class Ability {
  private definition: AbilityDefinition;
  private cooldownRemaining: number = 0;

  constructor(definition: AbilityDefinition){
    this.definition = definition;
  }


  public activate(state: AbilityState){
    if (this.cooldownRemaining > 0) return;
    
    this.definition.activate(state);
    this.cooldownRemaining = this.definition.cooldown;
  }

  public update(dt: number, state: AbilityState){
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - 1);
    
    this.definition.update(state);
  }
}
