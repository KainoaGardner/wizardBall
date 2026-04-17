import planck from 'planck';

const STEP = 1 / 60;
const PIXELS_PER_UNIT = 100;

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

export { planckWorld, STEP, PIXELS_PER_UNIT }
