import Peer from 'simple-peer';

type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

type RoleMessage = { 
  type: "role",
  initiator: boolean 
}

type SignalMessage = {
  type: "signal",
  data: any 
}

type ServerMessage = RoleMessage | SignalMessage;

type PeerMessage = { 
  type: "input",
  input: InputState
};

export class Network {
  private socket: WebSocket;
  private peer?: InstanceType<typeof Peer>;

  public onInput?: (input: InputState) => void;
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
        this.createPeer(data.initiator);
      }

      if (data.type === "signal"){
        if (!this.peer) return;
        this.peer.signal(data.data);
      }
    };
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
        this.onInput?.(msg.input);
      }
    });

    this.peer.on("close", () => {
      console.log("Peer disconnected");
    })

    this.peer.on("error", (err: Error) => {
      console.log(err);
    })
  }

  public sendInput(input: InputState) {
    if (!this.peer || !this.peer.connected) return;

    this.peer.send(JSON.stringify({
      type: "input",
      input: input
    }));
  }
}
