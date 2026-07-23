import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: { 
            type: String, 
            required: [true, "Name is required"],
            trim: true
        },
        email: { 
            type: String, 
            required: [true, "Email is required"], 
            unique: true,
            lowercase: true,
            trim: true
        },
        password: { 
            type: String, 
            required: [true, "Password is required"] 
        },
        bio: { 
            type: String, 
            default: "" 
        },
        avatar: { 
            type: String, //from cloudinary
            required: [true, "Avatar URL is required"]
        },
        skillsToTeach: [
            { type: String }
        ],
        // Basic Rating System for community trust
        ratings: [
            {
                user: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'User',
                    required: true 
                },
                score: { 
                    type: Number, 
                    required: true,
                    min: 1, 
                    max: 5 
                }
            }
        ],
        refreshToken: {
            type: String
        }
    }, 
    { timestamps: true } // Automatically manages createdAt and updatedAt
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 2. Custom method to check if the entered password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 3. Custom method to generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// 4. Custom method to generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};


//export default mongoose.model("User", userSchema);
export const User = mongoose.model("User", userSchema);