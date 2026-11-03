import { Player } from '../player/player.ts';
import { Ball } from '../balls/ball.ts';

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  cooldown: number;

  activate(player: Player, balls: Ball[]): void;
  update(player: Player, balls: Ball[]): void;
}

export class Ability {
  private definition: AbilityDefinition;
  private cooldownRemaining: number = 0;

  constructor(definition: AbilityDefinition){
    this.definition = definition;
  }


  public activate(player: Player, balls: Ball[]){
    if (this.cooldownRemaining > 0) return;
    
    this.definition.activate(player, balls);
    this.cooldownRemaining = this.definition.cooldown;
  }

  public update(dt: number, player: Player, balls: Ball[]){
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - 1);
    
    this.definition.update(player, balls);
  }
}
