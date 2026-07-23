import multer from "multer";

// Configure how and where Multer saves the files
const storage = multer.diskStorage({
    
    // 1. Destination: Where should the file be saved temporarily?
    destination: function (req, file, cb) {
        // cb stands for "callback". The first argument is for errors (null means no error).
        // The second argument is the path to your temp folder.
        cb(null, "./public/temp"); 
    },
    
    // 2. Filename: What should we name the file while it sits in the temp folder?
    filename: function (req, file, cb) {
        // For temporary storage, keeping the original name sent by the user is fine.
        // It will be deleted by fs.unlinkSync shortly after anyway.
        cb(null, file.originalname); 
    }
});

// Export the configured Multer instance so we can use it in our routes
export const upload = multer({ 
    storage: storage 
});