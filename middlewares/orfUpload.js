const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'orf');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const orfFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only images (JPG, PNG, WEBP) and PDFs are allowed.'));
};

const orfDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const userId = String(req.user?._id || req.auth?.user?._id || 'unknown').replace(/[^a-zA-Z0-9]/g, '');
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^0-9a-z.]/g, '') || '.bin';
    cb(null, `orf_${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${safeExt}`);
  }
});

const orfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const orfDiskUpload = multer({
  storage: orfDiskStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: orfFileFilter
});

module.exports = { orfUpload, orfDiskUpload };
