import type { AbilityDefinition, AbilityState } from "./ability";

import { Ball } from '../balls/ball.ts';
import { Player } from '../player/player.ts';
import { STEP } from "../utils/global.ts";

import { BallFactory } from '../balls/ballFactory.ts';

export enum ABILITY_SLOT {
  Ability1 = "ability1",
  Ability2 = "ability2",
}

export class AbilityManager {
  private abilites: Map<string, AbilityDefinition>;
  private slots: Map<ABILITY_SLOT, string>;
  private cooldowns: Map<string, number> = new Map();

  constructor(abilites: AbilityDefinition[], slots: Map<ABILITY_SLOT, string>){
    this.abilites = new Map(abilites.map(a => [a.id, a]));
    this.slots = slots;
  }

  activate(slot: ABILITY_SLOT, state: AbilityState){
    const abilityId = this.slots.get(slot);
    if (!abilityId) return;

    const ability = this.abilites.get(abilityId);
    if (!ability) return;

    const cooldown = this.cooldowns.get(abilityId) ?? 0;
    if (cooldown > 0) return;
    
    const used = ability.activate(state);
    if (!used) return; 

    this.cooldowns.set(abilityId, ability.cooldown * (1 / STEP))
  }

  update(player: Player, balls: Ball[]){
    for (const [id, cooldown] of this.cooldowns){
      if (cooldown > 0){
        this.cooldowns.set(id, cooldown - 1);
      }
    }

    for (const ability of this.abilites.values()){
      ability.update(player, balls);
    }
  }

  setSlot(slot: ABILITY_SLOT, abilityId: string){
    if (!this.abilites.has(abilityId)) return;
    this.slots.set(slot, abilityId);
  }
}
