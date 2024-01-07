import mongoose from 'mongoose';

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
        default: 'Customer'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    }
}, { timestamps: true });

// Indexes for frequently queried fields
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
