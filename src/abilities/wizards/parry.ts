// --PARRY
// -ABILITY
// 1. Counter: 
//    parry ball send it back with double speed and damage (timed)
//
// 2. Redirect: 
//    stand still redirect any ball that hits you during that time in the direction you stood
//
// 3. Evasion: 
//    become invincible for very short time


import planck from 'planck';
import type { AbilityDefinition, AbilityState } from "../ability";
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';
import { Ball } from '../../balls/ball.ts';

import { PIXELS_PER_UNIT } from '../../utils/global.ts';

export const EVASION_TIME = 6;
export const REDIRECT_DURATION = 60 * 10;
export const REDIRECT_SQUARED_DIST = 2;

export const PARRY_SQUARED_DIST = 3;
export const PARRY_ANGLE_BOUNDS = Math.PI / 2;
export const PARRY_BOOST = 1.5;

export const counter: AbilityDefinition = {
  id: "counter",
  name: "Counter",
  description: "Time your activation and aim at an incoming ball to parry it, launching it in the direction of your parry with double the speed and damage.",
  cooldown: 0.5,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    if (player.getHolding()) return false;

    let parryBall: Ball | null = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const ball of state.game.getBalls()){
      if (ball.getState() !== BALL_STATE.Thrown || ball.getSide() === player.getSide()) continue;
      if (ball.getSleep()) continue;
      
      const ballPos = ball.getPosition();
      const playerPos = player.getPosition();

      let dist = planck.Vec2.distanceSquared(ballPos, playerPos);
      const scaledBallSize = ball.getSize() / PIXELS_PER_UNIT;
      const scaledPlayerSize = player.getSide() / PIXELS_PER_UNIT;
      dist -= scaledBallSize * scaledBallSize;
      dist -= scaledPlayerSize * scaledPlayerSize;
      if (dist > PARRY_SQUARED_DIST) continue;

      const dx = ballPos.x - playerPos.x;
      const dy = ballPos.y - playerPos.y;
      const angleToBall = Math.atan2(dy, dx);
      let angleDiff = (angleToBall - player.getBody().getAngle()) % (Math.PI * 2);

      if (angleDiff > Math.PI / 2) angleDiff -= Math.PI;
      if (angleDiff < -Math.PI / 2) angleDiff += Math.PI;

      if (!(Math.abs(angleDiff) <= PARRY_ANGLE_BOUNDS)) continue;

      if (dist < minDist){
        minDist = dist;
        parryBall = ball;
      }
    }

    if (!parryBall) return true;

    const angle = player.getBody().getAngle();
    const pos = player.getPosition();

    let dist = planck.Vec2.distanceSquared(parryBall.getPosition(), pos);
    const scaledBallSize = parryBall.getSize() / PIXELS_PER_UNIT;
    const scaledPlayerSize = player.getSize() / PIXELS_PER_UNIT;
    dist -= scaledBallSize * scaledBallSize;
    dist -= scaledPlayerSize * scaledPlayerSize;

    const radius = PARRY_SQUARED_DIST + scaledBallSize + scaledPlayerSize
    
    const direction = planck.Vec2(
      Math.cos(angle),
      Math.sin(angle)
    );

    const newPosX = pos.x + direction.x * radius;
    const newPosY = pos.y + direction.y * radius;

    const velocity = parryBall.getBody().getLinearVelocity();
    const speed = velocity.length();

    parryBall.setPosition(newPosX, newPosY);
    parryBall.setSide(player.getSide());
    parryBall.parry(speed * PARRY_BOOST, angle, player.getColor(), parryBall.getDamage() * PARRY_BOOST);
    return true;  
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}

export const redirect: AbilityDefinition = {
  id: "redirect",
  name: "Redirect",
  description: "Lock your movement and become invincible for the duration, redirecting any incoming balls that hit you in the direction you're facing.",
  cooldown: 20,
  variables: {
    timeCounter: 0,
    angle: 0,
  },


  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    variables.timeCounter = REDIRECT_DURATION;
    const body = player.getBody();
    variables.angle = player.getBody().getAngle();
    player.setInvincible(REDIRECT_DURATION);
    body.setType("static");

    return true;  
  },

  update(state: AbilityState, variables: Record<string, number>){
    if (variables.timeCounter <= 0) return; 

    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return;

    const direction = planck.Vec2(
      Math.cos(variables.angle),
      Math.sin(variables.angle)
    );

    const pos = player.getPosition();
    for (const ball of state.game.getBalls()){
      if (!ball.isAlive()) continue;
      if (ball.getSide() === player.getSide()) continue;

      const ballPos = ball.getPosition();
      const velocity = ball.getBody().getLinearVelocity();
      const speed = velocity.length();
      let dist = planck.Vec2.distanceSquared(ballPos, pos);
      const scaledBallSize = ball.getSize() / PIXELS_PER_UNIT;
      const scaledPlayerSize = player.getSize() / PIXELS_PER_UNIT;
      dist -= scaledBallSize * scaledBallSize;
      dist -= scaledPlayerSize * scaledPlayerSize;
      if (dist > REDIRECT_SQUARED_DIST) continue;

      const radius = REDIRECT_SQUARED_DIST
        + scaledBallSize
        + scaledPlayerSize
      
      const newPosX = pos.x + direction.x * radius;
      const newPosY = pos.y + direction.y * radius;

      ball.setPosition(newPosX, newPosY);
      ball.setVelocity(direction.x * speed, direction.y * speed);
    }

    variables.timeCounter--;
    if (variables.timeCounter <= 0){
      player.getBody().setType("dynamic");
    }; 

  }
}

export const evasion: AbilityDefinition = {
  id: "evasion",
  name: "Evasion",
  description: "Briefly become completely invulnerable, allowing you to avoid all incoming damage with precise timing.",
  cooldown: 5,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    player.setInvincible(EVASION_TIME);

    return true;  
},

  update(state: AbilityState, variables: Record<string, number>){
  }
}
