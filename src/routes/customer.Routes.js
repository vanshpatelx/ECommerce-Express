import express from 'express';
const router = express.Router();

import {
    addCustomer,
    updateCustomer,
    getWishlist,
    addWishlist,
    deleteWishlist
} from '../controllers/customer.Ctrl.js';
import authenticateJWT from '../middleware/JWTMiddleware.js';
import { checkCustomerRegistration } from '../middleware/checkRegistration.js';

router.post('/customer', authenticateJWT, addCustomer);
router.patch('/customer', authenticateJWT, checkCustomerRegistration, updateCustomer);

// wishlist
router.get('/customer/wishlist', authenticateJWT, checkCustomerRegistration, getWishlist);
router.post('/customer/wishlist', authenticateJWT, checkCustomerRegistration, addWishlist);
router.delete('/customer/wishlist', authenticateJWT, checkCustomerRegistration, deleteWishlist);

export default router;
