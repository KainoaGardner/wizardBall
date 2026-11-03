// --FIRE 
// -ABILITY
// 1. Armageddon:
//   explode all your balls
//
// 2. Fire storm:
//   next ball split into 3 little fireballs
//
// 3.Supernova:
//   charge fireball insta explode on impact (cant bounce big explosion)
//
// -PASSIVE
// 1. Scorch: 
//   burn damage on ball
//
// 2. Combustion: 
//   balls explode on every impact (cant bounce small explosion)
//
// 3. Scorching Path: 
//   ball burn trail



import type { AbilityDefinition } from "../ability";
import { Player } from '../../player/player.ts';
import { Ball } from '../../balls/ball.ts';

export enum EXPLOSION_SIZE {
  Small = 5,
  Medium = 10,
  Large = 50,
}

export const armageddon: AbilityDefinition = {
  id: "armageddon",
  name: "Armageddon",
  description: "Detonate all your active balls at once. Each explosion destroys the ball that triggered it and any other balls caught within its blast radius.",
  cooldown: 20,

  activate(player: Player, balls: Ball[]){
    const playerBalls = balls.filter(b => b.getSide() === player.getSide())
    for (const ball of playerBalls){
      ball.explode(EXPLOSION_SIZE.Medium);
    }
  },

  update(player: Player, balls: Ball[]){

  }
}

export const firestorm: AbilityDefinition = {
  id: "firestorm",
  name: "Firestorm",
  description: "Infuse a held ball with fiery energy. When thrown, it splits into 3 smaller fireballs.",
  cooldown: 15,

  activate(player: Player, balls: Ball[]){
  },

  update(player: Player, balls: Ball[]){

  }
}

export const supernova: AbilityDefinition = {
  id: "supernova",
  name: "Supernova",
  description: "Infuse a held ball with explosive energy. When thrown, it detonates on its first collision, creating a massive explosion that destroys nearby balls caught in the blast. The ball cannot bounce.",
  cooldown: 30,

  activate(player: Player, balls: Ball[]){
  },

  update(player: Player, balls: Ball[]){

  }
}
