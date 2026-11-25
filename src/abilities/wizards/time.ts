// --TIME
// -ABILITY
// 1. Time Stop: 
//    stop time (freeze everything but yourself, the world can throw stuff they move after time unfrozen, LONG COOLDOWN)
//
// 2. Rewind: 
//    move back to where you were some amount of time ago
//
// 3. Revert: 
//    return last thrown ball to hands


import type { AbilityDefinition, AbilityState } from "../ability";
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';
import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from '../../balls/types.ts';

import { PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, TEAM_SIDE, MID_WALL_THICKNESS } from '../../utils/global.ts';

export const REWIND_FRAME_SIZE = 60 * 1;

export const timeStop: AbilityDefinition = {
  id: "timestop",
  name: "Time Stop",
  description: "",
  cooldown: 50,

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

export const rewind: AbilityDefinition = {
  id: "rewind",
  name: "Rewind",
  description: "Apply force to all your active balls, pulling them toward your position.",
  cooldown: 10,

  activate(state: AbilityState, variables: Record<string, number>): boolean {
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    const posHistory = player.getPosHistory();
    if (!posHistory) return false;

    const pos = posHistory[0];
    player.setPosition(pos.x, pos.y);
    
    return true;  
  },

  update(state: AbilityState, variables: Record<string, number>){
  }
}

export const revert: AbilityDefinition = {
  id: "revert",
  name: "Revert",
  description: "Instantly return your last thrown ball to your hands, even if it has been destroyed.",
  cooldown: 12,

  activate(state: AbilityState, variables: Record<string, number>){
    const player = state.game.getPlayers().find(p => p.getId() === state.playerId);
    if (!player) return false;

    if (player.getHolding()) return false;

    const lastThrow = player.getLastThrow();
    if (!lastThrow) return false;

    const lastThrowBall = state.game.getBalls().find(ball => ball.getId() === lastThrow.id);
    if (lastThrowBall){
      lastThrowBall.kill();
    }

    let lastThrowCon: BallConstruct = {
      x: 0,
      y: 0,
      state: BALL_STATE.Thrown,
      side: player.getSide(),
    }

    const ballConst: BallTypeConstruct = {
      size: lastThrow.size,
      speed: lastThrow.speed,
      airResist: 1.5,
      color: 0xFFFFFF,
      damage: lastThrow.damage,
      type: lastThrow.type,
    }

    const revertBall = state.game.getBallFactory().createBall(lastThrow.type, lastThrowCon, ballConst); 
    revertBall.setExtraDamage(lastThrow.extraDamage);

    state.game.getWorldContainer().addChild(revertBall.getContainer());
    state.game.getPendingBalls().push(revertBall)


    player.setHolding(revertBall)
    revertBall.pickup(player, player.getSide(), player.getColor());

    return true;  
},

  update(state: AbilityState, variables: Record<string, number>){
  }
}
