import path from "path";

export const uploadFile = (req, res) => {
  // multer stores files info on req.file or req.files
  const files = req.files || (req.file ? [req.file] : []);

  const mapped = files.map((f) => ({
    fieldname: f.fieldname,
    originalname: f.originalname,
    encoding: f.encoding,
    mimetype: f.mimetype,
    size: f.size,
    destination: f.destination ? path.resolve(f.destination) : undefined,
    filename: f.filename,
    path: f.path ? path.resolve(f.path) : undefined,
  }));

  res.status(201).json({ message: "Files uploaded", files: mapped });
};
