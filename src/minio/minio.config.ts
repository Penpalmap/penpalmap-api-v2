import multer, { memoryStorage } from "multer";

// Multer configuration
const upload = multer({ storage: memoryStorage() });

export { upload };
