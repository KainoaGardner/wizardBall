// --WATER / ICE
// -ABILITY
// 1. Permafrost: 
//    freeze enemy balls they move again after unfrozen
//
// 2. Flow State: 
//    turn into water making you invincible for a few seconds
//
// 3. Water Orb: 
//    water bubble ball that absorbs balls

import type { AbilityDefinition, AbilityState } from "../ability";

import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';
import { COLLISION_GROUPS } from '../../utils/physics.ts';
import { WaterBall } from "../../balls/wizards/water.ts";

export const FREEZE_TIME = 60 * 1;
export const POOL_TIME = 60 * 3;

export const permafrost: AbilityDefinition = {
  id: "permafrost",
  name: "Permafrost",
  description: "Freeze all enemy balls in place for a short duration, then allow them to move again once the effect wears off.",
  cooldown: 7.5,


  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    let count = 0;
    for (const ball of state.game.getBalls()){
      if (ball.getSide() === TEAM_SIDE.Neither || ball.getSide() === player.getSide()) continue;
      ball.freeze(FREEZE_TIME);
      count++;
    }

    return count > 0;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const flowState: AbilityDefinition = {
  id: "flowstate",
  name: "Flow State",
  description: "Transform into flowing water, becoming temporarily invulnerable.",
  cooldown: 15,
  variables: {
    timeCounter: 0,
  },


  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = POOL_TIME;

    const body = player.getBody();
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      fixture.setFilterData({
        categoryBits: COLLISION_GROUPS.Player,
        maskBits: COLLISION_GROUPS.Wall ,
        groupIndex: 0,
      });
    }

    return true;
  },


  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return;

    variables.timeCounter--;
    if (variables.timeCounter <= 0){
      const body = player.getBody();
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        fixture.setFilterData({
          categoryBits: COLLISION_GROUPS.Player,
          maskBits: COLLISION_GROUPS.Ball | COLLISION_GROUPS.Wall | COLLISION_GROUPS.Player,
          groupIndex: 0,
        });
      }
    }; 
  }
}

export const waterOrb: AbilityDefinition = {
  id: "waterorb",
  name: "waterOrb",
  description: "Infuse your held ball with swirling water, allowing it to absorb any balls it comes into contact with.",
  cooldown: 25,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const heldBall = player.getHolding()
    if (!heldBall) return false;

    heldBall.kill();
    
    let infusedBallCon: BallConstruct = {
      x: 0,
      y: 0,
      state: BALL_STATE.Held,
      side: player.getSide(),
    }

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.Water, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(infusedBall)
    infusedBall.pickup(player, player.getSide(), player.getColor());

    return true;

  },

  update(state: AbilityState, variables: Record<string, number>){
    for (const ball of state.game.getBalls()){
      if (!(ball instanceof WaterBall)) continue;
      ball.absorb(state.game.getBalls());
    }
  }
}
