
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

import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';

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
    
    const blinkPos = mos;
    const side = player.getSide();

    const scaledHeight = PLAY_HEIGHT / PIXELS_PER_UNIT;
    const scaledWidth = PLAY_WIDTH / PIXELS_PER_UNIT;
    
    blinkPos.y = Math.min(Math.max(blinkPos.y, -scaledHeight / 2), scaledHeight / 2);

    if (side === TEAM_SIDE.Left){
      blinkPos.x = Math.min(Math.max(blinkPos.x, - scaledWidth / 2), 0 - MID_WALL_THICKNESS);
    } else {
      blinkPos.x = Math.min(Math.max(blinkPos.x, 0 + MID_WALL_THICKNESS), scaledWidth / 2);
    }

    player.setPosition(blinkPos.x, blinkPos.y);
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
