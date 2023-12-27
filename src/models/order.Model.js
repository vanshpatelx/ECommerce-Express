const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street_name :{
        type : String,
    },
    area : {
        type: String
    },
    details : {
        city : {
            type : String,
        },
        zip : {
            type : Number,
        },
        state : {
            type : String,
        },
        country : {
            type : String,
        }
    }
})


const productDetails = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    Qty: {
        type: Number,
    },
    PPU: {
        type: Number,
    },
    total_price: {
        type: Number,
    }
})

const orderSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
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
    shippingAddress : addressSchema
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);


