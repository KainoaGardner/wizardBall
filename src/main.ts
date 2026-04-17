import "./style.css";

import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { resizeWorld, GAME_WIDTH, GAME_HEIGHT } from './world.ts';

import { Player } from './player.ts';
import type { PlayerConstruct } from './player.ts';

import type { Input } from './input.ts';

import { planckWorld, STEP, PIXELS_PER_UNIT } from './physics.ts'

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: 'transparent',
    backgroundAlpha: 0,
  });

  const domContainer = document.getElementById('app')!;
  domContainer.appendChild(app.canvas);

  const worldCon = new Container();
  app.stage.addChild(worldCon);
  resizeWorld(worldCon);

  window.addEventListener('resize', () => {
    resizeWorld(worldCon);
  })

  const bg = new Sprite(Texture.WHITE);
  bg.tint = 0xbdc3c7;
  bg.x = -GAME_WIDTH / 2;
  bg.y = -GAME_HEIGHT / 2;
  bg.width = GAME_WIDTH;
  bg.height = GAME_HEIGHT;
  worldCon.addChildAt(bg, 0);

  const p1Con: PlayerConstruct = {
    x: -GAME_WIDTH / 3,
    y: 0,
    size: 50,
    speed: 50,
    airResist: 10,
    color: 0x3498db,
  }

  const p2Con: PlayerConstruct = {
    x: GAME_WIDTH / 3,
    y: 0,
    size: 50,
    speed: 50,
    airResist: 10,
    color: 0xe74c3c,
  }

  const p1 = new Player(p1Con, app);
  worldCon.addChild(p1.getContainer());

  const p2 = new Player(p2Con, app);
  worldCon.addChild(p2.getContainer());

  const input1: Input = {
     up: false,
     down: false,
     left: false,
     right: false,
  };

  const input2: Input = {
     up: false,
     down: false,
     left: false,
     right: false,
  };

  // basic keyboard input
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') input1.up = true;
    if (e.key === 's') input1.down = true;
    if (e.key === 'a') input1.left = true;
    if (e.key === 'd') input1.right = true;

    if (e.key === 'ArrowUp') input2.up = true;
    if (e.key === 'ArrowDown') input2.down = true;
    if (e.key === 'ArrowLeft') input2.left = true;
    if (e.key === 'ArrowRight') input2.right = true;

  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'w') input1.up = false;
    if (e.key === 's') input1.down = false;
    if (e.key === 'a') input1.left = false;
    if (e.key === 'd') input1.right = false;

    if (e.key === 'ArrowUp') input2.up = false;
    if (e.key === 'ArrowDown') input2.down = false;
    if (e.key === 'ArrowLeft') input2.left = false;
    if (e.key === 'ArrowRight') input2.right = false;
  });

  app.ticker.add((time) => {
    planckWorld.step(STEP);

    p1.updateInput(input1 ,time.deltaTime);
    p1.updateRender(PIXELS_PER_UNIT);

    p2.updateInput(input2 ,time.deltaTime);
    p2.updateRender(PIXELS_PER_UNIT);
  });
})();


