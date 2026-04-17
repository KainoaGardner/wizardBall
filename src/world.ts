const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

import { Container } from 'pixi.js';

export function resizeWorld(world: Container) {
  const scale = Math.min(
    window.innerWidth / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  )

  world.scale.set(scale);
  world.position.set(
    window.innerWidth / 2,
    window.innerHeight / 2
  )
}

export { GAME_WIDTH, GAME_HEIGHT }
