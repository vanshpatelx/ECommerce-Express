import customerModel from '../models/customer.Model.js';
import userModel from '../models/user.Model.js';
import productModel from '../models/product.model.js';

const addCustomer = async (req, res) => {
    try {
        const user_id = req.user.sub;
        const { user_address, contact_info } = req.body;

        if (!user_address && !contact_info) {
            return res.status(400).json({
                message: 'Fill all fields in Customer registration'
            });
        }

        // Is already registered? Check in DB
        const isAlreadyExists = await customerModel.findOne({ user_id: user_id });
        if (isAlreadyExists) {
            return res.status(400).json({
                message: 'Customer is already registered'
            });
        }

        const Customer = new customerModel({
            user_id: user_id,
            user_address: user_address,
            contact_info: contact_info,
            wishlist: [],
            order_info: []
        });

        const newCustomer = await Customer.save();

        // Update the user document with the customer_id
        const userToUpdate = await userModel.findOne({ _id: user_id, type: 'Customer' });

        if (userToUpdate) {
            // If the user type is 'Customer', update the customer_id
            await userModel.findOneAndUpdate({ _id: user_id }, { customer_id: newCustomer._id });
        } else {
            // Handle the case where the user type is not 'Customer'
            return res.status(500).json({ message: 'Error in Registering Customer || User type is not customer' });
        }

        return res.status(200).json({ message: 'Customer registered successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering Customer' });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { user_address, contact_info } = req.body;

        if (!user_address || !contact_info) {
            return res.status(400).json({
                message: 'Fill all fields in Customer registration'
            });
        }

        if (user_address) {
            req.customerData.user_address = user_address;
        }
        if (contact_info) {
            req.customerData.contact_info = contact_info;
        }

        await req.customerData.save();

        return res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Updating Customer' });
    }
};

const getWishlist = async (req, res) => {
    try {
        const wishlistProducts = req.customerData.wishlist;

        if (wishlistProducts.length === 0) {
            return res.status(200).json({ message: 'Nothing in wishlist' });
        }

        return res.status(200).json({ message: 'wishlist products', wishlistProducts });

    } catch (err) {
        return res.status(500).json({ message: 'Error in getting wishlist products' });
    }
};

const addWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(404).json({
                message: 'Fill all fields'
            });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        req.customerData.wishlist.push(productId);

        await req.customerData.save();

        return res.status(200).json({ message: 'wishlist product added' });

    } catch (err) {
        return res.status(500).json({ message: 'Error in getting wishlist products' });
    }
};

const deleteWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(404).json({
                message: 'Fill all fields'
            });
        }

        // Remove the productId from the wishlist
        req.customerData.wishlist.pull(productId);

        // Save the changes back to the database
        await req.customerData.save();

        return res.status(200).json({ message: 'Wishlist product removed' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in removing wishlist product' });
    }
};

export {
    addCustomer,
    updateCustomer,
    getWishlist,
    addWishlist,
    deleteWishlist
};
