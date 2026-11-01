import planck from 'planck';

import { PIXELS_PER_UNIT } from './global.ts';

enum COLLISION_GROUPS {
  Player = 0x0001,
  Ball = 0x0002,
  Wall = 0x0004,
}

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
    filterCategoryBits: COLLISION_GROUPS.Player,
    filterMaskBits: COLLISION_GROUPS.Player | COLLISION_GROUPS.Wall | COLLISION_GROUPS.Ball,
    density: 1,
    friction: 0,
  });

  return body;
}

export function createWallBody(x: number, y: number, width: number, height: number, middleWall: boolean = false){
  const wall = planckWorld.createBody({
    position: new planck.Vec2(x, y)
  });

  if (middleWall){
    wall.createFixture({
      shape: new planck.Box(width / 2, height / 2),
      filterCategoryBits: COLLISION_GROUPS.Wall,
      filterMaskBits: COLLISION_GROUPS.Player | COLLISION_GROUPS.Wall,
      restitution: 0.8,
      friction: 0,
    })
  }else {
    wall.createFixture({
      shape: new planck.Box(width / 2, height / 2),
      filterCategoryBits: COLLISION_GROUPS.Wall,
      filterMaskBits: COLLISION_GROUPS.Player | COLLISION_GROUPS.Wall | COLLISION_GROUPS.Ball,
      restitution: 0.8,
      friction: 0,
    })
  }
}

export { planckWorld }
