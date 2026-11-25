//// -BLOOD
// -ABILITY
// 1. Blood Transfusion: 
//    lose health reset cooldowns
//
// 2. Vitality Drain: 
//    destory ball but heal
//
// 3. Bloodlust: 
//    spend health on next ball throw more damage

import type { AbilityDefinition, AbilityState } from "../ability";

import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';

export const HEALTH_PER_DAMAGE = 0.5;
export const HEALTH_PER_COOLDOWN = 0.5;

export const bloodTransfusion: AbilityDefinition = {
  id: "bloodtransfusion",
  name: "Blood Transfusion",
  description: "Continuously sacrifice health while holding the ability to rapidly reduce the cooldown of all other abilities.",
  cooldown: 0,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const abilityMan = player.getAbilityManager()
  
    for (const [id, cooldown] of abilityMan.getCooldowns()){
      if (cooldown > 0){
        abilityMan.getCooldowns().set(id, cooldown - 1);
      }
    }

    player.takeDamage(HEALTH_PER_COOLDOWN);
    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}

export const vitalityDrain: AbilityDefinition = {
  id: "vitalitydrain",
  name: "Vitality Drain",
  description: "Destroy your held ball to restore a portion of your health.",
  cooldown: 3,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const heldBall = player.getHolding()
    if (!heldBall) return false;
    const ballDamage = heldBall.getDamage();

    heldBall.kill();

    player.takeDamage(-ballDamage);
    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const bloodlust: AbilityDefinition = {
  id: "bloodlust",
  name: "Bloodlust",
  description: "Continuously sacrifice health while holding the ability to empower your held ball, increasing its damage the longer you charge it.",
  cooldown: 0,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const heldBall = player.getHolding()
    if (!heldBall) return false;

    const ballExtraDamage = heldBall.getExtraDamage();

    player.takeDamage(HEALTH_PER_DAMAGE);
    heldBall.setExtraDamage(ballExtraDamage + HEALTH_PER_DAMAGE);
    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}
