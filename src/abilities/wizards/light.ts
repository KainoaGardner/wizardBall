// --HOLY
// -ABILITY
// 1. Celestial Ring: 
//    summon ring of light balls around you
//
// 2. Reflection: 
//    make copy of held ball
//
// 3. Holy Judgment: 
//    delete all balls


import type { AbilityDefinition, AbilityState } from "../ability";

import type { BallConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';

export const CELESTIAL_RING_COUNT = 8;
export const CELESTIAL_RING_RADIUS = 75;

export const celestialRing: AbilityDefinition = {
  id: "celestialring",
  name: "Celestial Ring",
  description: "Summon a protective ring of balls that orbit around you.",
  cooldown: 15,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;
    
    const playerPos = player.getPosition();
    const radius = CELESTIAL_RING_RADIUS + player.getSize();
    for (let i = 0; i < CELESTIAL_RING_COUNT; i++){
      const angle = (i / CELESTIAL_RING_COUNT) * Math.PI * 2;

      const ballX = playerPos.x * PIXELS_PER_UNIT + Math.cos(angle) * radius;
      const ballY = playerPos.y * PIXELS_PER_UNIT + Math.sin(angle) * radius;

      let ballCon: BallConstruct = {
        x: ballX,
        y: ballY,
        state: BALL_STATE.Neutral,
        side: TEAM_SIDE.Neither,
      }
  
      const ball = state.game.getBallFactory().createBall(BALL_TYPE.Normal, ballCon, NORMAL_BALL_TYPE_CONST); 
      state.game.getWorldContainer().addChild(ball.getContainer());
      state.game.getPendingBalls().push(ball)
    }
    

    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const reflection: AbilityDefinition = {
  id: "reflection",
  name: "Reflection",
  description: "Create an identical copy of your held ball.",
  cooldown: 7,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const heldBall = player.getHolding()
    if (!heldBall) return false;

    const ballPos = heldBall.getPosition();
    let copyBallCon: BallConstruct = {
      x: ballPos.x * PIXELS_PER_UNIT,
      y: ballPos.y * PIXELS_PER_UNIT,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const copyBall = state.game.getBallFactory().createBall(heldBall.getBallType(), copyBallCon, NORMAL_BALL_TYPE_CONST); 
    state.game.getWorldContainer().addChild(copyBall.getContainer());
    state.game.getPendingBalls().push(copyBall)

    copyBall.setExtraDamage(heldBall.getExtraDamage());
    copyBall.setDamage(heldBall.getBaseDamage());
    copyBall.setSize(heldBall.getSize());
    return true;
  },

  update(state: AbilityState, variables: Record<string, number>){

  }
}

export const holyJudgment: AbilityDefinition = {
  id: "holyjudgment",
  name: "Hold Judgment",
  description: "Unleash a divine light that instantly destroys all active balls on the field.",
  cooldown: 30,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    for (const ball of state.game.getBalls()){
      ball.kill();
    }

    return true;

  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}
