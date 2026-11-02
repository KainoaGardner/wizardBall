interface InputKeys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Input {
   private localInput: InputKeys = {
     up: false,
     down: false,
     left: false,
     right: false,
  };

  private remoteInput: InputKeys = {
     up: false,
     down: false,
     left: false,
     right: false,
  };


  constructor() {
    this.setupInput();
  }

  private setupInput(){
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w') this.localInput.up = true;
      if (e.key === 's') this.localInput.down = true;
      if (e.key === 'a') this.localInput.left = true;
      if (e.key === 'd') this.localInput.right = true;
    });
  
    window.addEventListener('keyup', (e) => {
      if (e.key === 'w') this.localInput.up = false;
      if (e.key === 's') this.localInput.down = false;
      if (e.key === 'a') this.localInput.left = false;
      if (e.key === 'd') this.localInput.right = false;
    });
  
  }

  public getLocalInput(){
    return this.localInput;
  }

  public getRemoteInput(){
    return this.remoteInput;
  }
}


export type { InputKeys }
