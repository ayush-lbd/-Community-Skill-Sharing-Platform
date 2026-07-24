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

// Update or Delete a specific session
// Notice how we can chain different HTTP methods to the same URL parameter!
router.route("/:sessionId")
    .patch(verifyJWT, updateSessionDetails)
    .delete(verifyJWT, deleteSession);

// Update only the session thumbnail (Requires Multer middleware)
router.route("/:sessionId/thumbnail").patch(
    verifyJWT, 
    upload.single("thumbnail"), 
    updateSessionThumbnail
);

// Attendee actions
router.route("/:sessionId/join").post(verifyJWT, joinSession);
router.route("/:sessionId/leave").post(verifyJWT, leaveSession);


export default router;