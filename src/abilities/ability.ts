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
  variables?: Record<string, number>;

  activate(state: AbilityState, variables: Record<string, number>): boolean;
  update(state: AbilityState, variables: Record<string, number>): void;
}

export class Ability {
  private definition: AbilityDefinition;
  private cooldownRemaining: number = 0;
  private variables: Record<string, number> = {};

  constructor(definition: AbilityDefinition){
    this.definition = definition;
    this.variables = {...(definition.variables ?? {})}
  }

  public getDefinition(){
    return this.definition;
  }

  public activate(state: AbilityState): boolean{
    if (this.cooldownRemaining > 0) return false;
    
    const result = this.definition.activate(state, this.variables);
    if (!result) return false;

    this.cooldownRemaining = this.definition.cooldown;
    return true;
  }

  public update(state: AbilityState){
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - 1);
    this.definition.update(state, this.variables);
  }
}
