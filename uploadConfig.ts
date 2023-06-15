import { Request } from "express";
import multer, { diskStorage } from "multer";
import * as path from "path";

// Multer configuration
const storage = diskStorage({
  destination: "./public/images/",
  filename: function (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) {
    callback(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export { upload };
