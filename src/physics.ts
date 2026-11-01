import planck from 'planck';

import { PIXELS_PER_UNIT } from './global.ts';

const planckWorld = new planck.World({
  gravity: {x: 0, y: 0},
});

export function createPlayerBody(x: number, y: number, radius: number){
  const body = planckWorld.createBody({
    type: "dynamic",
    position: new planck.Vec2(x / PIXELS_PER_UNIT, y / PIXELS_PER_UNIT),
    fixedRotation: true,
  });

  body.createFixture({
    shape: new planck.Circle(radius / PIXELS_PER_UNIT),
    density: 1,
    friction: 0,
  });

  return body;
}

export function createWallBody(x: number, y: number, width: number, height: number){
  const wall = planckWorld.createBody({
    position: new planck.Vec2(x, y)
  });

  wall.createFixture({
    shape: new planck.Box(width / 2, height / 2),
    restitution: 0.8,
    friction: 0,
  })
}

export { planckWorld }
