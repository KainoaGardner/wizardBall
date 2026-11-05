import {  TEAM_SIDE } from '../utils/global.ts';

export enum BALL_TYPE {
  Normal,
  FireInfused,
  Fire,
  ExplosionInfused,
}

export interface BallState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  alive: boolean;
  type: BALL_TYPE;
  state: BALL_STATE;
  side: TEAM_SIDE;
  speed: number,
}

export interface BallConstruct {
  x: number,
  y: number,
  state: BALL_STATE,
  side: TEAM_SIDE,
}

export interface BallTypeConstruct {
  size: number;
  color: number;
  speed: number;
  damage: number;
  airResist: number;
  type: BALL_TYPE;
}

export enum BALL_STATE {
  Neutral,
  Held,
  Thrown,
}

export const NORMAL_BALL_TYPE_CONST: BallTypeConstruct = {
  size: 40,
  speed: 40,
  airResist: 1.5,
  color: 0xFFFFFF,
  damage: 30,
  type: BALL_TYPE.Normal,
}
