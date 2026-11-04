import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';

import { PIXELS_PER_UNIT } from '../../utils/global.ts';

import { Ball,  } from '../../balls/ball.ts';

import { BALL_STATE, BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';

export type SpawnFireball = (
  ballCon: BallConstruct,
  angle: number,
  color: number,
) => void;

export class FireInfusedBall extends Ball {
  spawnFireball: SpawnFireball;

  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application, spawnFireball: SpawnFireball){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 50,
        speed: 15,
        airResist: 1.0,
        damage: 25,
        type: BALL_TYPE.FireInfused,
      },
      physics,
      app);

    this.spawnFireball = spawnFireball;
  }

  public override throw(angle: number){
    this.kill();
    
    const pos = this.getPosition();
    const side = this.getSide();
    let ballCon: BallConstruct = {
      x: pos.x * PIXELS_PER_UNIT,
      y: pos.y * PIXELS_PER_UNIT,
      state: BALL_STATE.Neutral,
      side: side,
    }

    this.spawnFireball(ballCon, angle, this.getColor());
  }
}

export class Fireball extends Ball {
  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 25,
        speed: 45,
        airResist: 1.0,
        damage: 25,
        type: BALL_TYPE.Fire,
      },
      physics,
      app);
  }

  public override throw(angle: number){
    this.kill();
    
    const pos = this.getPosition();
    const side = this.getSide();
    let ballCon: BallConstruct = {
      x: pos.x * PIXELS_PER_UNIT,
      y: pos.y * PIXELS_PER_UNIT,
      state: BALL_STATE.Neutral,
      side: side,
    }

    this.spawnFireball(ballCon, angle, this.getColor());
  }
}
