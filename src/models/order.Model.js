import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street_name: {
        type: String,
    },
    area: {
        type: String
    },
    details: {
        city: {
            type: String,
        },
        zip: {
            type: Number,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        }
    }
});

const productDetails = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    Qty: {
        type: Number,
    }
});

const payment = new mongoose.Schema({
    payment_Id: String,
    payment_method: String,
    amount_received: Number
});

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
    payment: {
        type: payment
    },
    totalBill: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Placed Order", "Dispatched", "On the way", "Delivered"],
        required: true
    },
    shippingAddress: addressSchema
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
