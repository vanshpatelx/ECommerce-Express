const sellerModel = require("../models/seller.Model");
const { getImageUrls, deleteImage } = require('../config/ImageUpload');
const productModel = require("../models/product.model");

const creatProduct = async (req, res) => {
    try {
        const seller = req.user.sub;

        const { name, real_price, qty, discounted_rate } = req.body;

        const imageUrls = await getImageUrls(req.files);

        if (!name || !real_price || !qty || !discounted_rate || !seller || !imageUrls) {
            return res.status(400).json({
                message: 'Fill all fields in Product Creat'
            });
        }

        // Is already registered? Check in DB
        const sellerData = await sellerModel.findOne({ user_id: seller });

        if (!sellerData) {
            return res.status(400).json({
                message: 'Seller is Not Exists'
            });
        }

        const newProduct = new productModel({
            image_urls: imageUrls,
            name: name,
            real_price: real_price,
            qty: qty,
            discounted_rate: discounted_rate,
            seller: seller,
            reviews: []
        });

        const product = await newProduct.save();

        // Storing product information in seller DB
        await sellerModel.findOneAndUpdate(
            { user_id: seller },
            { $push: { product_inventory: { product: product._id } } },
            { new: true } // option returns the modified document
        );


        return res.status(200).json({ message: 'Product added successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Adding Product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const seller = req.user.sub;

        const { name, real_price, qty, discounted_rate, deleteImages } = req.body;

        let imageUrls = null;

        // Check if new images are provided
        if (req.files && req.files.length !== 0) {
            imageUrls = await getImageUrls(req.files);
        }

        // Check if no fields are provided for update
        if (!name && !real_price && !qty && !discounted_rate && !seller && !imageUrls && !deleteImages) {
            return res.status(400).json({
                message: 'No fields provided for Product Update'
            });
        }

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: productId });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Check if the seller is the owner of the product
        if (existingProduct.seller.toString() !== seller) {
            return res.status(403).json({
                message: 'Unauthorized access to update product'
            });
        }

        // Update product information
        let counter = 0; // Counter for tracking updated fields

        if (name) {
            existingProduct.name = name;
            counter++;
        }

        if (imageUrls) {
            if (deleteImages && deleteImages.length !== 0) {
                // Convert deleteImages string to an array
                const deleteImagesArray = deleteImages.split(',');

                // Delete images associated with the product from Cloudinary
                let allImagesDeleted = true;

                for (const imageUrl of deleteImagesArray) {
                    const deleteResult = await deleteImage(imageUrl);

                    if (!deleteResult.success) {
                        allImagesDeleted = false;
                        break;
                    }
                }

                // Proceed to delete the product from the database if all images are deleted successfully
                if (allImagesDeleted) {
                    existingProduct.image_urls = existingProduct.image_urls.filter(url => !deleteImages.includes(url));
                } else {
                    return res.status(500).json({ message: 'Error deleting images from Cloudinary' });
                }
            }

            // Add new added images urls to array
            existingProduct.image_urls.push(...imageUrls);
            counter++;
        }

        if (real_price) {
            existingProduct.real_price = real_price;
            counter++;
        }

        if (qty) {
            existingProduct.qty = qty;
            counter++;
        }

        if (discounted_rate) {
            existingProduct.discounted_rate = discounted_rate;
            counter++;
        }

        if (counter === 0) {
            // No fields were updated
            return res.status(200).json({ message: 'No fields updated', existingProduct });
        } else {
            // At least one field was updated
            const updatedProduct = await existingProduct.save();
            return res.status(200).json({ message: 'Product updated successfully', updatedProduct });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Updating Product' });
    }
};




const deleteProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        const seller = req.user.sub;

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: productId });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Check if the seller is the owner of the product
        if (existingProduct.seller.toString() !== seller) {
            return res.status(403).json({
                message: 'Unauthorized access to update product'
            });
        }

        // Delete images associated with the product from Cloudinary
        let allImagesDeleted = true;  // Assume all images are deleted successfully


        for (const imageUrl of existingProduct.image_urls) {
            const deleteResult = await deleteImage(imageUrl);
            console.log(deleteResult);

            if (!deleteResult.success) {
                allImagesDeleted = false;  // Set to false if any image deletion fails
                break;  // Break out of the loop early if any deletion fails
            }
        }

        if (allImagesDeleted) {
            // Delete the product from the database
            await productModel.findByIdAndDelete(productId);

            // Remove the product from the seller's inventory
            await sellerModel.updateOne(
                { user_id: seller },
                { $pull: { product_inventory: { product: productId } } }
            );

            return res.status(200).json({ message: 'Product and associated images deleted successfully' });
        } else {
            return res.status(500).json({ message: 'Error deleting images from Cloudinary' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in deleting Product' });
    }
};

const getProduct = async (req, res) => {
    try {
        // Get Specific Product
        const productId = req.query.productId;

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: productId });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        console.log(existingProduct);
        // Hide Details
        existingProduct.seller = null;

        return res.status(200).json({ message: 'Fetched Specific Product', existingProduct });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in fetching Product' });
    }
};

const getAllProduct = async (req, res) => {
    try {
        // Get All Products
        const allProducts = await productModel.find({});

        // Check if any products exist
        if (!allProducts || allProducts.length === 0) {
            return res.status(404).json({
                message: 'No products found'
            });
        }

        // Hide seller details in each product
        const productsWithoutSeller = allProducts.map(product => {
            return {
                ...product._doc,
                seller: null
            };
        });

        return res.status(200).json({ message: 'Fetched All Products', products: productsWithoutSeller });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in fetching Products' });
    }
};

const getAllProductBySeller = async (req, res) => {
    try {
        const sellerId = req.query.sellerId;

        // Check if the seller exists
        const seller = await sellerModel.findOne({ user_id: sellerId }).populate('product_inventory.product');

        if (!seller) {
            return res.status(400).json({
                message: 'Seller does not exist'
            });
        }

        // Extract product information from the populated field
        const products = seller.product_inventory.map((item) => item.product);

        console.log(products);

        return res.status(200).json({
            message: 'Fetched Specific Seller\'s Products',
            products
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Error in fetching Products'
        });
    }
};


const getAllProductBySearch = async (req, res) => {

};

const getAllReview = async (req, res) => {

};


const createReview = async (req, res) => {

};

const updateReview = async (req, res) => {

};

const deleteReview = async (req, res) => {

};

const getAllReviewForSeller = async (req, res) => {

};

module.exports = {
    creatProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getProduct,
    getAllProductBySearch,
    getAllProductBySeller,
    getAllReview,
    createReview,
    updateReview,
    deleteReview,
    getAllReviewForSeller
}