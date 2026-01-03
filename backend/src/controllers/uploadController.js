const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp + random number + extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    // Accept images, videos, and audio
    if (file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, and audio allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Upload Handler
const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Construct public URL (Assuming server is reachable at BASE_URL)
        // Adjust protocol/host as needed or handle in frontend
        const fileUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            fileUrl: fileUrl,
            type: req.file.mimetype.split('/')[0]
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

module.exports = {
    upload,
    uploadFile
};
