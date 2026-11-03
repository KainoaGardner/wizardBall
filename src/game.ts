import { Application, Container, Ticker, Sprite, Texture } from 'pixi.js';
import planck from 'planck';

import { UI } from './ui/ui.ts';

import { Network } from "./server/network.ts";
import { Physics } from './utils/physics.ts';

import { resizeWorld } from './utils/world.ts';
import { Input } from './input/input.ts';
import type { InputKeys, InputMouse } from './input/input.ts';

import { Player, DEFAULT_HEALTH, PLAYER_ID } from './player/player.ts';
import type { PlayerConstruct, PlayerState } from './player/player.ts';

import { Ball, BALL_STATE } from './balls/ball.ts';
import type { BallConstruct, BallState } from './balls/ball.ts';

import type { UIState } from './ui/ui.ts';
import { HealthBar, HEALTH_BAR_PADDING, DIRECTION } from './ui/healthbar.ts';
import type { HealthBarConstruct } from './ui/healthbar.ts';

import { GAME_WIDTH, GAME_HEIGHT, PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, WALL_THICKNESS, MID_WALL_THICKNESS, TEAM_SIDE, STEP } from './utils/global.ts';

export interface GameStatePacket {
  type: "gameState"
  players: PlayerState[];
  balls: BallState[];
  ui: UIState;
}

export interface GameState {
  players: PlayerState[];
  balls: BallState[];
  ui: UIState;
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

  private UI!: UI;

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
    this.createUI();
    this.handleCollision();
  }

  private resetGame(){
    for (const player of this.players){
      player.reset();
    }

    for (const ball of this.balls){
      ball.reset();
    }
  }

  private createUI(){
    const p1 = this.players.find(p => p.getId() === PLAYER_ID.P1)!;
    const p2 = this.players.find(p => p.getId() === PLAYER_ID.P2)!;

    const hb1Con: HealthBarConstruct = {
      x: -GAME_WIDTH / 2,
      y: -GAME_HEIGHT / 2,
      width: GAME_WIDTH / 2,
      height: (GAME_HEIGHT - PLAY_HEIGHT) / 2,
      color: p1.getColor(),
      padding: HEALTH_BAR_PADDING,
      dir: DIRECTION.Right,
    }

    const hb2Con: HealthBarConstruct = {
      x: 0,
      y: -GAME_HEIGHT / 2,
      width: GAME_WIDTH / 2,
      height: (GAME_HEIGHT - PLAY_HEIGHT) / 2,
      color: p2.getColor(),
      padding: HEALTH_BAR_PADDING,
      dir: DIRECTION.Left,
    }
  
    this.UI = new UI(hb1Con, hb2Con);
    this.worldContainer.addChild(this.UI.getContainer())
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
    this.physics.createWallBody((-PLAY_WIDTH / 2) / PIXELS_PER_UNIT - WALL_THICKNESS / 2, 0, WALL_THICKNESS, PLAY_HEIGHT / PIXELS_PER_UNIT)
    this.physics.createWallBody((GAME_WIDTH / 2) / PIXELS_PER_UNIT + WALL_THICKNESS / 2, 0, WALL_THICKNESS, PLAY_HEIGHT / PIXELS_PER_UNIT)
    this.physics.createWallBody(0, 0, MID_WALL_THICKNESS, PLAY_HEIGHT / PIXELS_PER_UNIT, true)
    this.physics.createWallBody(0, (-PLAY_HEIGHT / 2) / PIXELS_PER_UNIT - WALL_THICKNESS / 2, PLAY_WIDTH / PIXELS_PER_UNIT, WALL_THICKNESS)
    this.physics.createWallBody(0, (PLAY_HEIGHT / 2) / PIXELS_PER_UNIT + WALL_THICKNESS / 2, PLAY_WIDTH / PIXELS_PER_UNIT, WALL_THICKNESS)
  }

  private createPlayers(){
    this.players.length = 0;

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
    this.balls.length = 0;
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
      damage: 50,
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
      damage: 30,
    }

    const ball3Con: BallConstruct = {
      id: 2,
      x: 0,
      y: -GAME_HEIGHT / 3,
      size: 25,
      speed: 350,
      airResist: 1.0,
      color: 0xFFFFFF,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
      damage: 25,
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

      ui: this.UI.getUIState(),
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

    this.UI.setUIState(state.ui);

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

  private updateUI(){
    const p1 = this.players.find(p => p.getId() === PLAYER_ID.P1);
    const p2 = this.players.find(p => p.getId() === PLAYER_ID.P2);
    const p1Health = p1 ? p1.getNormalHealth() : 1.0;
    const p2Health = p2 ? p2.getNormalHealth() : 1.0;
    this.UI.update(p1Health, p2Health);
  }

  private updateDeath(){
    for (const player of this.players){
      if (player.getNormalHealth() <= 0){
        this.resetGame();
        break;
      }
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
      player.update(input.inputKeys, input.inputMouse, dt)
    }

    this.physics.update();
 
    this.updateUI();
    this.updateDeath();
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

    this.UI.render();
  }
}
