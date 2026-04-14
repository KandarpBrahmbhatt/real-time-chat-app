// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // FIXED
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload  = multer({storage})

// export default upload

import multer from "multer";

// STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// FILE FILTER (IMPORTANT)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed!"), false);
  }
};

// LIMIT (OPTIONAL BUT IMPORTANT)
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB max (for videos)
};

// FINAL UPLOAD
const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;