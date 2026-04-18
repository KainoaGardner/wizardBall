import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 3000 });
const rooms: Map<string, WebSocket[]> = new Map();

wss.on("connection", (ws: WebSocket) => {
  let roomId: string | null = null;

  ws.on("message", (msg: Buffer) => {
    const data = JSON.parse(msg.toString());

    if (data.type === "join"){
      roomId = data.room;
      if (!roomId) return;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
      }
  
      const room = rooms.get(roomId)!;
      room.push(ws);

      ws.send(JSON.stringify({
        type: 'role',
        initiator: room.length === 1
      }));
    };

    if (data.type === "signal") {
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      room.forEach(client => {
        if (client !== ws) {
          client.send(JSON.stringify({
            type: "signal",
            data: data.data
          }));
        }
      })
    }
  });

  ws.on("close", () => {
    if (!roomId) return;

    const room = rooms.get(roomId) || [];
    if (!room) return;

    const filtered = room.filter(client => client !== ws);

    if (filtered.length === 0){
      rooms.delete(roomId);
    }else{
      rooms.set(roomId, filtered);
    }
  });

});

console.log("Signaling server running on port 3000");
