const customerModel = require("../models/customer.Model");
const productModel = require("../models/product.model");
const { createCharge, handleWebhookEvent } = require("../config/StripePayment");
const orderModel = require("../models/order.Model");


const checkout = async (req, res) => {
    try {
        const customer = req.user.sub;
        const customerData = await customerModel.findOne({ user_id: customer });

        if (!customerData) {
            return res.status(400).json({ message: 'Customer does not exist' });
        }

        const { products, shippingAddress, paymentMethod } = req.body;

        if (!products || !paymentMethod || products.length === 0) {
            return res.status(400).json({ message: 'Fill all required fields in checkout' });
        }

        if (!shippingAddress) {
            shippingAddress = customerData.user_address;
        }

        let storeProductId = [];
        let total = 0;

        for (let product of products) {
            const existingProduct = await productModel.findById(product.PID);

            if (!existingProduct || existingProduct.qty < product.qty) {
                storeProductId.push(product.PID);
            }

            let amount = existingProduct.qty * existingProduct.real_price;
            let discountAmount = (existingProduct.discounted_rate / 100) * existingProduct.real_price;
            total += amount - discountAmount;
        }

        if (storeProductId.length > 0) {
            return res.status(200).json({
                message: 'Some products are out of stock or have insufficient quantity',
                storeProductId
            });
        }

        const charge = await createCharge(paymentMethod, total, 'Order payment');

        if (charge.status === 'succeeded') {
            const orderDetails = {
                products,
                shippingAddress,
                paymentDetails: charge,
                customer,
                total
            };

            const orderResponse = await createOrder(orderDetails);

            res.status(200).json({ message: 'Order placed successfully', order: orderResponse });
        } else {
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
        const { products, shippingAddress, paymentDetails, customer, total } = orderDetails;

        const formattedProducts = products.map(product => ({
            product_id: product.PID,
            quantity: product.qty
        }));

        const formattedPayment = {
            payment_Id: paymentDetails.id,
            payment_method: paymentDetails.payment_method,
            amount_received: paymentDetails.amount_captured,
        };

        const newOrder = new orderModel({
            customer_id: customer,
            totalBill: total,
            payment: formattedPayment,
            status: "Placed Order",
            product: formattedProducts,
            shippingAddress: shippingAddress
        });

        console.log(newOrder);

        if (paymentDetails.paid == true && paymentDetails.refunded == false) {
            await newOrder.save();

            // Decreasing products after payment done
            for (let product of products) {
                const existingProduct = await productModel.findById({ _id: product.PID });
                if (existingProduct.qty >= product.qty) {
                    existingProduct.qty -= product.qty;
                }
                await existingProduct.save();
            }
        } else {
            console.error("Error in Payment");
        }

        const orderRes = {
            payment: {
                id: paymentDetails.id,
                amount: paymentDetails.amount_captured,
            },
            status: "Placed Order",
            shippingAddress: shippingAddress
        }
        return orderRes;
    } catch (err) {
        console.error(err);
        throw err;
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
