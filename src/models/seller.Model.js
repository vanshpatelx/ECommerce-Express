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

const contactSchema = new mongoose.Schema({
    num : {
        contry_code : {
            type : String,
        },
        number : {
            type : String,
        }
    },
    extra_num : {
        contry_code : {
            type : String,
        },
        number : {
            type : String,
        }
    },
    extra_email : {
        type : String
    }
});


const inventorySchema = new mongoose.Schema({
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }
});


const order = new mongoose.Schema({
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product',
    }
});


const sellerSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true
    },
    seller_address : {
        type : addressSchema,
        required : true
    },
    contact_info : {
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


