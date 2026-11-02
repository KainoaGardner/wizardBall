import { Application, Container, Ticker, Sprite, Texture } from 'pixi.js';
import planck from 'planck';

import { Network } from "./server/network.ts";
import { Physics } from './utils/physics.ts';

import { resizeWorld } from './utils/world.ts';
import { Input } from './input/input.ts';
import type { InputKeys, InputMouse } from './input/input.ts';

import { Player, DEFAULT_HEALTH, PLAYER_ID } from './player/player.ts';
import type { PlayerConstruct, PlayerState } from './player/player.ts';

import { Ball, BALL_STATE } from './balls/ball.ts';
import type { BallConstruct, BallState } from './balls/ball.ts';

import { GAME_WIDTH, GAME_HEIGHT, PIXELS_PER_UNIT, WALL_THICKNESS, TEAM_SIDE, STEP } from './utils/global.ts';

export interface GameStatePacket {
  type: "gameState"
  players: PlayerState[];
  balls: BallState[];
}

export interface GameState {
  players: PlayerState[];
  balls: BallState[];
}

export class Game {
  private app: Application

  private players: Player[] = [];
  private balls: Ball[] = [];
  private worldContainer!: Container

  private physics: Physics = new Physics();
  private input!: Input; 
  private remoteInputs = new Map<string, {
    inputKeys: InputKeys;
    inputMouse: InputMouse;
  }>();

  private network!: Network;

  private accumulator = 0;

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

    this.network.onInput = (packet) => {
      if (!this.network.getIsHost()) return;

      const player = this.players.find(p => p.getId() === PLAYER_ID.P2);
      if (!player) return;

      this.remoteInputs.set(String(player.getId()), {
        inputKeys: packet.inputKeys,
        inputMouse: packet.inputMouse,
      })
    }

    this.network.onGameState = (state) => {
      if (this.network.getIsHost()) return;
      this.applyGameState(state);
    }
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
      id: PLAYER_ID.P1,
      x: -GAME_WIDTH / 3,
      y: 0,
      size: 50,
      speed: 3500,
      airResist: 8,
      color: 0x3498db,
      side: TEAM_SIDE.Left,
      health: DEFAULT_HEALTH,
    }
  
    const p2Con: PlayerConstruct = {
      id: PLAYER_ID.P2,
      x: GAME_WIDTH / 3,
      y: 0,
      size: 50,
      speed: 3500,
      airResist: 8,
      color: 0xe74c3c,
      side: TEAM_SIDE.Right,
      health: DEFAULT_HEALTH,
    }
  
    const p1 = new Player(p1Con, this.physics, this.app);
    this.worldContainer.addChild(p1.getContainer());
    this.players.push(p1);
  
    const p2 = new Player(p2Con, this.physics, this.app);
    this.worldContainer.addChild(p2.getContainer());
    this.players.push(p2);
  }

  private createBalls(){
    const ball1Con: BallConstruct = {
      id: 0,
      x: 0,
      y: GAME_HEIGHT / 3,
      size: 100,
      speed: 3500,
      airResist: 1.0,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball2Con: BallConstruct = {
      id: 1,
      x: 0,
      y: 0,
      size: 40,
      speed: 1000,
      airResist: 1.5,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball3Con: BallConstruct = {
      id: 2,
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

  private getGameState(): GameStatePacket{
    return {
      type: "gameState",

      players: this.players.map(player => {
        return player.getPlayerState();
      }),
      balls: this.balls.map(ball => {
        return ball.getBallState();
      }),
    }
    
  }

  private applyGameState(state: GameState){
    for (const playerState of state.players){
      const player = this.players.find(p => p.getId() === playerState.id);

      if (!player) continue;

      player.setPlayerState(playerState);
    }

    for (const ballState of state.balls){
      const ball = this.balls.find(b => b.getId() === ballState.id);

      if (!ball) continue;

      ball.setBallState(ballState);
    }

  }

  private handleCollision(){
    this.physics.getWorld().on("begin-contact", (contact) => {
      this.handlePlayerCollision(contact);
    });
  }

  private handlePlayerCollision(contact: planck.Contact){
    const bodyA = contact.getFixtureA().getBody();
    const bodyB = contact.getFixtureB().getBody();

    for (const player of this.players){
      if (bodyA === player.getBody()){
        player.handleCollision(bodyB, this.balls);
      }
      if (bodyB === player.getBody()){
        player.handleCollision(bodyA, this.balls);
      }

    }
  }

  public update(time: Ticker){
    const frameTime = Math.min(time.deltaMS / 1000, 0.25);
    this.accumulator += frameTime;

    while (this.accumulator >= STEP){
      if (this.network.getIsHost()){
        this.updateHost(STEP);
      } else{
        this.updateClient(STEP);
      }
      this.accumulator -= STEP;
    }

  }

  private updateHost(dt: number){
    for (const ball of this.balls){
        ball.updateInput(dt);
    }

    for (const player of this.players){
      let input;
      if (player.getId() === PLAYER_ID.P1){
        input = {inputKeys: this.input.getLocalInput(), inputMouse: this.input.getMouseInput()}
      } else{
        input = this.remoteInputs.get(String(player.getId()));
      }
    
      if (!input) continue;
      player.updateInput(input.inputKeys, input.inputMouse, dt)
    }

    this.physics.update();
    this.network.sendGameState(this.getGameState());
  }
  
  private updateClient(dt: number){
    this.network.sendInput({
      type: "input",
      inputKeys: this.input.getLocalInput(),
      inputMouse: this.input.getMouseInput(),
    })
  }
  
  public render(){
    for (const player of this.players){
      player.updateRender();
    }

    for (const ball of this.balls){
        ball.updateRender();
    }

  }
}
