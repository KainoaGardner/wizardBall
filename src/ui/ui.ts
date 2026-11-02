import { Container, Graphics, Text } from 'pixi.js';
import { HealthBar } from './healthbar.ts';
import type { HealthBarConstruct } from './healthbar.ts';

export interface UIState {
  p1Health: number;
  p2Health: number;
}

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

  public getUIState(): UIState {
    return {
      p1Health: this.p1Health.getHealth(),
      p2Health: this.p2Health.getHealth()
    }
  }

  public setUIState(uiState: UIState){
    this.p1Health.setHealth(uiState.p1Health);
    this.p2Health.setHealth(uiState.p2Health);
  }

  public update(normHealth1: number, normHealth2: number){
    this.p1Health.setHealth(normHealth1);
    this.p2Health.setHealth(normHealth2);
  }

  public render(){
    this.p1Health.updateRender();
    this.p2Health.updateRender();
  }

}
