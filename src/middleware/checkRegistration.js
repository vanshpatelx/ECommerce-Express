import sellerModel from "../models/seller.Model.js";
import customerModel from "../models/customer.Model.js";

const sellerCache = new Map();
const customerCache = new Map();

const checkSellerRegistration = async (req, res, next) => {
    try {
        const seller = req.user.sub;

        // Check if the seller data is in the cache
        if (sellerCache.has(seller)) {
            req.sellerData = sellerCache.get(seller);
        } else {
            // If not in the cache, query the database
            const isAlreadyExists = await sellerModel.findOne({ user_id: seller });

            if (!isAlreadyExists) {
                return res.status(400).json({
                    message: 'Seller is not registered'
                });
            }

            // Cache the result for future use
            sellerCache.set(seller, isAlreadyExists);

            // Attach the isAlreadyExists data to the request object
            req.sellerData = isAlreadyExists;
        }

        // Continue to the next middleware or route handler
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Seller Registration Check' });
    }
};

const checkCustomerRegistration = async (req, res, next) => {
    try {
        const customer = req.user.sub;

        // Check if the customer data is in the cache
        if (customerCache.has(customer)) {
            req.customerData = customerCache.get(customer);
        } else {
            // If not in the cache, query the database
            const isAlreadyExists = await customerModel.findOne({ user_id: customer });

            if (!isAlreadyExists) {
                return res.status(400).json({
                    message: 'Customer is not registered'
                });
            }

            // Cache the result for future use
            customerCache.set(customer, isAlreadyExists);

            // Attach the isAlreadyExists data to the request object
            req.customerData = isAlreadyExists;
        }

        // Continue to the next middleware or route handler
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Customer Registration Check' });
    }
};

export {
    checkCustomerRegistration,
    checkSellerRegistration
};
