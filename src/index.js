//import dotenv from "dotenv"
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import connectDB from "./db/index.js"

// dotenv.config({
//     path: ".env"
// })
import { app } from "./app.js"
connectDB()
.then(() => {
    
        const PORT = process.env.PORT || 8000
        app.listen(PORT, () => {
            console.log(` Server is beautifully running on port ${PORT}`);
        });
    
})
.catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
})
