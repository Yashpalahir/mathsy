import { cloudinary } from '../utils/cloudinary.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Determine folder and resource_type based on mimetype
        let folder = 'mathsy_uploads';
        let resource_type = 'auto';

        if (req.file.mimetype.startsWith('image/')) {
            folder = 'mathsy_images';
            resource_type = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            folder = 'mathsy_videos';
            resource_type = 'video';
        } else if (req.file.mimetype === 'application/pdf') {
            folder = 'mathsy_docs';
            resource_type = 'raw';
        }

        const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const result = await uploadPromise;

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
};
