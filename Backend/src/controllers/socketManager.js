import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["talksy-frontend.netlify.app", "http://localhost:5173"],
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-call", (path) => {
            if (!connections[path]) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // Notify everyone in the room (including the new joiner)
            connections[path].forEach((id) => {
                io.to(id).emit("user-joined", socket.id, connections[path]);
            });

            // Send existing chat history to the new joiner
            if (messages[path]) {
                messages[path].forEach((msg) => {
                    io.to(socket.id).emit(
                        "chat-message",
                        msg.data,
                        msg.sender,
                        msg["socket-id-sender"]
                    );
                });
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            // Find which room this socket belongs to
            const matchingRoom = Object.entries(connections).find(([, members]) =>
                members.includes(socket.id)
            )?.[0];

            if (matchingRoom) {
                if (!messages[matchingRoom]) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    sender,
                    data,
                    "socket-id-sender": socket.id
                });

                connections[matchingRoom].forEach((id) => {
                    io.to(id).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            const elapsed = Math.abs(timeOnline[socket.id] - new Date());
            delete timeOnline[socket.id];

            for (const [roomKey, members] of Object.entries(connections)) {
                const index = members.indexOf(socket.id);
                if (index !== -1) {
                    // Notify others in the room
                    members.forEach((id) => {
                        io.to(id).emit("user-left", socket.id);
                    });

                    connections[roomKey].splice(index, 1);

                    if (connections[roomKey].length === 0) {
                        delete connections[roomKey];
                        delete messages[roomKey];
                    }
                    break;
                }
            }

            console.log(`Socket disconnected: ${socket.id} after ${elapsed}ms`);
        });
    });

    return io;
};
