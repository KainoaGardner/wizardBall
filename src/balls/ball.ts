import planck from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from '../utils/physics.ts';

import { createCircleTexture } from '../utils/texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from '../utils/global.ts';

import { BALL_TYPE, BALL_STATE } from './types.ts';
import type { BallConstruct, BallState, BallTypeConstruct } from './types.ts';

const BALL_RESET_SPEED = 5; 
const BALL_THROW_SPEED = 100.0;

const PICKUP_COOLDOWN = 15;

export class Ball {
  private id: number;
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private type: BALL_TYPE;
  private size: number;
  private defaultColor: number;
  private color: number;

  private state: BALL_STATE;
  private side: TEAM_SIDE;

  private damage: number;
  private speed: number;

  private airResist: number;

  private resetX: number;
  private resetY: number;
  private resetSize: number;

  private pickupCooldown: number = 0;

  private alive: boolean = true;

  constructor(
    id: number,
    ball: BallConstruct,
    ballTypeConst: BallTypeConstruct,
    physics: Physics, 
    app: Application,
  ) {

    this.id = id;
    this.type = ballTypeConst.type;
    this.size = ballTypeConst.size;
    this.color = ballTypeConst.color;
    this.defaultColor = ballTypeConst.color;
    this.state = ball.state;
    this.side = ball.side;
    this.speed = ballTypeConst.speed;

    this.damage = ballTypeConst.damage;

    this.container = new Container();
    this.container.x = ball.x;
    this.container.y = ball.y;

    const circleTex = createCircleTexture(app, ballTypeConst.size, ballTypeConst.color);
    this.sprite = new Sprite(circleTex);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.body = physics.createBallBody(ball.x, ball.y, ballTypeConst.size);
    this.airResist = ballTypeConst.airResist;

    this.body.setLinearDamping(ballTypeConst.airResist);

    this.resetX = ball.x / PIXELS_PER_UNIT;
    this.resetY = ball.y / PIXELS_PER_UNIT;
    this.resetSize = ballTypeConst.size;
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

  public isAlive(){
    return this.alive;
  }

  public kill(){
    this.alive = false;
    this.body.setActive(false);
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
      type: this.type,
      alive: this.alive,
      state: this.state,
      side: this.side,
      speed: this.speed,
    };
  }

  public setBallState(ballState: BallState){
    this.setPosition(ballState.x, ballState.y);
    this.setVelocity(ballState.vx, ballState.vy);
    this.setColor(ballState.color);
    this.alive = ballState.alive;
    this.state = ballState.state;
    this.side = ballState.side;
    this.speed = ballState.speed;
  }

  public setPosition(x: number, y: number){
    this.body.setPosition(new planck.Vec2(x, y));
  }

  public setVelocity(vx: number, vy: number){
    this.body.setLinearVelocity(new planck.Vec2(vx, vy));
  }

  public getColor(){
    return this.color;
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

  public handleCollision(otherBody: planck.Body){

  }

  public throw(angle: number, color: number){
    this.setState(BALL_STATE.Thrown);
    this.setColor(color);

    const direction = new planck.Vec2(Math.cos(angle), Math.sin(angle));
    direction.normalize();

    this.body.setLinearVelocity(direction.mul(this.speed));
  }

  public destory(physics: Physics): void {
    physics.getWorld().destroyBody(this.body);
    this.container.destroy();
  }
}

export { BALL_THROW_SPEED, BALL_RESET_SPEED }
