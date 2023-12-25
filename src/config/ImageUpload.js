const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dhtzoyxe0',
  api_key: '284423347846422',
  api_secret: 'WGcl1aWN-nh0XA6axT9dBXFzVzQ',
});

// Set up multer for handling file uploads with streaming
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


// Function to delete an image from Cloudinary based on its public ID
const deleteImage = async (imageUrl) => {
  try {

    // Extract the public ID from the Cloudinary URL
    const publicId = imageUrl.split('/').pop().split('.')[0];

    // Delete the image using the public ID
    const result = await cloudinary.uploader.destroy(publicId);

    console.log(result);

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



module.exports = { uploadImages, getImageUrls, deleteImage };
