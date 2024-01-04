const customerModel = require("../models/customer.Model");
const productModel = require("../models/product.model");
const { createCharge, handleWebhookEvent } = require("../config/StripePayment");
const orderModel = require("../models/order.Model");
const sellerModel = require("../models/seller.Model");


const checkout = async (req, res) => {
    try {
        const { products, shippingAddress, paymentMethod } = req.body;

        if (!products || !paymentMethod || products.length === 0) {
            return res.status(400).json({ message: 'Fill all required fields in checkout' });
        }

        if (!shippingAddress) {
            shippingAddress = req.customerData.user_address;
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
                customer: req.customerData._id,
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
    let order_id;
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
            order_id = await newOrder.save();

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
            order_id,
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

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: 'Provide Order ID'
            });
        }
        const orderIndex = req.sellerData.order_info.findIndex(order => order.orders.equals(orderId));

        if (orderIndex === -1) {
            return res.status(400).json({ message: 'Order does not exist in the seller\'s order_info' });
        }

        await orderModel.findOneAndUpdate({ _id: orderId }, { status: status });
        res.status(200).json({ message: 'Order Updated successfully', orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in Update Order Status' });
    }
};


const getAllOrdersCustomer = async (req, res) => {
    try {
        const responceData = req.customerData.order_info;
        res.status(200).json({ message: 'Order data getting successfully', responceData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in Get All Orders' });
    }
};

const getOrderCustomer = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Check if orderId exists in the customerData.order_info array
        const orderExists = req.customerData.order_info.some(order => order.equals(orderId));

        if (!orderExists) {
            return res.status(404).json({ message: 'Order not found for the customer' });
        }

        // If orderId exists, search in the order model
        const orderData = await orderModel.findById(orderId);

        if (!orderData) {
            return res.status(404).json({ message: 'Order not found in the order model' });
        }

        res.status(200).json({ message: 'Order data successfully', responseData: orderData });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in getting Order detail' });
    }
};

const getAllOrdersSeller = async (req, res) => {
    try {
        const responceData = req.sellerData.order_info;
        res.status(200).json({ message: 'Order data getting successfully', responceData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in Get All Orders' });
    }
};

const getOrderSeller = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Check if orderId exists in the customerData.order_info array
        const orderExists = req.sellerData.order_info.some(order => order.equals(orderId));

        if (!orderExists) {
            return res.status(404).json({ message: 'Order not found for the seller' });
        }

        // If orderId exists, search in the order model
        const orderData = await orderModel.findById(orderId);

        if (!orderData) {
            return res.status(404).json({ message: 'Order not found in the order model' });
        }

        res.status(200).json({ message: 'Order data successfully', responseData: orderData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in Get All Orders' });
    }

};

module.exports = {
    webhook,
    checkout,
    createOrder,
    updateOrderStatus,
    getAllOrdersCustomer,
    getOrderCustomer,
    getAllOrdersSeller,
    getOrderSeller
}
