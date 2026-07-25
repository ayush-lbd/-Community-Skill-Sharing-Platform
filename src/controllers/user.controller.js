import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";    
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    
    const { name, email, password, bio, skillsToTeach } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    let avatarLocalPath = "";
    
    if(req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    let coverImageLocalPath = "";
    
    if(req.files && req.files.coverImage && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    
    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    
    let parsedSkills = [];
    if (skillsToTeach) {
        parsedSkills = typeof skillsToTeach === 'string' ? JSON.parse(skillsToTeach) : skillsToTeach;
    }

    
    const newUser = await User.create({
        name,
        email,
        bio: bio || "",
        skillsToTeach: parsedSkills,
        password,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : ""
    });
    
    
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                { user: loggedInUser, accessToken, refreshToken }, 
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200, 
                    { accessToken, refreshToken: newRefreshToken }, 
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, bio } = req.body;

    if (!name || !email) {
        throw new ApiError(400, "Name and email are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { name, email, bio: bio || "" }
        },
        { new: true, select: "-password -refreshToken" }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.url) {
        throw new ApiError(500, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverImage: coverImage.url } },
        { new: true, select: "-password -refreshToken" }
    );

    return res.status(200).json(
        new ApiResponse(200, user, "Cover image updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar to Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true, select: "-password -refreshToken" }
    );

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
});

const updateSkillsToTeach = asyncHandler(async (req, res) => {
    const { skills } = req.body; // Expecting an array of strings from the frontend

    if (!skills || !Array.isArray(skills)) {
        throw new ApiError(400, "Please provide a valid array of skills");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { skillsToTeach: skills } },
        { new: true, select: "-password -refreshToken" }
    );

    return res.status(200).json(
        new ApiResponse(200, user, "Skills updated successfully")
    );
});

const rateUser = asyncHandler(async (req, res) => {
    
    const { targetUserId } = req.params; 
    
    
    const { score } = req.body; 
    
    const raterId = req.user._id;

    if (!score || score < 1 || score > 5) {
        throw new ApiError(400, "Please provide a valid score between 1 and 5");
    }

    if (targetUserId === raterId.toString()) {
        throw new ApiError(400, "You cannot rate yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new ApiError(404, "The user you are trying to rate does not exist");
    }

    const existingRatingIndex = targetUser.ratings.findIndex(
        (rating) => rating.user.toString() === raterId.toString()
    );

    if (existingRatingIndex !== -1) {
        targetUser.ratings[existingRatingIndex].score = score;
    } else {
        targetUser.ratings.push({ user: raterId, score });
    }

    await targetUser.save({ validateBeforeSave: false });

    
    const totalScore = targetUser.ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = (totalScore / targetUser.ratings.length).toFixed(1);

    
    return res.status(200).json(
        new ApiResponse(
            200, 
            { 
                averageRating: Number(averageRating), 
                totalRatings: targetUser.ratings.length 
            }, 
            "Rating submitted successfully"
        )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { targetUserId } = req.params;

    const user = await User.findById(targetUserId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Calculate the average rating to send to the frontend
    let averageRating = 0;
    if (user.ratings.length > 0) {
        const totalScore = user.ratings.reduce((acc, curr) => acc + curr.score, 0);
        averageRating = (totalScore / user.ratings.length).toFixed(1);
    }

    // Attach the calculated stats to the response data
    const profileData = {
        ...user.toObject(), // Convert Mongoose document to plain JavaScript object
        averageRating: Number(averageRating),
        totalRatings: user.ratings.length
    };

    return res.status(200).json(
        new ApiResponse(200, profileData, "User profile fetched successfully")
    );
});



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverImage,
    updateUserAvatar,
    updateSkillsToTeach,
    rateUser,   
    getUserProfile
};
