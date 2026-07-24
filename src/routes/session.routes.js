import { Router } from "express";
import {
    createSession,
    getAllSessions,
    getSessionById,
    updateSessionDetails,
    updateSessionThumbnail,
    deleteSession,
    joinSession,
    leaveSession
} from "../controllers/session.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // Assuming standard multer export
import { checkSessionExists } from "../middlewares/session.middleware.js";

const router = Router();

// Anyone visiting the site can view the list of sessions or click on one to see its details.

router.route("/").get(getAllSessions);
router.route("/:sessionId").get(getSessionById);



// All routes below require the user to be logged in.
// We apply verifyJWT directly to the routes that need it.

// Create a new session (Requires a thumbnail upload)
router.route("/").post(
    verifyJWT, 
    upload.single("thumbnail"), 
    createSession
);

// Add the middleware to the chain for updating and deleting
router.route("/:sessionId")
    .patch(verifyJWT, checkSessionExists, updateSessionDetails)
    .delete(verifyJWT, checkSessionExists, deleteSession);

// Add the middleware for the thumbnail update
router.route("/:sessionId/thumbnail").patch(
    verifyJWT, 
    checkSessionExists, 
    upload.single("thumbnail"), 
    updateSessionThumbnail
);

// Add the middleware for attendee actions
router.route("/:sessionId/join").post(verifyJWT, checkSessionExists, joinSession);
router.route("/:sessionId/leave").post(verifyJWT, checkSessionExists, leaveSession);


export default router;