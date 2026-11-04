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

import { Ball } from './balls/ball.ts';

import { BALL_TYPE, NORMAL_BALL_TYPE_CONST, BALL_STATE } from './balls/types.ts';
import type { BallConstruct, BallState,  } from './balls/types.ts';

import type { UIState } from './ui/ui.ts';
import { HealthBar, HEALTH_BAR_PADDING, DIRECTION } from './ui/healthbar.ts';
import type { HealthBarConstruct } from './ui/healthbar.ts';

import { GAME_WIDTH, GAME_HEIGHT, PLAY_WIDTH, PLAY_HEIGHT, PIXELS_PER_UNIT, WALL_THICKNESS, MID_WALL_THICKNESS, TEAM_SIDE, STEP } from './utils/global.ts';
import { BallFactory } from './balls/ballFactory.ts';
import { BallCallbacks } from './balls/ballCallbacks.ts';


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
  private pendingBalls: Ball[] = [];
  private worldContainer!: Container;
  private ballFactory!: BallFactory;
  private ballCallbacks!: BallCallbacks;

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

    this.createBallCallbacks();
    this.createBallFactory();

    this.setupInput();
    this.createWalls();
    this.createPlayers();
    this.createBalls();
    this.createUI();
    this.handleCollision();
  }

  private createBallFactory(){
    this.ballFactory = new BallFactory(
      this.physics,
      this.app, 
      (con, angle, color) => this.ballCallbacks.spawnFireball(con, angle, color), 
    );

    this.ballCallbacks.setBallFactory(this.ballFactory);
  }

  private createBallCallbacks(){
    this.ballCallbacks = new BallCallbacks(this.pendingBalls);
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
    let ball1Con: BallConstruct = {
      x: 0,
      y: GAME_HEIGHT / 3,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    let ball2Con: BallConstruct = {
      x: 0,
      y: -GAME_HEIGHT / 3,
      state: BALL_STATE.Neutral,
      side: TEAM_SIDE.Neither,
    }

    const ball1 = this.ballFactory.createBall(BALL_TYPE.Normal, ball1Con, NORMAL_BALL_TYPE_CONST);
    this.worldContainer.addChild(ball1.getContainer());
    const ball2 = this.ballFactory.createBall(BALL_TYPE.FireInfused, ball2Con, NORMAL_BALL_TYPE_CONST); 
    this.worldContainer.addChild(ball2.getContainer());

    this.balls.push(ball1)
    this.balls.push(ball2)
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

    const hostBallIds = new Set(state.balls.map(b => b.id));
    for (const ball of this.balls){
      if (!hostBallIds.has(ball.getId())){
        ball.kill();
      } 
    }

    for (const ballState of state.balls){
      let ball = this.balls.find(b => b.getId() === ballState.id);

      if (!ball){
        const ballCon: BallConstruct = {
          x: ballState.x,
          y: ballState.y,
          state: ballState.state,
          side: ballState.side,
        }
        ball = this.ballFactory.createBall(ballState.type, ballCon, NORMAL_BALL_TYPE_CONST);

        this.worldContainer.addChild(ball.getContainer());
        this.balls.push(ball)
      };

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

  private updateNewBalls(){
    for (const ball of this.pendingBalls) {
      this.balls.push(ball);
      this.worldContainer.addChild(ball.getContainer());
    }
    this.pendingBalls.length = 0;
  }


  private updateDeadBalls(){
    const deadBalls = this.balls.filter(b => !b.isAlive())

    for (const ball of deadBalls){
      ball.destory(this.physics)
    }

    this.balls = this.balls.filter(b => b.isAlive())
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
      ball.update(dt);
    }

    for (const player of this.players){
      let input;
      if (player.getId() === PLAYER_ID.P1){
        input = {inputKeys: this.input.getLocalInput(), inputMouse: this.input.getMouseInput()}
      } else{
        input = this.remoteInputs.get(String(player.getId()));
      }
    
      if (!input) continue;
      player.update(input.inputKeys, input.inputMouse, this.balls, dt)
    }

    this.physics.update();
 
    this.updateUI();
    this.updateDeath();
    this.updateDeadBalls();
    this.updateNewBalls();
    this.network.sendGameState(this.getGameState());
  }
  
  private updateClient(dt: number){
    this.network.sendInput({
      type: "input",
      inputKeys: this.input.getLocalInput(),
      inputMouse: this.input.getMouseInput(),
    })

    this.updateDeadBalls();
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
