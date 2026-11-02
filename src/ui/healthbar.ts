import { Container, Graphics, Text } from 'pixi.js';

import { GAME_WIDTH, GAME_HEIGHT, PLAY_HEIGHT, PLAY_WIDTH } from '../utils/global.ts';

export const HEALTH_BAR_PADDING = 10;
const HEALTH_BAR_BACKGROUND_COLOR = 0x2d3436;

export interface HealthBarConstruct {
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  color: number,
}

export class HealthBar {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private padding: number;
  private color!: number;

  private graphics: Graphics;

  private health: number

  constructor(h: HealthBarConstruct) {
    this.graphics = new Graphics();
    this.width = h.width;
    this.height = h.height;
    this.x = h.x;
    this.y = h.y;
    this.health = 1.0;
    this.padding = h.padding;
    this.color = h.color;

    this.updateRender();
  }

  public getGraphics(){
    return this.graphics
  }

  public updateRender(){
    this.graphics.clear();
    this.graphics.rect(this.x, this.y, this.width * this.health, this.height).fill(HEALTH_BAR_BACKGROUND_COLOR);
    this.graphics.rect(this.x + this.padding, this.y + this.padding, this.width * this.health - this.padding * 2, this.height - this.padding * 2).fill(this.color);
  }
}
