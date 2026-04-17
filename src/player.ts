import { Application, Container, Sprite, Texture } from 'pixi.js';
import type { Input } from './input.ts';
import planck from 'planck';
import { createPlayerBody } from './physics.ts'
import { createCircleTexture } from './texture.ts';

interface PlayerConstruct {
    x: number,
    y: number,
    size: number,
    speed: number,
    airResist: number,
    color: number,
}

export class Player {
  private container: Container;
  private sprite: Sprite;
  private body: planck.Body;

  private size: number;
  private color: number;
  private speed: number;

  private airResist: number;

  constructor(
    p: PlayerConstruct,
    app: Application,
  ) {

    this.size = p.size;
    this.color = p.color;
    this.speed = p.speed;

    this.container = new Container();
    this.container.x = p.x;
    this.container.y = p.y;

    const circleTex = createCircleTexture(app, p.size, p.color);
    this.sprite = new Sprite(circleTex);
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.body = createPlayerBody(p.x, p.y, p.size);
    this.airResist = p.airResist;

    this.body.setLinearDamping(p.airResist);
  }

  public getContainer(): Container{
    return this.container;
  }

  public updateInput(input: Input, dt: number){
    const dir = new planck.Vec2(0, 0);
    const speedDt = this.speed * dt;

    if (input.up) dir.y -= 1;
    if (input.down) dir.y += 1;

    if (input.right) dir.x += 1;
    if (input.left) dir.x -= 1;

    dir.normalize();
    dir.mul(speedDt);
    this.body.applyForceToCenter(dir, true);
  }

  public updateRender(pixelScale: number) {
    const pos = this.body.getPosition();

    this.container.x = pos.x * pixelScale;
    this.container.y = pos.y * pixelScale;
  }

}

export type { PlayerConstruct }
