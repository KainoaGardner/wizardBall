import { Application, Container, wordWrapTaggedLines } from 'pixi.js';

interface InputKeys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  throw: boolean;
  drop: boolean;
  catch: boolean;
  ability1: boolean;
  ability2: boolean;
}

interface InputMouse {
  x: number;
  y: number;
}

export class Input {
  private localInput: InputKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
    throw: false,
    drop: false,
    catch: false,
    ability1: false,
    ability2: false,
  };

  private mousePos: InputMouse = {
    x: 0,
    y: 0,
  }

  constructor(app: Application, worldContainer: Container) {
    this.setupInput(app, worldContainer);
  }

  private setupInput(app: Application, worldContainer: Container){
    this.setupKeyInput()
    this.setupMouseInput(app, worldContainer)
  }

  private setupKeyInput(){
     window.addEventListener('keydown', (e) => {
      if (e.key === 'w') this.localInput.up = true;
      if (e.key === 's') this.localInput.down = true;
      if (e.key === 'a') this.localInput.left = true;
      if (e.key === 'd') this.localInput.right = true;
      if (e.key === ' ') this.localInput.catch = true;
    });
  
    window.addEventListener('keyup', (e) => {
      if (e.key === 'w') this.localInput.up = false;
      if (e.key === 's') this.localInput.down = false;
      if (e.key === 'a') this.localInput.left = false;
      if (e.key === 'd') this.localInput.right = false;
      if (e.key === ' ') this.localInput.catch = false;
    });   
  }

  private setupMouseInput(app: Application, worldContainer: Container){
    window.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    window.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });
    window.addEventListener("mousemove", (event) => {
      this.onMouseMove(event, app, worldContainer);
    });
  }

  private onMouseDown (event: MouseEvent){
    if (event.button === 0){
      this.localInput.throw = true;
    }
    if (event.button === 2){
      this.localInput.drop = true;
    }
  }

  private onMouseUp (event: MouseEvent){
    if (event.button === 0){
      this.localInput.throw = false;
    }
    if (event.button === 2){
      this.localInput.drop = false;
    }
  }

  private onMouseMove (event: MouseEvent, app: Application, worldContainer: Container){
    const rect = app.canvas.getBoundingClientRect(); 

    const canvasPos = {
      x: (event.clientX - rect.left) * (app.screen.width / rect.width),
      y: (event.clientY - rect.top) * (app.screen.height / rect.height),
    }

    const mousePos = worldContainer.toLocal(canvasPos);
    this.mousePos = mousePos;
  }

  public getLocalInput(){
    return this.localInput;
  }

  public getMouseInput(){
    return this.mousePos;
  }
}


export type { InputKeys, InputMouse }
