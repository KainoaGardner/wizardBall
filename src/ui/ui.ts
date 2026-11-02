import { Container, Graphics, Text } from 'pixi.js';
import { HealthBar } from './healthbar.ts';
import type { HealthBarConstruct } from './healthbar.ts';


export class UI {
  private container: Container;

  private p1Health: HealthBar;
  private p2Health: HealthBar;

  constructor(healthBar1: HealthBarConstruct, healthBar2: HealthBarConstruct) {
    this.container = new Container();
    this.p1Health = new HealthBar(healthBar1);
    this.p2Health = new HealthBar(healthBar2);

    this.container.addChild(this.p1Health.getGraphics())
    this.container.addChild(this.p2Health.getGraphics())
  }

  public getContainer(){
    return this.container;
  }

  // public getHealthBars(){
  //   return [this.p1Health, this.p2Health];
  // }

  public render(){
    this.p1Health.updateRender();
    this.p2Health.updateRender();
  }

}
