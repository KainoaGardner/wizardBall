import { Ball } from './ball.ts';
import type { BallConstruct } from './types.ts';
import { BallFactory } from './ballFactory.ts';

import { BALL_TYPE, NORMAL_BALL_TYPE_CONST} from './types.ts';

import { SPAWN_FIREBALL_ANGLE } from './wizards/fire.ts';


export class BallCallbacks {
  private pendingBall: Ball[];
  private ballFactory!: BallFactory;
  
  constructor(pendingBall: Ball[]){
    this.pendingBall = pendingBall;
  }

  public setBallFactory(ballFactory: BallFactory){
    this.ballFactory = ballFactory;
  }

  public spawnFireball = (ballCon: BallConstruct, angle: number, color: number): void => {
    for (let i = -1; i <= 1; i++){
      const ball = this.ballFactory.createBall(BALL_TYPE.Fire, ballCon, NORMAL_BALL_TYPE_CONST);
      ball.throw(angle + i * SPAWN_FIREBALL_ANGLE, color);
      this.pendingBall.push(ball);
    }
  }
}
