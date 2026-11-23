import { Ability } from "./ability";
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
  private slots: Map<ABILITY_SLOT, Ability>;
  private cooldowns: Map<string, number> = new Map();

  constructor(slots: Map<ABILITY_SLOT, Ability>){
    this.slots = slots;
  }

  activate(slot: ABILITY_SLOT, state: AbilityState){
    const ability = this.slots.get(slot);
    if (!ability) return;

    const cooldown = this.cooldowns.get(ability.getDefinition().id) ?? 0;
    if (cooldown > 0) return;
    
    const used = ability.activate(state);
    if (!used) return; 

    this.cooldowns.set(ability.getDefinition().id, ability.getDefinition().cooldown * (1 / STEP))
  }

  update(state: AbilityState){
    for (const [id, cooldown] of this.cooldowns){
      if (cooldown > 0){
        this.cooldowns.set(id, cooldown - 1);
      }
    }

    for (const ability of this.slots.values()){
      ability.update(state);
    }
  }

  setSlot(slot: ABILITY_SLOT, ability: Ability){
    this.slots.set(slot, ability);
  }
}
