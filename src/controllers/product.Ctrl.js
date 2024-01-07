import sellerModel from "../models/seller.Model.js";
import { getImageUrls, deleteImage } from '../config/ImageUpload.js';
import productModel from "../models/product.model.js";

const creatProduct = async (req, res) => {
    try {
        const { name, real_price, qty, discounted_rate } = req.body;
        const imageUrls = await getImageUrls(req.files);
        if (!name || !real_price || !qty || !discounted_rate || !imageUrls) {
            return res.status(400).json({
                message: 'Fill all fields in Product Create'
            });
        }

        const newProduct = new productModel({
            image_urls: imageUrls,
            name: name,
            real_price: real_price,
            qty: qty,
            discounted_rate: discounted_rate,
            seller: req.user.sub,
            reviews: []
        });

        const product = await newProduct.save();

        // Storing product information in seller DB
        await sellerModel.findOneAndUpdate(
            { user_id: req.user.sub },
            { $push: { product_inventory: { product: product._id } } },
            { new: true } // option returns the modified document
        );

        return res.status(200).json({ message: 'Product added successfully', productId : product._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Adding Product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        
        const { name, real_price, qty, discounted_rate, deleteImages } = req.body;
        
        let imageUrls = null;
        // Check if new images are provided
        if (req.files && req.files.length !== 0) {
            imageUrls = await getImageUrls(req.files);
        }

        // Check if no fields are provided for update
        if (!name && !real_price && !qty && !discounted_rate && !imageUrls && !deleteImages) {
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
        if (existingProduct.seller.toString() !== req.user.sub) {
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

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: productId });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Check if the seller is the owner of the product
        if (existingProduct.seller.toString() !== req.user.sub) {
            return res.status(403).json({
                message: 'Unauthorized access to update product'
            });
        }

        // Delete images associated with the product from Cloudinary
        let allImagesDeleted = true;  // Assume all images are deleted successfully

        for (const imageUrl of existingProduct.image_urls) {
            const deleteResult = await deleteImage(imageUrl);

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
                { user_id: req.user.sub },
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

const getAllReviewOfProduct = async (req, res) => {
    try {
        // Get product Id from request parameters or query
        const productId = req.params.productId || req.query.productId;

        // Check if the product exists and populate all data, including reviews
        const product = await productModel.findById(productId)

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const formattedReviews = product.reviews.map((review) => ({
            _id: review._id,
            msg: review.msg,
            star: review.star
        }));

        return res.status(200).json({
            message: 'Fetched All Reviews for Specific Product',
            reviews: formattedReviews
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Error in fetching Reviews'
        });
    }
};

const createReview = async (req, res) => {
    try {
        // Get Information from Body
        const product = req.query.productId
        const { msg, star } = req.body;

        if (!product || !msg || !star) {
            return res.status(400).json({
                message: 'Fill all fields in Review Add'
            });
        }

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: product });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Add review
        const newReview = {
            customer: req.user.sub,
            msg: msg,
            star: Number(star)
        }

        existingProduct.reviews.push(newReview);

        await existingProduct.save();

        existingProduct.seller = null;
        return res.status(200).json({ message: 'Review Added successfully', existingProduct });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in adding Review' });
    }
};

const updateReview = async (req, res) => {
    try {
        // Get Information from Body
        const product = req.query.productId;
        const reviewId = req.query.reviewId;
        const { msg, star } = req.body;

        if (!product || !reviewId || !msg || !star) {
            return res.status(400).json({
                message: 'Fill all fields in Review Update'
            });
        }

        // Check if the product exists
        const existingProduct = await productModel.findById({ _id: product });
        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Find the review by reviewId
        const reviewToUpdate = existingProduct.reviews.find(
            (review) => review._id.toString() === reviewId
        );

        // Check if the review exists
        if (!reviewToUpdate) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        // Check if the review belongs to the current customer
        if (reviewToUpdate.customer.toString() !== req.user.sub) {
            return res.status(403).json({
                message: 'You are not authorized to update this review'
            });
        }

        // Update review
        reviewToUpdate.msg = msg;
        reviewToUpdate.star = Number(star);

        await existingProduct.save();
        existingProduct.seller = null;
        return res.status(200).json({ message: 'Review Updated successfully', existingProduct });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in updating Review' });
    }
};

const deleteReview = async (req, res) => {
    try {
        // Get Information from Body
        const product = req.query.productId;
        const reviewId = req.query.reviewId;

        if (!product || !reviewId) {
            return res.status(400).json({
                message: 'Fill all fields in Review Delete'
            });
        }

        // Check if the product exists and delete the review
        const existingProduct = await productModel.findByIdAndUpdate(
            product,
            {
                $pull: {
                    reviews: {
                        _id: reviewId,
                        customer: req.user.sub
                    }
                }
            },
            { new: true }
        );

        if (!existingProduct) {
            return res.status(404).json({
                message: 'Product not found or Review not found'
            });
        }

        return res.status(200).json({ message: 'Review Deleted successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in deleting Review' });
    }
};

const getAllReviewForSeller = async (req, res) => {
    try {
        // Extract product information from the populated field
        const products = req.sellerData.product_inventory.map((item) => item.product);

        // Collect all reviews for the seller'
        const allReviews = [];
        products.forEach((product) => {
            if (product.reviews.toString && product.reviews.length > 0) {
                allReviews.push(...product.reviews);
            }
        });

        return res.status(200).json({
            message: 'Fetched All Reviews for Specific Seller',
            reviews: allReviews
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Error in fetching Reviews'
        });
    }
};

export {
    creatProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getProduct,
    getAllProductBySeller,
    getAllReviewOfProduct,
    createReview,
    updateReview,
    deleteReview,
    getAllReviewForSeller
};
