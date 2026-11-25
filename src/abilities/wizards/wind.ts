
// --WIND
// -ABILITY
// 1. Gale Force: 
//    wind on screen change all balls direction (rachel)
//
// 2. Recall: 
//    pull your balls back to you
//
// 3. Windburst: 
//    wind wave that pushes any ball close to you away (janna ult)

import type { AbilityDefinition, AbilityState } from "../ability";

export const WIND_GALE_DURATION = 60 * 10;
export const WIND_RECALL_DURATION = 60 * 1;
export const WIND_GALE_FORCE = 0.3;
export const WIND_RECALL_FORCE = 0.3;
export const WIND_PUSH_FORCE = 50;

export const galeForce: AbilityDefinition = {
  id: "galeforce",
  name: "Gale Forrce",
  description: "Unleash a powerful gust of wind that applies force to every active ball, pushing them in the direction you're aiming.",
  cooldown: 20,

  variables: {
    timeCounter: 0,
  },

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = WIND_GALE_DURATION;
    return true;  
  },

  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 
    variables.timeCounter--;

    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return;


    for (const ball of state.game.getBalls()){
      const force = WIND_GALE_FORCE;

      const ballPos = ball.getPosition();
      const mosPos = player.getMosPos();
      const dx = mosPos.x - ballPos.x;
      const dy = mosPos.y - ballPos.y;
      
      const length = Math.sqrt(dx * dx + dy * dy);
      const dirX = dx / length;
      const dirY = dy / length;

      ball.setKnockbackSpeed(dirX * force, dirY * force);
    }
  }
}

export const recall: AbilityDefinition = {
  id: "recall",
  name: "Recall",
  description: "Apply force to all your active balls, pulling them toward your position.",
  cooldown: 10,
  variables: {
    timeCounter: 0,
  },


  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = WIND_RECALL_DURATION;
    return true;  

  },

  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 
    variables.timeCounter--;

    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const playerPos = player.getPosition();
    for (const ball of state.game.getBalls()){
      const ballPos = ball.getPosition();
      const dx = ballPos.x - playerPos.x;
      const dy = ballPos.y - playerPos.y;

      const distSq = dx * dx + dy * dy;
      if (distSq === 0) continue;

      const dist = Math.sqrt(distSq);
      const force = WIND_RECALL_FORCE;
      const dirX = -dx / dist;
      const dirY = -dy / dist;

      ball.setKnockbackSpeed(dirX * force, dirY * force);
    }

    return true;

  }
}

export const windburst: AbilityDefinition = {
  id: "windburst",
  name: "Windburst",
  description: "Release a powerful burst of wind that pushes all nearby balls away from you in every direction.",
  cooldown: 10,
  variables: {
    timeCounter: 0,
  },

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const playerPos = player.getPosition();
    for (const ball of state.game.getBalls()){
      const ballPos = ball.getPosition();
      const dx = ballPos.x - playerPos.x;
      const dy = ballPos.y - playerPos.y;

      const dist = dx * dx + dy * dy;
      const normalDist = Math.min(dist / player.getSize(), 1);
      const falloff = Math.exp(-5 * normalDist);
      const force = WIND_PUSH_FORCE * falloff;
      const dirX = dx / dist;
      const dirY = dy / dist;

      ball.setKnockbackSpeed(dirX * force, dirY * force);
    }

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}
