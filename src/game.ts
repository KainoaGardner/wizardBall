import { Application, Container, Ticker, Sprite, Texture } from 'pixi.js';
import planck from 'planck';

import { Network } from "./server/network.ts";
import { Physics } from './physics.ts';

import { resizeWorld } from './world.ts';
import { Input } from './input.ts';
import type { InputKeys } from './input.ts';

import { Player } from './player.ts';
import type { PlayerConstruct } from './player.ts';

import { Ball, BALL_STATE } from './ball.ts';
import type { BallConstruct } from './ball.ts';

import { GAME_WIDTH, GAME_HEIGHT, PIXELS_PER_UNIT, WALL_THICKNESS, TEAM_SIDE } from './global.ts';

export class Game {
  private app: Application

  private localPlayer!: Player;
  private remotePlayer!: Player;
  private balls: Ball[] = [];
  private worldContainer!: Container

  private physics: Physics = new Physics();
  private input: Input = new Input(); 
  private network!: Network;

  constructor(app: Application) {
    this.app = app;
    this.setup();
  }

  private setup(){
    this.createNetwork();
    this.createWorld();
    this.createWalls();
    this.createPlayers();
    this.createBalls();
    this.handleCollision();
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

    const remoteInput = this.input.getRemoteInput();
    this.network.onInput = (input: InputKeys) => {
      remoteInput.up = input.up;
      remoteInput.down = input.down;
      remoteInput.left = input.left;
      remoteInput.right = input.right;
    }

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
    }
  
    const p2Con: PlayerConstruct = {
      x: GAME_WIDTH / 3,
      y: 0,
      size: 50,
      speed: 50,
      airResist: 10,
      color: 0xe74c3c,
      side: TEAM_SIDE.Right,
    }
  
    this.localPlayer = new Player(p1Con, this.physics, this.app);
    this.worldContainer.addChild(this.localPlayer.getContainer());
  
    this.remotePlayer = new Player(p2Con, this.physics, this.app);
    this.worldContainer.addChild(this.remotePlayer.getContainer());
  }

  private createBalls(){
    const ball1Con: BallConstruct = {
      x: 0,
      y: 0,
      size: 30,
      speed: 50,
      airResist: 3,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball1 = new Ball(ball1Con, this.physics, this.app);
    this.worldContainer.addChild(ball1.getContainer());
    this.balls.push(ball1)
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
    this.localPlayer.updateInput(this.input.getLocalInput(), time.deltaTime);
    this.remotePlayer.updateInput(this.input.getRemoteInput(), time.deltaTime);


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
