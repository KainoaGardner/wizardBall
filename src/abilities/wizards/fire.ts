// --FIRE 
// -ABILITY
// 1. Armageddon:
//   explode all your balls
//
// 2. Fire storm:
//   next ball split into 3 little fireballs
//
// 3.Supernova:
//   charge fireball insta explode on impact (cant bounce big explosion)
//
// -PASSIVE
// 1. Scorch: 
//   burn damage on ball
//
// 2. Combustion: 
//   balls explode on every impact (cant bounce small explosion)
//
// 3. Scorching Path: 
//   ball burn trail



import type { AbilityDefinition, AbilityState } from "../ability";
import { Player } from '../../player/player.ts';
import { Ball } from '../../balls/ball.ts';
import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { BallFactory } from '../../balls/ballFactory.ts';
import { Container } from 'pixi.js';

export enum EXPLOSION_SIZE {
  Small = 5,
  Medium = 10,
  Large = 50,
}

export const armageddon: AbilityDefinition = {
  id: "armageddon",
  name: "Armageddon",
  description: "Detonate all your active balls at once. Each explosion destroys the ball that triggered it and any other balls caught within its blast radius.",
  cooldown: 20,

  activate(state: AbilityState){
    return true;
  },

  update(player: Player, balls: Ball[]){

  }
}

export const firestorm: AbilityDefinition = {
  id: "firestorm",
  name: "Firestorm",
  description: "Infuse a held ball with fiery energy. When thrown, it splits into 3 smaller fireballs.",
  cooldown: 15,

  activate(state: AbilityState): boolean {
    console.log("firestorm")
    const heldBall = state.player.getHolding()
    if (!heldBall) return false;

    heldBall.kill();
    
    let infusedBallCon: BallConstruct = {
      x: 0,
      y: 0,
      state: BALL_STATE.Held,
      side: state.player.getSide(),
    }

    const infusedBall = state.ballFactory.createBall(BALL_TYPE.FireInfused, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.worldContainer.addChild(infusedBall.getContainer());
    state.pendingBalls.push(infusedBall)

    state.player.setHolding(infusedBall)
    infusedBall.pickup(state.player.getSide(), state.player.getColor());

    return true;
  },

  update(player: Player, balls: Ball[]){

  }
}

export const supernova: AbilityDefinition = {
  id: "supernova",
  name: "Supernova",
  description: "Infuse a held ball with explosive energy. When thrown, it detonates on its first collision, creating a massive explosion that destroys nearby balls caught in the blast. The ball cannot bounce.",
  cooldown: 30,

  activate(state: AbilityState){
    return true;
  },

  update(player: Player, balls: Ball[]){

  }
}
