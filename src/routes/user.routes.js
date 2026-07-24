import { Router } from "express";
import { 
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
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // Assuming this is your multer file name

const router = Router();


// Register route requires Multer to handle multiple specific file fields
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Viewing a profile can be public so anyone can see it
router.route("/profile/:targetUserId").get(getUserProfile);



// All routes below this point use the verifyJWT middleware

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);

// We use .patch() instead of .post() for updates because we are only updating 
// specific fields, not replacing the entire user document.
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-skills").patch(verifyJWT, updateSkillsToTeach);

// File update routes require both auth middleware and multer single upload middleware
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Rating route requires the target user's ID in the URL params
router.route("/rate/:targetUserId").post(verifyJWT, rateUser);

export default router;