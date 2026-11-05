import planck from 'planck';
import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';

import { PIXELS_PER_UNIT } from '../../utils/global.ts';

import { Ball,  } from '../../balls/ball.ts';

import { BALL_STATE, BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';
import type { Explosion } from '../../abilities/wizards/explosion.ts';

export type SpawnFireball = (
  ballCon: BallConstruct,
  angle: number,
  color: number,
) => void;


export const SPAWN_FIREBALL_ANGLE = Math.PI / 12;
export const FIREBALL_LIFE_TIME = 60;

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
  private lifeCounter = FIREBALL_LIFE_TIME;

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

  public override update(dt: number){
    super.update(dt); 
    this.lifeCounter = Math.max(0, this.lifeCounter - 1);
    if (this.lifeCounter <= 0){
      this.kill();
    }
  }

}

export class ExplosionInfusedBall extends Ball {
  private explosions: Explosion[];
  private explosionSize: number;
  private explosionForce: number;

  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application, explosions: Explosion[], explosionSize: number, explosionForce: number){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 50,
        speed: 17,
        airResist: 1.0,
        damage: 25,
        type: BALL_TYPE.ExplosionInfused,
      },
      physics,
      app);

    this.explosions = explosions;
    this.explosionSize = explosionSize;
    this.explosionForce = explosionForce;
  }

  public override handleCollision(otherBody: planck.Body){
    // if (this.getState() === BALL_STATE.Thrown) return;

    this.explode(this.explosions, this.explosionSize, this.explosionForce);
  }
}
