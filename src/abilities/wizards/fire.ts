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
import { Game } from '../../game.ts';
import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { BallFactory } from '../../balls/ballFactory.ts';
import { Container } from 'pixi.js';

export enum EXPLOSION_SIZE {
  Small = 25,
  Medium = 50,
  Large = 100,
}

export const armageddon: AbilityDefinition = {
  id: "armageddon",
  name: "Armageddon",
  description: "Detonate all your active balls at once. Each explosion destroys the ball that triggered it and any other balls caught within its blast radius.",
  cooldown: 20,

  activate(state: AbilityState){
    let count = 0;
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    for (const ball of state.game.getBalls()){
      if (ball.getSide() !== player.getSide()) continue;

      ball.explode(state.game.getExplosion(), EXPLOSION_SIZE.Medium, EXPLOSION_SIZE.Medium);
      count++;
    }

    return count > 0;
  },

  update(state: AbilityState){

  }
}

export const firestorm: AbilityDefinition = {
  id: "firestorm",
  name: "Firestorm",
  description: "Infuse a held ball with fiery energy. When thrown, it splits into 3 smaller fireballs.",
  cooldown: 15,

  activate(state: AbilityState): boolean {
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

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.FireInfused, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(infusedBall)
    infusedBall.pickup(player, player.getSide(), player.getColor());

    return true;
  },

  update(state: AbilityState){

  }
}

export const supernova: AbilityDefinition = {
  id: "supernova",
  name: "Supernova",
  description: "Infuse a held ball with explosive energy. When thrown, it detonates on its first collision, creating a massive explosion that destroys nearby balls caught in the blast. The ball cannot bounce.",
  cooldown: 30,

  activate(state: AbilityState){
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

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.ExplosionInfused, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(infusedBall)
    infusedBall.pickup(player, player.getSide(), player.getColor());

    return true;
  },

  update(state: AbilityState){

  }
}
