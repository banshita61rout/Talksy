import express from "express";
import{createServer} from "node:http"; // used for socketio for raw http
import { Server } from "socket.io";
import connectTOsocket from "./controllers/socketmaneger.js";
 import mongoose from "mongoose";
 import cors from "cors";
 import userRoutes from "./routes/userrouter.js";

const app = express();
const server = createServer(app); 
 connectTOsocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit:"40Kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));


app.use("/api/v1/users",userRoutes);





const start = async () => {
  try {
    await mongoose.connect("mongodb+srv://banshitarout1:banshitawebdev@cluster0.1h2x1me.mongodb.net/");
    console.log(" DB CONNECTED");
  } catch (err) {
    console.error(" DB Connection Failed:", err);
  }
};







server.listen(8000,()=>{
    console.log("listening on port 8000" )
});

start();





