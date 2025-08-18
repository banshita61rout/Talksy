import { Server } from "socket.io";

 const connectTOsocket=(server)=>{
    const io = new Server(server);
    return io;
}

export default connectTOsocket;