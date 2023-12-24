const mongoose = require('mongoose');

const reviews = new mongoose.Schema({
    customer: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Customer'
    },
    msg: {
        type : String   
    },
    star: {
        type : Number,
        max: 5
    }
});

const productSchema = new mongoose.Schema({
    image_urls: {
        type : [String],
        required: true
    },
    name: {
        type : String,
        required : true
    },
    real_price: {
        type : Number,
        required : true
    },
    qty: {
        type : Number,
        required: true
    },
    discounted_rate: {
        type : Number,
        required : true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    reviews:{
        type : [reviews]
    }

}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);