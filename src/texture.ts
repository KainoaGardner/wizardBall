import { Application, Graphics } from 'pixi.js';

export function createCircleTexture(app: Application, radius: number, color: number) {
  const g = new Graphics();

  g.circle(radius, radius, radius);
  g.fill(color);

  const texture = app.renderer.generateTexture(g);
  g.destroy();

  return texture;
}
