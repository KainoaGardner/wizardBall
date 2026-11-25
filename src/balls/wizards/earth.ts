import planck from 'planck';
import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';

import { TEAM_SIDE } from '../../utils/global.ts';

import { Ball } from '../../balls/ball.ts';

import { BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';

export const WALL_LIFE_TIME = 10 * 60;

export class WallBall extends Ball {
  private lifeCounter: number = WALL_LIFE_TIME;

  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 100,
        speed: 0,
        airResist: 100.0,
        damage: 0,
        type: BALL_TYPE.Wall,
      },
      physics,
      app);
  }

  public override update(dt: number){
    this.setPosition(this.resetX, this.resetY);
    this.setVelocity(0, 0);
    this.side = TEAM_SIDE.Neither;

    this.lifeCounter = Math.max(0, this.lifeCounter - 1);
    if (this.lifeCounter <= 0){
      this.kill();
    }
  }

}

export class ColossusBall extends Ball {
  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 150,
        speed: 10,
        airResist: 0.3,
        damage: 75,
        type: BALL_TYPE.Colossus,
      },
      physics,
      app);
  }
}
