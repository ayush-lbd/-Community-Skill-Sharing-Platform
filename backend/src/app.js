import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express()
app.use(cors({
    origin: [
    process.env.CORS_ORIGIN, // Your local Vite frontend URL (change port if yours is different)
    'https://community-skill-sharing-platform.vercel.app' // Your live Vercel frontend URL
  ],
  credentials: true, // This is required because you are using withCredentials in Axios
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Routes import
import userRouter from "./routes/user.routes.js"
import sessionRouter from "./routes/session.routes.js"
// Routes declaration
app.use("/api/users", userRouter)
app.use("/api/sessions", sessionRouter)
export { app }