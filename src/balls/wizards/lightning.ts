import planck from 'planck';
import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';


import { Ball } from '../../balls/ball.ts';

import { BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';

export class BoltBall extends Ball {
  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 25,
        speed: 70,
        airResist: 0.5,
        damage: 15,
        type: BALL_TYPE.Bolt,
      },
      physics,
      app);
  }
}
