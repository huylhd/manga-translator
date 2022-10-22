import { Server } from "socket.io";

let io: Server;
export const createSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  return io;
};

export const getSocket = () => io;
