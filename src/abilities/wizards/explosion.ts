import { Player } from '../../player/player.ts';
import { Ball } from '../../balls/ball.ts';

export class Explosion {
  x: number;
  y: number;
  size: number;
  force: number;

  constructor(x: number, y: number, size: number, force: number){
    this.x = x;
    this.y = y;
    this.size = size;
    this.force = force;
  }

  public explosion(players: Player[], balls: Ball[]){
    for (const player of players){
      const playerPos = player.getPosition();
      const dx = playerPos.x - this.x;
      const dy = playerPos.y - this.y;

      const dist = dx * dx + dy * dy;
      const normalDist = Math.min(dist / this.size, 1);
      const falloff = Math.exp(-3 * normalDist);
      const force = this.force * falloff;
      const dirX = dx / dist;
      const dirY = dy / dist;
    
      player.setKnockbackSpeed(dirX * force, dirY * force);
    }

    for (const ball of balls){
      const ballPos = ball.getPosition();
      const dx = ballPos.x - this.x;
      const dy = ballPos.y - this.y;

      const dist = dx * dx + dy * dy;
      const normalDist = Math.min(dist / this.size, 1);
      const falloff = Math.exp(-3 * normalDist);
      const force = this.force * falloff;
      const dirX = dx / dist;
      const dirY = dy / dist;

      ball.setKnockbackSpeed(dirX * force, dirY * force);
    }
  }

}
