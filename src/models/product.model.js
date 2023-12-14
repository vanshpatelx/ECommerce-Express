const mongoose = require('mongoose');

const reviews = new mongoose.Schema({
    customer: {
        type : mongoose.Types.ObjectId,
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
    available: {
        type : Boolean,
        required: true
    },
    discounted_rate: {
        type : Number,
        required : true
    },
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    reviews:{
        type : [reviews]
    }

}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);