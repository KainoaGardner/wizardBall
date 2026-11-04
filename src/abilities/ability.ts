import { Player } from '../player/player.ts';
import { Ball } from '../balls/ball.ts';
import type { BallFactory } from '../balls/ballFactory.ts';
import { Container } from 'pixi.js';

export interface AbilityState {
  ballFactory: BallFactory,
  worldContainer: Container,
  player: Player,
  balls: Ball[],
  pendingBalls: Ball[]
}

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  cooldown: number;

  activate(state: AbilityState): boolean;
  update(player: Player, balls: Ball[]): void;
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

  public update(dt: number, player: Player, balls: Ball[]){
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - 1);
    
    this.definition.update(player, balls);
  }
}
