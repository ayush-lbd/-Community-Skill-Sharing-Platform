import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/test", (req, res) => {
    res.status(200).json({ message: "Express is alive on port 8000!" });
});
// Routes import
import userRouter from "./routes/user.routes.js"

// Routes declaration
app.use("/api/users", userRouter)

export { app }