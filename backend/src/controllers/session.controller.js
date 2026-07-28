import { Session } from "../models/session.model.js"; // Ensure the path and filename match your setup
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// --- CREATE A NEW SESSION ---
const createSession = asyncHandler(async (req, res) => {
    const { title, description, category, sessionLocation, meetingUrl, physicalLocation, date } = req.body;

    if (!title || !description || !category || !sessionLocation || !date) {
        throw new ApiError(400, "All fields (title, description, category, sessionLocation, date) are required");
    }
    
    if (sessionLocation === "online" && !meetingUrl) {
        throw new ApiError(400, "Meeting URL is required for online sessions");
    }
    
    if (sessionLocation === "in-person" && !physicalLocation) {
        throw new ApiError(400, "A physical address is required for in-person sessions");
    }

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail image is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const session = await Session.create({
        title,
        description,
        category,
        sessionLocation,
        meetingUrl: sessionLocation === "online" ? meetingUrl : undefined,
        physicalLocation: sessionLocation === "in-person" ? physicalLocation : undefined,
        date,
        thumbnail: thumbnail.url,
        host: req.user._id // Attached from verifyJWT middleware
    });

    return res.status(201).json(
        new ApiResponse(201, session, "Session created successfully")
    );
});

// --- GET ALL SESSIONS (WITH PAGINATION & FILTERING) ---
const getAllSessions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", category, status = "Open",hostId } = req.query;

    const pipeline = [];

    // 1. Match based on status (Default is 'Open')
    const matchConditions = {};
    
    
    if (hostId) {
        matchConditions.host = new mongoose.Types.ObjectId(hostId);
        // If the host specifically clicked a filter for status, apply it
        if (status) {
            matchConditions.status = status;
        }
        else {
        // 2. Public Explore View: Strictly enforce "Open" sessions only
        matchConditions.status = status || "Open";
    }
    }

    
    // 2. Search by title if a query is provided
    if (query) {
        matchConditions.title = { $regex: query, $options: "i" };
    }

    // 3. Filter by category if provided
    if (category) {
        matchConditions.category = category;
    }

    pipeline.push({ $match: matchConditions });

    // 4. Populate host details using lookup
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "host",
            foreignField: "_id",
            as: "hostDetails",
            pipeline: [
                { $project: { name: 1, avatar: 1, email: 1 } }
            ]
        }
    });

    // 5. Unwind the hostDetails array
    pipeline.push({
        $addFields: {
            hostDetails: { $first: "$hostDetails" }
        }
    });

    // 6. Sort by date (closest upcoming sessions first)
    pipeline.push({ $sort: { date: 1 } });

    // 7. Apply Pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            totalDocs: "totalSessions",
            docs: "sessions",
        },
    };

    const paginatedSessions = await Session.aggregatePaginate(Session.aggregate(pipeline), options);

    return res.status(200).json(
        new ApiResponse(200, paginatedSessions, "Sessions fetched successfully")
    );
});

// --- GET A SINGLE SESSION BY ID ---
const getSessionById = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
        .populate("host", "name avatar bio email")
        .populate("attendees", "name avatar");

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    return res.status(200).json(
        new ApiResponse(200, session, "Session fetched successfully")
    );
});

// --- UPDATE SESSION DETAILS ---

const updateSessionDetails = asyncHandler(async (req, res) => {
    const { title, description, category, sessionLocation, meetingUrl, physicalLocation, date, status } = req.body;
    
    // 1. Grab the session directly from the middleware
    const session = req.sessionDoc; 

    // 2. Authorization check
    if (session.host.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this session");
    }

    // 3. Update the fields in memory
    session.title = title || session.title;
    session.description = description || session.description;
    session.category = category || session.category;
    if (sessionLocation) {
        if (sessionLocation === "online" && !meetingUrl && session.sessionLocation !== "online") {
             throw new ApiError(400, "Meeting URL is required when switching to an online session");
        }
        // 2. Prevent switching to in-person without an address
        if (sessionLocation === "in-person" && !physicalLocation && session.sessionLocation !== "in-person") {
             throw new ApiError(400, "A physical address is required when switching to an in-person session");
        }
        
        session.sessionLocation = sessionLocation;
        
        // 3. Wipe the unused field depending on what they switched to
        if (sessionLocation === "in-person") {
            session.meetingUrl = undefined;
            session.physicalLocation = physicalLocation || session.physicalLocation;
        } else if (sessionLocation === "online") {
            session.physicalLocation = undefined;
            session.meetingUrl = meetingUrl || session.meetingUrl;
        }
    } else {
        // Allow updating just the URL or Address without changing the type
        if (meetingUrl && session.sessionLocation === "online") session.meetingUrl = meetingUrl;
        if (physicalLocation && session.sessionLocation === "in-person") session.physicalLocation = physicalLocation;
    }
    session.date = date || session.date;
    session.status = status || session.status;

    // 4. Save the document
    await session.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, session, "Session updated successfully")
    );
});

// --- UPDATE SESSION THUMBNAIL ---
const updateSessionThumbnail = asyncHandler(async (req, res) => {
    const session = req.sessionDoc; // From middleware

    if (session.host.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this thumbnail");
    }

    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
        throw new ApiError(500, "Error while uploading thumbnail to Cloudinary");
    }

    session.thumbnail = thumbnail.url;
    await session.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, session, "Thumbnail updated successfully")
    );
});

// --- DELETE SESSION ---
const deleteSession = asyncHandler(async (req, res) => {
    const session = req.sessionDoc; // From middleware

    if (session.host.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this session");
    }

    // Since we already have the ID, we execute the delete
    await Session.findByIdAndDelete(session._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Session deleted successfully")
    );
});

// --- JOIN A SESSION ---
const joinSession = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const session = req.sessionDoc; // From middleware

    if (session.status !== "Open") {
        throw new ApiError(400, `Cannot join. Session is currently marked as ${session.status}`);
    }

    if (session.host.toString() === userId.toString()) {
        throw new ApiError(400, "You are the host of this session");
    }

    if (session.attendees.includes(userId)) {
        throw new ApiError(400, "You have already joined this session");
    }

    session.attendees.push(userId);
    await session.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, session, "Successfully joined the session")
    );
});

// --- LEAVE A SESSION ---
const leaveSession = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const session = req.sessionDoc; // From middleware

    if (!session.attendees.includes(userId)) {
        throw new ApiError(400, "You are not an attendee of this session");
    }

    // Remove the user from the attendees array
    session.attendees = session.attendees.filter(
        (attendeeId) => attendeeId.toString() !== userId.toString()
    );

    await session.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, session, "Successfully left the session")
    );
});

export{
    createSession,
    getAllSessions,
    getSessionById,
    updateSessionDetails,
    updateSessionThumbnail,
    deleteSession,
    joinSession,
    leaveSession
}