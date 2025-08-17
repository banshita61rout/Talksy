import express from "express";
import{createServer} from "node:http"; // used for socketio for raw http
import { Server } from "socket.io";
 import mongoose from "mongoose";
 import cors from "cors";



 
const app = express()

app.get('/', (req, res) => {
  res.send('Hello banshita')
})
app.listen(8000,()=>{
    console.log("listening to port 8000" )
})
