const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Seller', 'Customer'],
        required: true,
        default : 'Customer'
    },
    seller_id : {
        type : mongoose.Types.ObjectId,
        ref : 'Seller'
    },
    customer_id : {
        type : mongoose.Types.ObjectId,
        ref : 'Customer'
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
