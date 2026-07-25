import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkSessionExists = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Attach the found session to the request object!
    req.sessionDoc = session; 
    
    next();
});