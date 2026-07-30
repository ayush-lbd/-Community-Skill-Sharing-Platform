import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app=express()
app.set('trust proxy', 1);
app.use(cors({
  origin: function (origin, callback) {
    // This allows any Vercel origin to connect to your backend
    const allowedOrigins = [
      'http://localhost:5173',
      'https://community-skill-sharing-platform.vercel.app',
      'https://community-skill-sharing-platform-bj49hscuv-ayush-be74.vercel.app/'
    ];
    // Allow if it's in the list, OR if it's a Vercel preview link, OR if there's no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // This is mandatory because your frontend uses withCredentials
}));

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