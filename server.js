import express from "express";
import * as http from "http";
import mongoose from "mongoose";

import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import auth from "./routes/auth.js";
const app = express();
const server = http.createServer(app);

if(process.env.NODE_ENV !== "production") {
  app.use(morgan('dev'));
}

app.use(express.json({limit: "5mb"}));

app.use(express.urlencoded({extended: true}));


app.use("/api/auth",auth);

app.use("/",(req,res) => {
    res.send("Server of Free Space is running");
});

const PORT = process.env.PORT || 8000;
const start = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log("Connected to MongoDB"));

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch(error){
        console.log(error);
    }
}
start();