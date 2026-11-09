const multer = require('multer');
const { ApiError } = require('../utils/helpers');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

// Files stay in memory and are streamed straight to Cloudinary, nothing touches disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed.'));
  },
});

module.exports = upload;
