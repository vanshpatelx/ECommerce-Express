const mongoose = require('mongoose');


const productDetails = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },
    Qty: {
        type: Number,
        required: true
    },
    PPU: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    }
})

const orderSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    customer_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    product: {
        type: [productDetails],
        required: true
    },
    amout: {
        type: Number,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Placed Order", "Dispatched", "On the way", "Delivered"],
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);


