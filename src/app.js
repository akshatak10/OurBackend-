import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // app.use used for middlewares and configuration 

app.use(express.json({limit: "16kb"})) // confriguration
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


export { app } //named export so while importing we need to use import {app} from "./app.js" other wise in default simply write import app from "./app.js"
