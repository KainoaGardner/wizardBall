import "./style.css";

import { Application } from 'pixi.js';
import { Game } from './game.ts';

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: 'transparent',
    backgroundAlpha: 0,
  });

  const game = new Game(app);

  app.ticker.add((time) => {
    game.update(time)

    game.render()

  });
})();


