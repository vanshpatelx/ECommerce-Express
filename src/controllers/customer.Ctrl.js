const customerModel = require("../models/customer.Model");
const userModel = require("../models/user.Model");

const addCustomer = async (req, res) => {
    try {
        const user_id = req.user.sub;
        const { user_address, contant_info } = req.body;

        if (!user_address || !contant_info) {
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
            contant_info: contant_info,
            wishlist: null,
            order_info: null
        });


        const newCustomer = await Customer.save();


        // Update the user document with the customer_id
        const userToUpdate = await userModel.findOne({ user_id: user_id, type: 'Seller' });

        if (userToUpdate) {
            // If the user type is 'Seller', update the seller_id
            await userModel.findOneAndUpdate({ user_id: user_id }, { customer_id: newCustomer._id });
        } else {
            // Handle the case where the user type is not 'Seller'
            console.log('User is not a Seller. No update performed.');
        }


        return res.status(200).json({ message: 'Customer registered successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Registering Customer' });
    }
};


const updateCustomer = async (req,res) => {
    try {
        const user_id = req.user.sub;
        const { user_address, contant_info } = req.body;

        await customerModel.findOneAndUpdate({
            user_id : user_id
        }, {
            user_address : user_address,
            contant_info : contant_info
        })

        return res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error in Updating Customer' });
    }
};
const getWishlist = async (req,res) => {

};
const addWishlist = async (req,res) => {

};
const updateWishlist = async (req,res) => {

};
const deleteWishlist = async (req,res) => {

};

module.exports = {
    addCustomer,
    updateCustomer,
    getWishlist,
    addWishlist,
    updateWishlist,
    deleteWishlist
}