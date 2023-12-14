 const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street_name :{
        type : String,
        required: true
    },
    area : {
        type: String
    },
    details : {
        city : {
            type : String,
            required: true
        },
        zip : {
            type : Number,
            required: true
        },
        state : {
            type : String,
            required: true
        },
        country : {
            type : String,
            required: true
        }
    }
})

const contactSchema = new mongoose.Schema({
    num : {
        required : true,
        contry_code : {
            type : String,
            required: true
        },
        number : {
            type : String,
            required: true
        }
    },
    extra_num : {
        contry_code : {
            type : String,
            required: true
        },
        number : {
            type : String,
            required: true
        }
    },
    extra_email : {
        type : String
    }
});


const inventorySchema = new mongoose.Schema({
    product : {
        type : mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    Qty : {
        type : Number,
        required: true
    }
});


const order = new mongoose.Schema({
    product : {
        type : mongoose.Types.ObjectId,
        ref : 'Product',
        required: true
    }
});


const sellerSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required: true
    },
    seller_address : {
        type : addressSchema,
        required : true
    },
    contant_info : {
        type : contactSchema,
        required: true
    },
    product_inventory : {
        type : [inventorySchema]
    },
    order_info :{
        type : [order]    
    }
},  {timestamps: true});

module.exports = mongoose.model('Seller', sellerSchema);


