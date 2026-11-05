import { Application } from 'pixi.js';
import { Physics } from '../utils/physics.ts';
import type { BallConstruct, BallTypeConstruct } from './types.ts';
import { Ball } from '../balls/ball.ts';
import { ExplosionInfusedBall, Fireball, FireInfusedBall, type SpawnFireball } from './wizards/fire.ts';

import { BALL_TYPE } from './types.ts';
import type { Explosion } from '../abilities/wizards/explosion.ts';
import { EXPLOSION_SIZE } from '../abilities/wizards/fire.ts';


export class BallFactory {
  private physics: Physics;
  private app: Application;
  private ballId: number = 0;
  
  private spawnFireball: SpawnFireball;
  private explosions: Explosion[];

  constructor(physics: Physics, app: Application, spawnFireball: SpawnFireball, explosions: Explosion[]){
    this.physics = physics;
    this.app = app;
    this.spawnFireball = spawnFireball;
    this.explosions = explosions;
  
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
      case BALL_TYPE.ExplosionInfused:
        result = new ExplosionInfusedBall(this.ballId, ball, ballTypeConst, this.physics, this.app, this.explosions, EXPLOSION_SIZE.Large, EXPLOSION_SIZE.Large);
        break;
      default:
        result = new Ball(this.ballId, ball, ballTypeConst, this.physics, this.app);
    }

    this.ballId++;
    return result;
  }
}
