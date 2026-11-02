import planck from 'planck';
import { Application, Container, Sprite, Texture } from 'pixi.js';

import { Physics } from './physics.ts';
import { Ball, BALL_STATE, BALL_THROW_SPEED } from './ball.ts';

import { Input } from './input.ts';
import type { InputKeys, InputMouse } from './input.ts';

import { createCircleTexture } from './texture.ts';
import { PIXELS_PER_UNIT, TEAM_SIDE } from './global.ts';

interface PlayerConstruct {
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
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private color: number;
  private speed: number;

  private health: number;
  private sheild: number;

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

    this.health = p.health;

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
    if (this.holding !== null) return;
    if (ball.getState() === BALL_STATE.Thrown && ball.getSide() !== this.side) return;

    ball.pickup(this.side, this.color);
    this.holding = ball;
  }

  private throwBall(inputKeys: InputKeys, mousePos: InputMouse){
    if (!this.holding || !inputKeys.throw) return;
    
    const ball = this.holding;
    ball.setState(BALL_STATE.Thrown);
    this.holding = null;

    const pos = ball.getBody().getPosition();
    const scaledMousePos = {x: mousePos.x / PIXELS_PER_UNIT, y: mousePos.y / PIXELS_PER_UNIT};
    const direction = new planck.Vec2(
      scaledMousePos.x - pos.x,
      scaledMousePos.y - pos.y
    );
    
    direction.normalize();

    ball.getBody().applyForceToCenter(
      direction.mul(ball.getSpeed())
    );
  }

  private dropBall(inputKeys: InputKeys){
    if (!this.holding || !inputKeys.drop) return;
    
    const ball = this.holding;
    ball.setState(BALL_STATE.Thrown);
    this.holding = null;
  }

  public handleCollision(otherBody: planck.Body, balls: Ball[]){
    const ball = balls.find(
      ball => ball.getBody() === otherBody
    );
    
    if (!ball) return;

    this.pickupBall(ball);
  }
  
  private updateHeld(mousePos: InputMouse){
    if (!this.holding) return;

    const pos = this.body.getPosition();
    const ballSize = this.holding.getSize();
    const scaledPlayerSize = this.size / PIXELS_PER_UNIT;
    const scaledBallSize = ballSize / PIXELS_PER_UNIT;
    const radius = (scaledPlayerSize + scaledBallSize) * 1.1;

    const scaledMousePos = {x: mousePos.x / PIXELS_PER_UNIT, y: mousePos.y / PIXELS_PER_UNIT};
    const angle = Math.atan2(scaledMousePos.y - pos.y, scaledMousePos.x - pos.x);
    const ballX = pos.x + Math.cos(angle) * radius;
    const ballY = pos.y + Math.sin(angle) * radius;
    this.holding.setPosition(ballX, ballY);
  }

  public updateInput(keyInput: InputKeys, mouseInput: InputMouse, dt: number){
    const dir = new planck.Vec2(0, 0);
    const speedDt = this.speed * dt;

    if (keyInput.up) dir.y -= 1;
    if (keyInput.down) dir.y += 1;

    if (keyInput.right) dir.x += 1;
    if (keyInput.left) dir.x -= 1;

    dir.normalize();
    dir.mul(speedDt);
    this.body.applyForceToCenter(dir, true);

    this.updateHeld(mouseInput);
    this.throwBall(keyInput, mouseInput);
    this.dropBall(keyInput);
  }

  public updateRender() {
    const pos = this.body.getPosition();

    this.container.x = pos.x * PIXELS_PER_UNIT;
    this.container.y = pos.y * PIXELS_PER_UNIT;
  }

}

export type { PlayerConstruct }
