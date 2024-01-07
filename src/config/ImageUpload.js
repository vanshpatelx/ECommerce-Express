import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CloudName,
    api_key: process.env.APIKey,
    api_secret: process.env.APISecret,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'product-images',
    allowedFormats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
});

const upload = multer({ storage: storage });

const uploadImages = (fieldName, maxCount) => {
    return upload.array(fieldName, maxCount);
};

const getImageUrls = (files) => {
    return files.map((file) => file.path);
};

const deleteImage = async (imageUrl) => {
    try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return { success: true, message: 'Image deleted successfully' };
        } else {
            return { success: false, message: 'Failed to delete image from Cloudinary' };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error deleting image from Cloudinary' };
    }
};

export { uploadImages, getImageUrls, deleteImage };
