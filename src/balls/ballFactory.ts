import { Application } from 'pixi.js';
import { Physics } from '../utils/physics.ts';
import type { BallConstruct, BallTypeConstruct } from './types.ts';
import { Ball } from '../balls/ball.ts';
import { Fireball, FireInfusedBall, type SpawnFireball } from './wizards/fire.ts';

import { BALL_TYPE } from './types.ts';

export class BallFactory {
  private physics: Physics;
  private app: Application;
  private ballId: number = 0;
  
  private spawnFireball: SpawnFireball;

  constructor(physics: Physics, app: Application, spawnFireball: SpawnFireball){
    this.physics = physics;
    this.app = app;
    this.spawnFireball = spawnFireball;
  
  }

  public createBall(type: BALL_TYPE, ball: BallConstruct, ballTypeConst: BallTypeConstruct){
    let result: Ball | null;
    switch (type) {
      case BALL_TYPE.Fire:
        result = new Fireball(this.ballId, ball, ballTypeConst, this.physics, this.app);
        break;
      case BALL_TYPE.FireInfused:
        result = new FireInfusedBall(this.ballId, ball, ballTypeConst, this.physics, this.app, this.spawnFireball);
        break;
      default:
        result = new Ball(this.ballId, ball, ballTypeConst, this.physics, this.app);
    }

    this.ballId++;
    return result;
  }
}
