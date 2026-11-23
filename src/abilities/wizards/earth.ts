// --EARTH
// -ABILITY
// 1. Earth Wall:
//   make walls (place ball it stays for while)
//
// 2. Colossus:
//   next ball shot is huge slow bowlder with lots of damage (cant be stopped)
//
// 3. Earthquake:
//   slam ground stop all balls


import type { AbilityDefinition, AbilityState } from "../ability";
import { Player } from '../../player/player.ts';
import { Ball } from '../../balls/ball.ts';
import { Game } from '../../game.ts';
import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { BallFactory } from '../../balls/ballFactory.ts';
import { Container } from 'pixi.js';
import { PIXELS_PER_UNIT } from "../../utils/global.ts";


export const earthWall: AbilityDefinition = {
  id: "earthWall",
  name: "Earth Wall",
  description: "Transform your held ball into a stationary stone barrier, increasing its size to block incoming balls for a limited time.",
  cooldown: 3,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const heldBall = player.getHolding()
    if (!heldBall) return false;

    const pos = heldBall.getPosition();
    
    let infusedBallCon: BallConstruct = {
      x: pos.x * PIXELS_PER_UNIT,
      y: pos.y * PIXELS_PER_UNIT,
      state: BALL_STATE.Held,
      side: player.getSide(),
    }

    heldBall.kill();

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.Wall, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(null);

    return true;

  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const colossus: AbilityDefinition = {
  id: "colossus",
  name: "Colossus",
  description: "Infuse your next ball with the power of earth, transforming it into a massive, slow-moving boulder that deals devastating damage and cannot be stopped.",
  cooldown: 25,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
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

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.Colossus, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(infusedBall)
    infusedBall.pickup(player, player.getSide(), player.getColor());

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const earthquake: AbilityDefinition = {
  id: "earthquake",
  name: "Earthquake",
  description: "Slam the ground with immense force, instantly bringing all balls to a halt by removing their momentum and velocity.",
  cooldown: 30,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    for (const ball of state.game.getBalls()){
      ball.setVelocity(0, 0);
    }

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}
