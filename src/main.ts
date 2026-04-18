import "./style.css";

import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import { resizeWorld, GAME_WIDTH, GAME_HEIGHT } from './world.ts';

import { Player } from './player.ts';
import type { PlayerConstruct } from './player.ts';

import type { Input } from './input.ts';

import { planckWorld, STEP, PIXELS_PER_UNIT } from './physics.ts';

import { Network } from "./server/network.ts";

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

  const localInput: Input = {
     up: false,
     down: false,
     left: false,
     right: false,
  };

  const remoteInput: Input = {
     up: false,
     down: false,
     left: false,
     right: false,
  };

  const network = new Network("ws://localhost:3000", "room1");
  network.onConnect = () => {
    console.log("Connected to peer!");
  }

  network.onInput = (input: Input) => {
    remoteInput.up = input.up;
    remoteInput.down = input.down;
    remoteInput.left = input.left;
    remoteInput.right = input.right;
  }

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

  const localPlayer = new Player(p1Con, app);
  worldCon.addChild(localPlayer.getContainer());

  const remotePlayer = new Player(p2Con, app);
  worldCon.addChild(remotePlayer.getContainer());

  // basic keyboard input
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w') localInput.up = true;
    if (e.key === 's') localInput.down = true;
    if (e.key === 'a') localInput.left = true;
    if (e.key === 'd') localInput.right = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'w') localInput.up = false;
    if (e.key === 's') localInput.down = false;
    if (e.key === 'a') localInput.left = false;
    if (e.key === 'd') localInput.right = false;
  });


  setInterval(() => {
    network.sendInput(localInput);
  }, 50);

  app.ticker.add((time) => {
    localPlayer.updateInput(localInput, time.deltaTime);
    remotePlayer.updateInput(remoteInput, time.deltaTime);

    planckWorld.step(STEP);

    localPlayer.updateRender(PIXELS_PER_UNIT);
    remotePlayer.updateRender(PIXELS_PER_UNIT);
  });
})();


