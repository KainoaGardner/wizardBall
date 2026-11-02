import planck from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from './physics.ts';
import { Ball, BALL_STATE } from './ball.ts';

import type { InputKeys } from './input.ts';

import { createCircleTexture } from './texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from './global.ts';

interface PlayerConstruct {
  x: number,
  y: number,
  size: number,
  speed: number,
  airResist: number,
  color: number,
  side: TEAM_SIDE,
}

export class Player {
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private color: number;
  private speed: number;

  private airResist: number;
  private holding: Ball | null = null;

  private side: TEAM_SIDE;

  constructor(
    p: PlayerConstruct,
    physics: Physics, 
    app: Application,
  ) {

    this.size = p.size;
    this.color = p.color;
    this.speed = p.speed;

    this.side = p.side;

    this.container = new Container();
    this.container.x = p.x;
    this.container.y = p.y;

    const circleTex = createCircleTexture(app, p.size, p.color);
    this.sprite = new Sprite(circleTex);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.body = physics.createPlayerBody(p.x, p.y, p.size);
    this.airResist = p.airResist;

    this.body.setLinearDamping(p.airResist);
  }

  public getContainer(){
    return this.container;
  }

  public getBody(){
    return this.body; 
  }

  private pickupBall(ball: Ball){
    console.log("pickup ball")
    if (this.holding !== null) return;
    if (ball.getState() !== BALL_STATE.Neutral) return;

    ball.pickup(this.side);
    this.holding = ball;
  }

  public handleCollision(otherBody: planck.Body, balls: Ball[]){
    const ball = balls.find(
      ball => ball.getBody() === otherBody
    );
    
    if (!ball) return;

    switch (ball.getState()){
      case BALL_STATE.Neutral:
        this.pickupBall(ball);
      break;
      case BALL_STATE.Thrown:
      break;
    } 
  }
  
  private updateHeld(){
    if (!this.holding) return;

    const pos = this.body.getPosition();
    this.holding.setPosition(pos.x + 1, pos.y);
  }

  public updateInput(input: InputKeys, dt: number){
    const dir = new planck.Vec2(0, 0);
    const speedDt = this.speed * dt;

    if (input.up) dir.y -= 1;
    if (input.down) dir.y += 1;

    if (input.right) dir.x += 1;
    if (input.left) dir.x -= 1;

    dir.normalize();
    dir.mul(speedDt);
    this.body.applyForceToCenter(dir, true);

    this.updateHeld();
  }

  public updateRender() {
    const pos = this.body.getPosition();

    this.container.x = pos.x * PIXELS_PER_UNIT;
    this.container.y = pos.y * PIXELS_PER_UNIT;
  }

}

export type { PlayerConstruct }
