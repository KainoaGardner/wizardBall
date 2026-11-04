import planck, { MouseJoint } from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from '../utils/physics.ts';
import { Ball } from '../balls/ball.ts';
import { BALL_STATE } from '../balls/types.ts';

import type { InputKeys, InputMouse } from '../input/input.ts';

import { createCircleTexture } from '../utils/texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from '../utils/global.ts';


const DEFAULT_HEALTH = 100;
const CATCH_SQUARED_DIST = 3;
const CATCH_ANGLE_BOUNDS = Math.PI / 8;
const CATCH_COOLDOWN = 30;

export interface PlayerState {
  id: number;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
}

export enum PLAYER_ID {
  P1,
  P2,
}

interface PlayerConstruct {
  id: PLAYER_ID,
  x: number,
  y: number,
  size: number,
  speed: number,
  health: number,
  airResist: number,
  color: number,
  side: TEAM_SIDE,
}

export class Player {
  private id: PLAYER_ID;
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private color: number;
  private speed: number;

  private health: number;
  private sheild: number = 0;

  private airResist: number;
  private holding: Ball | null = null;

  private side: TEAM_SIDE;

  private resetX: number;
  private resetY: number;
  private resetHealth: number;

  private alive: boolean = true;

  private catchCooldown: number = CATCH_COOLDOWN;

  constructor(
    p: PlayerConstruct,
    physics: Physics, 
    app: Application,
  ) {

    this.id = p.id;
    this.size = p.size;
    this.color = p.color;
    this.speed = p.speed;

    this.health = p.health;

    this.resetHealth = p.health;

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

    this.resetX = p.x / PIXELS_PER_UNIT;
    this.resetY = p.y / PIXELS_PER_UNIT;
    this.resetHealth = p.health;
  }

  public reset(){
    this.holding = null;
    this.setPosition(this.resetX, this.resetY);
    this.setVelocity(0, 0);
    this.health = this.resetHealth;
  }

  public getId(){
    return this.id;
  }

  public getContainer(){
    return this.container;
  }

  public getBody(){
    return this.body; 
  }

  public getColor(){
    return this.color; 
  }

  public getPlayerState(): PlayerState {
    const pos = this.body.getPosition();
    const vel = this.body.getLinearVelocity();

    return {
      id: this.id,
      x: pos.x,
      y: pos.y,
      angle: this.body.getAngle(),
      vx: vel.x,
      vy: vel.y,
    };
  }

  public getNormalHealth(){
    return this.health / this.resetHealth;
  }

  public setPlayerState(playerState: PlayerState){
    this.setPosition(playerState.x, playerState.y);
    this.setAngle(playerState.angle);
    this.setVelocity(playerState.vx, playerState.vy);
  }

  public getPosition(){
    return this.body.getPosition();
  }

  public setPosition(x: number, y: number){
    this.body.setPosition(new planck.Vec2(x, y));
  }

  public setAngle(angle: number){
    this.body.setAngle(angle);
  }

  public setVelocity(vx: number, vy: number){
    this.body.setLinearVelocity(new planck.Vec2(vx, vy));
  }

  private takeDamage(damage: number){
    this.health = Math.max(this.health - damage, 0); 
  }

  private hit(ball: Ball){
    if (!(ball.getState() === BALL_STATE.Thrown && ball.getSide() !== this.side)) return;
    
    this.takeDamage(ball.getDamage());
    ball.resetBall();
  }

  private updateAngle(mousePos: InputMouse){
    const pos = this.body.getPosition();
    const scaledMousePos = {x: mousePos.x / PIXELS_PER_UNIT, y: mousePos.y / PIXELS_PER_UNIT};
    const angle = Math.atan2(scaledMousePos.y - pos.y, scaledMousePos.x - pos.x);
    this.setAngle(angle);
  }

  private catchUpdate(){
    if (this.catchCooldown <= 0) return;
    this.catchCooldown = Math.max(this.catchCooldown - 1, 0);
  }

  private catchBall(inputKeys: InputKeys, balls: Ball[]){
    this.catchUpdate();

    if (this.holding !== null || !inputKeys.catch) return;
    if (this.catchCooldown > 0) return;

    this.catchCooldown = CATCH_COOLDOWN;

    let caughtBall = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const ball of balls){
      if (ball.getState() !== BALL_STATE.Thrown || ball.getSide() === this.side) continue;
      
      const ballPos = ball.getPosition();
      const playerPos = this.getPosition();

      let dist = planck.Vec2.distanceSquared(ballPos, playerPos);
      const scaledBallSize = ball.getSize() / PIXELS_PER_UNIT;
      const scaledPlayerSize = this.size / PIXELS_PER_UNIT;
      dist -= scaledBallSize * scaledBallSize;
      dist -= scaledPlayerSize * scaledPlayerSize;
      if (dist > CATCH_SQUARED_DIST) continue;

      const dx = ballPos.x - playerPos.x;
      const dy = ballPos.y - playerPos.y;
      const angleToBall = Math.atan2(dy, dx);
      let angleDiff = (angleToBall - this.body.getAngle()) % (Math.PI * 2);

      if (angleDiff > Math.PI / 2) angleDiff -= Math.PI;
      if (angleDiff < -Math.PI / 2) angleDiff += Math.PI;

      if (!(Math.abs(angleDiff) <= CATCH_ANGLE_BOUNDS)) continue;

      if (dist < minDist){
        minDist = dist;
        caughtBall = ball;
      }

    }

    if (!caughtBall) return;

    this.holding = caughtBall;
    this.holding.pickup(this.side, this.color);
  }

  private pickupBall(ball: Ball){
    if (this.holding !== null) return;
    if (ball.getState() === BALL_STATE.Held) return;
    if (ball.getState() === BALL_STATE.Thrown && ball.getSide() !== this.side) return;
    if (!ball.canPickup()) return;

    ball.pickup(this.side, this.color);
    this.holding = ball;
  }

  private throwBall(inputKeys: InputKeys){
    if (!this.holding || !inputKeys.throw) return;
    
    const ball = this.holding;
    this.holding = null;
    ball.throw(this.body.getAngle(), this.color);
  }

  private dropBall(inputKeys: InputKeys){
    if (!this.holding || !inputKeys.drop) return;
    
    const ball = this.holding;
    ball.resetBall();
    ball.setVelocity(0, 0);
    this.holding = null;
    // ball.setState(BALL_STATE.Thrown);
    // ball.applyPickupcooldown();
  }

  public handleCollision(otherBody: planck.Body, balls: Ball[]){
    const ball = balls.find(
      ball => ball.getBody() === otherBody
    );
    
    if (!ball) return;

    this.pickupBall(ball);
    this.hit(ball);
  }
  
  private updateHeld(){
    if (!this.holding) return;

    const pos = this.body.getPosition();
    const ballSize = this.holding.getSize();
    const scaledPlayerSize = this.size / PIXELS_PER_UNIT;
    const scaledBallSize = ballSize / PIXELS_PER_UNIT;
    const radius = (scaledPlayerSize + scaledBallSize) * 1.1;

    const ballX = pos.x + Math.cos(this.body.getAngle()) * radius;
    const ballY = pos.y + Math.sin(this.body.getAngle()) * radius;
    this.holding.setPosition(ballX, ballY);
    this.holding.setVelocity(0, 0);
  }

  public update(keyInput: InputKeys, mouseInput: InputMouse, balls: Ball[], dt: number){
    const dir = new planck.Vec2(0, 0);
    const speedDt = this.speed * dt;

    if (keyInput.up) dir.y -= 1;
    if (keyInput.down) dir.y += 1;

    if (keyInput.right) dir.x += 1;
    if (keyInput.left) dir.x -= 1;

    dir.normalize();
    dir.mul(speedDt);
    this.body.applyForceToCenter(dir, true);

    this.updateAngle(mouseInput);
    this.updateHeld();
    this.throwBall(keyInput);
    this.dropBall(keyInput);
    this.catchBall(keyInput, balls);
  }

  public updateRender() {
    const pos = this.body.getPosition();

    this.container.x = pos.x * PIXELS_PER_UNIT;
    this.container.y = pos.y * PIXELS_PER_UNIT;
  }

  public destory(physics: Physics): void {
    physics.getWorld().destroyBody(this.body);
    this.container.destroy();
  }

}

export { DEFAULT_HEALTH }
export type { PlayerConstruct }
