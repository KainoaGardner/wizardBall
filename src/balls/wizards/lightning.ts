import planck from 'planck';
import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';

import { PIXELS_PER_UNIT, TEAM_SIDE } from '../../utils/global.ts';

import { Ball } from '../../balls/ball.ts';

import { BALL_STATE, BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';

export class BoltBall extends Ball {
  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 25,
        speed: 75,
        airResist: 0.5,
        damage: 15,
        type: BALL_TYPE.Bolt,
      },
      physics,
      app);
  }
}
