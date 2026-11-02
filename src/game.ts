import { Application, Container, Ticker, Sprite, Texture } from 'pixi.js';
import planck from 'planck';

import { Network } from "./server/network.ts";
import { Physics } from './utils/physics.ts';

import { resizeWorld } from './utils/world.ts';
import { Input } from './input/input.ts';

import { Player, DEFAULT_HEALTH } from './player/player.ts';
import type { PlayerConstruct } from './player/player.ts';

import { Ball, BALL_STATE } from './balls/ball.ts';
import type { BallConstruct } from './balls/ball.ts';

import { GAME_WIDTH, GAME_HEIGHT, PIXELS_PER_UNIT, WALL_THICKNESS, TEAM_SIDE } from './utils/global.ts';

export class Game {
  private app: Application

  private localPlayer!: Player;
  private remotePlayer!: Player;
  private balls: Ball[] = [];
  private worldContainer!: Container

  private physics: Physics = new Physics();
  private input!: Input; 
  private network!: Network;

  constructor(app: Application) {
    this.app = app;
    this.setup();
  }

  private setup(){
    this.createNetwork();
    this.createWorld();
    this.setupInput();
    this.createWalls();
    this.createPlayers();
    this.createBalls();
    this.handleCollision();
  }

  private setupInput(){
    this.input = new Input(this.app, this.worldContainer);
    window.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    this.app.canvas.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });
  }

  private createWorld(){
    const domContainer = document.getElementById('app')!;
    domContainer.appendChild(this.app.canvas);
  
    this.worldContainer = new Container();
    this.app.stage.addChild(this.worldContainer);
    resizeWorld(this.worldContainer);
  
    window.addEventListener('resize', () => {
      resizeWorld(this.worldContainer);
    })
  
    const bg = new Sprite(Texture.WHITE);
    bg.tint = 0xbdc3c7;
    bg.x = -GAME_WIDTH / 2;
    bg.y = -GAME_HEIGHT / 2;
    bg.width = GAME_WIDTH;
    bg.height = GAME_HEIGHT;
    this.worldContainer.addChildAt(bg, 0);
  }

  private createNetwork(){
    this.network = new Network("ws://localhost:3000", "room1");
    this.network.onConnect = () => {
      console.log("Connected to peer!");
    }

    // const remoteInput = this.input.getRemoteInput();
    // this.network.onInput = (input: InputKeys) => {
    //   remoteInput.up = input.up;
    //   remoteInput.down = input.down;
    //   remoteInput.left = input.left;
    //   remoteInput.right = input.right;
    //   remoteInput.throw = input.throw;
    //   remoteInput.drop = input.drop;
    //   remoteInput.ability1 = input.ability1;
    //   remoteInput.ability2 = input.ability2;
    // }

    setInterval(() => {
      this.network.sendInput(this.input.getLocalInput());
    }, 50);

  }

  private createWalls(){
    this.physics.createWallBody((-GAME_WIDTH / 2) / PIXELS_PER_UNIT, 0, WALL_THICKNESS, GAME_HEIGHT / PIXELS_PER_UNIT)
    this.physics.createWallBody((GAME_WIDTH / 2) / PIXELS_PER_UNIT, 0, WALL_THICKNESS, GAME_HEIGHT / PIXELS_PER_UNIT)
    this.physics.createWallBody(0, 0, WALL_THICKNESS, GAME_HEIGHT / PIXELS_PER_UNIT, true)
    this.physics.createWallBody(0, (-GAME_HEIGHT / 2) / PIXELS_PER_UNIT, GAME_WIDTH / PIXELS_PER_UNIT, WALL_THICKNESS)
    this.physics.createWallBody(0, (GAME_HEIGHT / 2) / PIXELS_PER_UNIT, GAME_WIDTH / PIXELS_PER_UNIT, WALL_THICKNESS)
  }

  private createPlayers(){
    const p1Con: PlayerConstruct = {
      x: -GAME_WIDTH / 3,
      y: 0,
      size: 50,
      speed: 50,
      airResist: 10,
      color: 0x3498db,
      side: TEAM_SIDE.Left,
      health: DEFAULT_HEALTH,
    }
  
    const p2Con: PlayerConstruct = {
      x: GAME_WIDTH / 3,
      y: 0,
      size: 50,
      speed: 50,
      airResist: 10,
      color: 0xe74c3c,
      side: TEAM_SIDE.Right,
      health: DEFAULT_HEALTH,
    }
  
    this.localPlayer = new Player(p1Con, this.physics, this.app);
    this.worldContainer.addChild(this.localPlayer.getContainer());
  
    this.remotePlayer = new Player(p2Con, this.physics, this.app);
    this.worldContainer.addChild(this.remotePlayer.getContainer());
  }

  private createBalls(){
    const ball1Con: BallConstruct = {
      x: 0,
      y: GAME_HEIGHT / 3,
      size: 100,
      speed: 2000,
      airResist: 1.0,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball2Con: BallConstruct = {
      x: 0,
      y: 0,
      size: 40,
      speed: 500,
      airResist: 1.5,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball3Con: BallConstruct = {
      x: 0,
      y: -GAME_HEIGHT / 3,
      size: 25,
      speed: 250,
      airResist: 1.0,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball1 = new Ball(ball1Con, this.physics, this.app);
    this.worldContainer.addChild(ball1.getContainer());
    const ball2 = new Ball(ball2Con, this.physics, this.app);
    this.worldContainer.addChild(ball2.getContainer());
    const ball3 = new Ball(ball3Con, this.physics, this.app);
    this.worldContainer.addChild(ball3.getContainer());


    this.balls.push(ball1)
    this.balls.push(ball2)
    this.balls.push(ball3)
  }

  private handleCollision(){
    this.physics.getWorld().on("begin-contact", (contact) => {
      this.handlePlayerCollision(contact);
    });
  }

  private handlePlayerCollision(contact: planck.Contact){
    const bodyA = contact.getFixtureA().getBody();
    const bodyB = contact.getFixtureB().getBody();

    if (bodyA === this.localPlayer.getBody()){
      this.localPlayer.handleCollision(bodyB, this.balls);
    }
    if (bodyB === this.localPlayer.getBody()){
      this.localPlayer.handleCollision(bodyA, this.balls);
    }

    if (bodyA === this.remotePlayer.getBody()){
      this.remotePlayer.handleCollision(bodyB, this.balls);
    }
    if (bodyB === this.remotePlayer.getBody()){
      this.remotePlayer.handleCollision(bodyA, this.balls);
    }
  }

  public update(time: Ticker){
    for (const ball of this.balls){
        ball.updateInput(time.deltaTime);
    }

    this.localPlayer.updateInput(this.input.getLocalInput(), this.input.getMouseInput(), time.deltaTime);
    this.remotePlayer.updateInput(this.input.getRemoteInput(), this.input.getMouseInput(), time.deltaTime);



    this.physics.update();
  }
  
  public render(){
    this.localPlayer.updateRender();
    this.remotePlayer.updateRender();


    for (const ball of this.balls){
        ball.updateRender();
    }

  }
}
