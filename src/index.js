//require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants.js";
import {app} from "./app.js"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./.env'
})


connectDB()

.then(()=>{
    app.listen(process.env.PORT||8000 , ()=>{
        console.log(`server is running at port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("mangoDb connection failed !!!  ",err);
})









/*
import { express } from "express";
const app = express()
(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",()=>{
        console.log("ERRR: ",error);
        throw error
       })    

       app.listen(process.env.PORT, ()=>{
        console.log(`app is listening on port ${process.env.PORT}`);
       })
    } catch (error) {
        console.log("ERROR: ",error);
        throw error
    }
})()
*/