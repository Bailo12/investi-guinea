import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

// Multer storage configuration (same pattern as kyc.routes.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// ensure to import path for extension
import path from "path";

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
});

// Protect the upload endpoint; clients should send Authorization Bearer token
router.use(protect);

// single file upload field 'file'
router.post("/", upload.single("file"), uploadFile);

export default router;
