import express from 'express';
const router = express.Router();

import {
    webhook,
    checkout,
    updateOrderStatus,
    getAllOrdersCustomer,
    getOrderCustomer,
    getAllOrdersSeller,
    getOrderSeller
} from '../controllers/order.Ctrl.js';
import authenticateJWT from '../middleware/JWTMiddleware.js';
import { checkCustomerRegistration, checkSellerRegistration } from '../middleware/checkRegistration.js';

router.post('/checkout', authenticateJWT, checkCustomerRegistration, checkout);
router.post('/webhook', authenticateJWT, webhook);

router.patch('/order/status', authenticateJWT, checkSellerRegistration, updateOrderStatus);

router.get('/orders/customer', authenticateJWT, checkCustomerRegistration, getAllOrdersCustomer);
router.get('/orders/customer', authenticateJWT, checkCustomerRegistration, getOrderCustomer);
router.get('/orders/seller', authenticateJWT, checkSellerRegistration, getAllOrdersSeller);
router.get('/orders/seller', authenticateJWT, checkSellerRegistration, getOrderSeller);

export default router;
