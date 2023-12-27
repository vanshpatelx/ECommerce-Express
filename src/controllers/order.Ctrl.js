const customerModel = require("../models/customer.Model");
const productModel = require("../models/product.model");
const { createCharge, handleWebhookEvent } = require("../config/StripePayment");
const orderModel = require("../models/order.Model");


const checkout = async (req, res) => {
    try {
        const customer = req.user.sub;

        // Is already registered? Check in DB
        const customerData = await customerModel.findOne({ user_id: customer });

        if (!customerData) {
            return res.status(400).json({
                message: 'customer is Not Exists'
            });
        }

        const { products, shippingAddress, paymentMethod } = req.body;
        // Products
        // PID
        // Qty

        let trigger = 0;
        let storeProductId = [];
        let total = -1;
        for (let product of products) {
            const existingProduct = await productModel.findById({ _id: product.PID });
            if (existingProduct.qty < product.qty) {
                trigger++;
                storeProductId.push(product.PID);
            }
            let amount = (existingProduct.qty * existingProduct.real_price);
            let discountAmount = (existingProduct.discounted_rate / 100) * existingProduct.real_price;
            total += (amount - discountAmount);
        }

        if (trigger) {
            return res.status(200).json({ message: 'Product Out of Stock !! Or have less amount of Quantity', storeProductId });
        }

        // Create a charge using the payment token and other order details
        const charge = await createCharge(paymentMethod, total, 'Order payment');

        if (charge.status === 'succeeded') {
            // If payment is successful, create an order
            const orderDetails = {
                products,
                shippingAddress,
                paymentDetails: charge,
                customer,
                amount: total
            }
            const orderResponse = await createOrder(orderDetails);

            // Return a success response to the client
            res.status(200).json({ message: 'Order placed successfully', order: orderResponse });
        } else {
            // Return a failure response to the client
            res.status(200).json({ message: 'Payment failed', charge });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in checkout' });
    }
};


const webhook = (req, res) => {
    handleWebhookEvent(req, res);
};



const createOrder = async (orderDetails) => {

    try {
        const { products, shippingAddress, paymentDetails, customer } = orderDetails;

        const formattedProducts = (products);

        const formattedPayment = (paymentDetails);


        const newOrder = new orderModel({
            customer_id: customer,
            amout: amount,
            payment: formattedPayment,
            status: "Placed Order",
            product: formattedProducts,
            shippingAddress: shippingAddress
        })

        await newOrder.save();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error in Adding Product' });
    }

};

const updateOrder = async (req, res) => {

};

const updateOrderStatus = async (req, res) => {

};

const getAllOrdersCustomer = async (req, res) => {

};

const getOrderCustomer = async (req, res) => {

};

const getAllOrdersSeller = async (req, res) => {

};

const getOrderSeller = async (req, res) => {

};

module.exports = {
    webhook,
    checkout,
    createOrder,
    updateOrder,
    updateOrderStatus,
    getAllOrdersCustomer,
    getOrderCustomer,
    getAllOrdersSeller,
    getOrderSeller
}
