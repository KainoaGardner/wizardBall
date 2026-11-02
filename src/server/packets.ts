import type { InputKeys, InputMouse } from "../input/input.ts"
import type { GameStatePacket } from "../game.ts"

export interface RoleMessage { 
  type: "role",
  initiator: boolean 
}

export interface SignalMessage {
  type: "signal",
  data: any 
}

export type ServerMessage = RoleMessage | SignalMessage;

export interface InputPacket {
  type: "input",
  inputKeys: InputKeys;
  inputMouse: InputMouse;
}

export type PeerMessage = InputPacket | GameStatePacket
