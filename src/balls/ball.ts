import planck from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from '../utils/physics.ts';

import { createCircleTexture } from '../utils/texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from '../utils/global.ts';

const BALL_RESET_SPEED = 5; 
const BALL_THROW_SPEED = 100.0;

const PICKUP_COOLDOWN = 15;

export interface BallState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
}

interface BallConstruct {
  id: number,
  x: number,
  y: number,
  size: number,
  speed: number,
  airResist: number,
  color: number,
  state: number,
  side: number,
  damage: number,
}

export enum BALL_STATE {
  Neutral,
  Held,
  Thrown,
}

export class Ball {
  private id: number;
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private defaultColor: number;
  private color: number;
  private speed: number;

  private state: number;
  private side: number;

  private damage: number;

  private airResist: number;

  private resetX: number;
  private resetY: number;
  private resetSize: number;

  private pickupCooldown: number = 0;

  constructor(
    ball: BallConstruct,
    physics: Physics, 
    app: Application,
  ) {

    this.id = ball.id;
    this.size = ball.size;
    this.color = ball.color;
    this.defaultColor = ball.color;
    this.speed = ball.speed;
    this.state = ball.state;
    this.side = ball.side;

    this.damage = ball.damage;

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

    this.resetX = ball.x / PIXELS_PER_UNIT;
    this.resetY = ball.y / PIXELS_PER_UNIT;
    this.resetSize = ball.size;

    this

  }

  public reset(){
    this.setPosition(this.resetX, this.resetY);
    this.setVelocity(0, 0);
    this.size = this.resetSize;
    this.resetBall(); 
  }

  public getId(){
    return this.id;
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

  public getDamage(){
    return this.damage; 
  }

  public getPosition(){
    return this.body.getPosition()
  }

  public setState(state: BALL_STATE){
    this.state = state;
  }

  public getBallState(): BallState {
    const pos = this.body.getPosition();
    const vel = this.body.getLinearVelocity();

    return {
      id: this.id,
      x: pos.x,
      y: pos.y,
      vx: vel.x,
      vy: vel.y,
      color: this.color,
    };
  }

  public setBallState(ballState: BallState){
    this.setPosition(ballState.x, ballState.y);
    this.setVelocity(ballState.vx, ballState.vy);
    this.setColor(ballState.color);
  }

  public setPosition(x: number, y: number){
    this.body.setPosition(new planck.Vec2(x, y));
  }

  public setVelocity(vx: number, vy: number){
    this.body.setLinearVelocity(new planck.Vec2(vx, vy));
  }

  private setColor(color: number){
    this.color = color;
    this.sprite.tint = this.color;
  }

  public applyPickupcooldown(){
    this.pickupCooldown = PICKUP_COOLDOWN;
  }

  public canPickup(){
    return this.pickupCooldown <= 0;
  }

  public pickup(side: TEAM_SIDE, color: number){
    this.side = side;
    this.state = BALL_STATE.Held;
    this.setColor(color);
    this.applyPickupcooldown();
  }
  
  private updatePickup(){
    if (this.pickupCooldown <= 0) return;
    this.pickupCooldown = Math.max(this.pickupCooldown - 1, 0);
  }

  public update(dt: number){
    this.updatePickup();
    const speed = this.body.getLinearVelocity().length();
    if (this.state === BALL_STATE.Thrown && speed < BALL_RESET_SPEED){
      this.resetBall();
    }
  }

  public resetBall(){
    this.side = TEAM_SIDE.Neither;
    this.state = BALL_STATE.Neutral;
    this.setColor(this.defaultColor);
    this.applyPickupcooldown();
  }

  public updateRender() {
    const pos = this.body.getPosition();

    this.container.x = pos.x * PIXELS_PER_UNIT;
    this.container.y = pos.y * PIXELS_PER_UNIT;
    
  }

}

export type { BallConstruct }
export { BALL_THROW_SPEED, BALL_RESET_SPEED }
