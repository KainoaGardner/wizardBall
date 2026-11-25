// --SHADOW
// -ABILITY
// 1. Shadowcast: 
//    repeat last ball throw
//
// 2. Vanish: 
//    go invisible for time
//
// 3. Shadow Step: 
//    teleport pos with ball closest to your cusor


import planck from 'planck';
import type { AbilityDefinition, AbilityState } from "../ability";

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';
import { Ball } from "../../balls/ball.ts";

import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';


export const INVIS_DURATION = 60 * 3;


export const shadowCast: AbilityDefinition = {
  id: "shadowcast",
  name: "Shadow Cast",
  description: "",
  cooldown: 15,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const shadowThrow = player.getLastThrow();
    if (!shadowThrow) return false;

    let shadowBallCon: BallConstruct = {
      x: shadowThrow.x * PIXELS_PER_UNIT,
      y: shadowThrow.y * PIXELS_PER_UNIT,
      state: BALL_STATE.Thrown,
      side: player.getSide(),
    }

    const ballConst: BallTypeConstruct = {
      size: shadowThrow.size,
      speed: shadowThrow.speed,
      airResist: 1.5,
      color: 0xFFFFFF,
      damage: shadowThrow.damage,
      type: shadowThrow.type,
    }

    const shadowBall = state.game.getBallFactory().createBall(shadowThrow.type, shadowBallCon, ballConst); 
    shadowBall.setExtraDamage(shadowThrow.extraDamage);
    state.game.getWorldContainer().addChild(shadowBall.getContainer());
    state.game.getPendingBalls().push(shadowBall)
    shadowBall.throw(shadowThrow.angle, player.getColor());

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}

export const vanish: AbilityDefinition = {
  id: "vanish",
  name: "Vanish",
  description: "Fade into the shadows, becoming invisible for a short duration.",
  cooldown: 20,
  variables: {
    timeCounter: 0,
  },

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = INVIS_DURATION;
    player.setInvis(true);
    const holding = player.getHolding();
    if (holding){
      holding.setInvis(true);
    }

    return true;  
  },

  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 

    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter--;
    if (variables.timeCounter <= 0){
      player.setInvis(false);
      const holding = player.getHolding();
      if (holding){
        holding.setInvis(false);
      }
    }; 

    return true;
  }
}

export const shadowStep: AbilityDefinition = {
  id: "shadowstep",
  name: "Shadow Step",
  description: "Teleport to the ball closest to your cursor.",
  cooldown: 7,
  variables: {
    timeCounter: 0,
  },

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const mosPos = player.getMosPos();

    let closestBall: Ball | null = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const ball of state.game.getBalls()){
      const ballPos = ball.getPosition();

      let dist = planck.Vec2.distanceSquared(ballPos, mosPos);
      const scaledBallSize = ball.getSize() / PIXELS_PER_UNIT;
      const scaledPlayerSize = player.getSize() / PIXELS_PER_UNIT;
      dist -= scaledBallSize * scaledBallSize;
      dist -= scaledPlayerSize * scaledPlayerSize;

      if (dist < minDist){
        minDist = dist;
        closestBall = ball;
      }
    }

    if (!closestBall) return false;
    
    const blinkPos = closestBall.getPosition();
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
