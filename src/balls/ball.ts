import planck from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from '../utils/physics.ts';

import { createCircleTexture } from '../utils/texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from '../utils/global.ts';

const BALL_RESET_SPEED = 0.3; 
const BALL_THROW_SPEED = 100.0;

interface BallConstruct {
  x: number,
  y: number,
  size: number,
  speed: number,
  airResist: number,
  color: number,
  state: number,
  side: number,
}

export enum BALL_STATE {
  Neutral,
  Held,
  Thrown,
}

export class Ball {
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private defaultColor: number;
  private color: number;
  private speed: number;

  private state: number;
  private side: number;

  private airResist: number;

  constructor(
    ball: BallConstruct,
    physics: Physics, 
    app: Application,
  ) {

    this.size = ball.size;
    this.color = ball.color;
    this.defaultColor = ball.color;
    this.speed = ball.speed;
    this.state = ball.state;
    this.side = ball.side;

    this.container = new Container();
    this.container.x = ball.x;
    this.container.y = ball.y;

    const circleTex = createCircleTexture(app, ball.size, ball.color);
    this.sprite = new Sprite(circleTex);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.body = physics.createBallBody(ball.x, ball.y, ball.size);
    this.airResist = ball.airResist;

    this.body.setLinearDamping(ball.airResist);
  }

  public getContainer(): Container {
    return this.container;
  }

  public getState(){
    return this.state;
  }

  public getSide(){
    return this.side;
  }

  public getSpeed(){
    return this.speed;
  }

  public getBody(){
    return this.body; 
  }

  public getSize(){
    return this.size; 
  }

  public setState(state: BALL_STATE){
    this.state = state;
  }

  public setPosition(x: number, y: number){
    this.body.setPosition(new planck.Vec2(x, y));
  }

  private setColor(color: number){
    this.color = color;
    this.sprite.tint = this.color;
  }

  public pickup(side: TEAM_SIDE, color: number){
    this.side = side;
    this.state = BALL_STATE.Held;
    this.setColor(color);
  }


  public updateInput(dt: number){
    const speedDt = this.speed * dt;
    
    const speed = this.body.getLinearVelocity().length();
    if (this.state === BALL_STATE.Thrown && speed < BALL_RESET_SPEED){
      this.resetBall();
    }
  }

  private resetBall(){
    this.side = TEAM_SIDE.Neither;
    this.state = BALL_STATE.Neutral;
    this.setColor(this.defaultColor);
  }

  public updateRender() {
    const pos = this.body.getPosition();

    this.container.x = pos.x * PIXELS_PER_UNIT;
    this.container.y = pos.y * PIXELS_PER_UNIT;
    
  }

}

export type { BallConstruct }
export { BALL_THROW_SPEED, BALL_RESET_SPEED }
