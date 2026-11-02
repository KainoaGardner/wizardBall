import Peer from 'simple-peer';

import type { InputPacket, ServerMessage, PeerMessage } from "./packets.ts"
import type { GameStatePacket } from "../game.ts"


export class Network {
  private socket: WebSocket;
  private peer?: InstanceType<typeof Peer>;
  private isHost: boolean = false;

  public onInput?: (packet: InputPacket) => void;
  public onGameState?: (packet: GameStatePacket) => void;
  public onConnect?: () => void;


  constructor(serverUrl: string, room: string){
    this.socket = new WebSocket(serverUrl);
    
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
        type: 'join',
        room: room,
      }));
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as ServerMessage;

      if (data.type === "role"){
        this.isHost = data.initiator;
        this.createPeer(data.initiator);
      }

      if (data.type === "signal"){
        if (!this.peer) return;
        this.peer.signal(data.data);
      }
    };
  }

  public getIsHost(){
    return this.isHost;
  }
  
  private createPeer(initiator: boolean){
    this.peer = new Peer({
      initiator,
      trickle: true
    });

    this.peer.on("signal", (data: any) => {
      this.socket.send(JSON.stringify({
        type: "signal",
        data: data
      }));
    });

    this.peer.on("connect", () => {
      console.log("P2P connected");
      this.onConnect?.();
    });

    this.peer.on("data", (data: Uint8Array) => {
      const msg = JSON.parse(data.toString()) as PeerMessage;

      if (msg.type === "input"){
        this.onInput?.(msg);
      }

      if (msg.type === "gameState"){
        this.onGameState?.(msg);
      }
    });

    this.peer.on("close", () => {
      console.log("Peer disconnected");
    })

    this.peer.on("error", (err: Error) => {
      console.log(err);
    })
  }

  public sendInput(packet: InputPacket) {
    if (!this.peer || !this.peer.connected) return;

    this.peer.send(JSON.stringify(packet));
  }

  public sendGameState(packet: GameStatePacket) {
    if (!this.peer || !this.peer.connected) return;

    this.peer.send(JSON.stringify(packet));
  }


}
