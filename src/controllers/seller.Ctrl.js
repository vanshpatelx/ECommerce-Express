import sellerModel from "../models/seller.Model.js";
import userModel from "../models/user.Model.js";

const getInventory = async (req, res) => {
    try {
        // Retrieve product details based on req.sellerData.product_inventory
        const productIds = req.sellerData.product_inventory; // Assuming product_inventory contains an array of product IDs

        // Use the productIds to fetch details from the productModel
        const products = await productModel.find({ _id: { $in: productIds } });

        // Now, 'products' contains details of each product in the seller's inventory
        return res.status(200).json({
            message: 'Seller inventory retrieved successfully',
            inventory: products
        });

    } catch (err) {
        return res.status(500).json({ message: 'Error in Getting Seller Inventory' });
    }
};

const addSeller = async (req, res) => {
    try {
        const user_id = req.user.sub;
        const { seller_address, contact_info } = req.body;

        if (!seller_address || !contact_info) {
            return res.status(400).json({
                message: 'Fill all fields in Seller registration'
            });
        }

        // Is already registered? Check in DB
        const isAlreadyExists = await sellerModel.find({ user_id: user_id });
        if (isAlreadyExists.length != 0) {
            return res.status(400).json({
                message: 'Seller is already registered'
            });
        }

        const Seller = new sellerModel({
            user_id: user_id,
            seller_address: seller_address,
            contact_info: contact_info,
            product_inventory: [],
            order_info: []
        });

        const newSeller = await Seller.save();

        // Update the user document with the seller_id
        const userToUpdate = await userModel.findOne({ _id: user_id, type: 'Seller' });

        if (userToUpdate) {
            // If the user type is 'Seller', update the seller_id
            await userModel.findOneAndUpdate({ _id: user_id }, { seller_id: newSeller._id });
        } else {
            // Handle the case where the user type is not 'Seller'
            return res.status(500).json({ message: 'Error in Registering Seller || User type is not Seller' });
        }

        return res.status(200).json({ message: 'Seller registered successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering Seller' });
    }
};

const updateSeller = async (req, res) => {
    try {
        const { seller_address, contact_info } = req.body;

        if (!seller_address || !contact_info) {
            return res.status(400).json({
                message: 'Fill all fields in Seller registration'
            });
        }

        if (seller_address) {
            req.sellerData.seller_address = seller_address;
        }
        if (contact_info) {
            req.sellerData.contact_info = contact_info;
        }

        await req.sellerData.save();
        // await sellerModel.findOneAndUpdate({
        //     user_id: user_id
        // }, {
        //     seller_address: seller_address,
        //     contact_info: contact_info
        // })

        return res.status(200).json({ message: 'Seller updated successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Updating Seller' });
    }
};

export {
    getInventory,
    addSeller,
    updateSeller
};
