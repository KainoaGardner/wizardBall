import planck from 'planck';
import type { Application } from 'pixi.js';
import type { Physics } from '../../utils/physics.ts';

import { PIXELS_PER_UNIT, TEAM_SIDE } from '../../utils/global.ts';

import { Ball } from '../../balls/ball.ts';

import { BALL_STATE, BALL_TYPE } from '../../balls/types.ts';
import type { BallConstruct, BallTypeConstruct } from '../../balls/types.ts';

import { COLLISION_GROUPS } from '../../utils/physics.ts';


export const ABSORB_SQUARED_DIST = 0;
export const ABSORB_AMOUNT = 0.25;

export class WaterBall extends Ball {
  constructor(id: number, ball: BallConstruct, ballTypeConst: BallTypeConstruct, physics: Physics, app: Application){
    super(
      id,
      ball,
      {
        ...ballTypeConst, 
        size: 40,
        speed: 35,
        airResist: 1.5,
        damage: 25,
        type: BALL_TYPE.Water,
      },
      physics,
      app);
    
    const body = this.getBody();
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      fixture.setFilterData({
        categoryBits: COLLISION_GROUPS.Ball,
        maskBits: COLLISION_GROUPS.Wall | COLLISION_GROUPS.Player,
        groupIndex: 0,
      });
    }

  }

  public override handleCollision(otherBody: planck.Body){
    if (this.getSide() === TEAM_SIDE.Neither && !this.justHit) return;

    this.kill();
  }

  public absorb(balls: Ball[]){
    const pos = this.getPosition();
    for (const ball of balls){
      if (ball.getId() === this.getId()) continue;
      if (!ball.isAlive()) continue;

      let dist = planck.Vec2.distanceSquared(ball.getPosition(), pos);
      const scaledBallSize = ball.getSize() / PIXELS_PER_UNIT;
      const scaledPlayerSize = this.getSize() / PIXELS_PER_UNIT;
      dist -= scaledBallSize * scaledBallSize;
      dist -= scaledPlayerSize * scaledPlayerSize;
      if (dist > ABSORB_SQUARED_DIST) continue;
    
      ball.kill();
      const ballDamage = ball.getDamage();
      this.setExtraDamage(this.getExtraDamage() + ballDamage * ABSORB_AMOUNT);

      const ballSize = ball.getSize();
      this.setSize(this.getSize() + ballSize * ABSORB_AMOUNT);
    }
  }

  public override setPhysicsSize(size: number){
    const body = this.getBody();
    const fixture = body.getFixtureList();
    if (!fixture) return;

    body.destroyFixture(fixture);

    body.createFixture({
        shape: new planck.Circle(size / PIXELS_PER_UNIT),
        filterCategoryBits: COLLISION_GROUPS.Ball,
        filterMaskBits:
            COLLISION_GROUPS.Player |
            COLLISION_GROUPS.Wall,
        density: 1,
        friction: 0,
    });
  }

}
