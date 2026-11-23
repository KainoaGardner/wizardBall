
// --LIGHTNING
// -ABILITY
// 1. Thunderbolt: 
//    infuse ball with lightning making very fast and small
//
// 2. Blink: 
//    player teleport
//
// 3. Blitz: 
//    move very fast


import type { AbilityDefinition, AbilityState } from "../ability";
import { Player } from '../../player/player.ts';
import { Ball } from '../../balls/ball.ts';
import { Game } from '../../game.ts';
import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { BallFactory } from '../../balls/ballFactory.ts';
import { Container } from 'pixi.js';
import { PIXELS_PER_UNIT } from "../../utils/global.ts";

export const BLITZ_MAX_SPEED = 10000;
export const BLITZ_DURATION = 60 * 10;

export const thunderbolt: AbilityDefinition = {
  id: "stonebastion",
  name: "Thunderbolt",
  description: "Infuses the ball with lightning, making it smaller and significantly increasing its speed.",
  cooldown: 30,

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

    const infusedBall = state.game.getBallFactory().createBall(BALL_TYPE.Bolt, infusedBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(infusedBall.getContainer());
    state.game.getPendingBalls().push(infusedBall)

    player.setHolding(infusedBall)
    infusedBall.pickup(player, player.getSide(), player.getColor());

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const blink: AbilityDefinition = {
  id: "blink",
  name: "Blink",
  description: "Instantly teleports the player to their cursor's location.",
  cooldown: 15,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    
    const mos = player.getMosPos();

    player.setPosition(mos.x, mos.y);
    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const blitz: AbilityDefinition = {
  id: "blitz",
  name: "Blitz",
  description: "Temporarily boosts the player's movement speed to lightning fast levels.",
  cooldown: 25,
  variables: {
    timeCounter: 0,
  },

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = BLITZ_DURATION;
    player.setSpeed(player.getSpeed() + BLITZ_MAX_SPEED);

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return;

    variables.timeCounter--;
    const t = Math.min(variables.timeCounter / BLITZ_DURATION, 1);
    const currSpeed = BLITZ_MAX_SPEED  * Math.pow(t, 0.5);
    const preSpeed = variables.preSpeed ?? BLITZ_MAX_SPEED;

    const speed = preSpeed - currSpeed;

    player.setSpeed(Math.max(player.getBaseSpeed(), player.getSpeed() - speed));
    variables.preSpeed = currSpeed;
  }
}
