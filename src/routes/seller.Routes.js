import express from 'express';
const router = express.Router();

import {
    getInventory,
    addSeller,
    updateSeller
} from '../controllers/seller.Ctrl.js';
import authenticateJWT from '../middleware/JWTMiddleware.js';
import { checkSellerRegistration } from '../middleware/checkRegistration.js';

router.get('/seller/inventory', authenticateJWT, checkSellerRegistration, getInventory);
router.post('/seller', authenticateJWT, addSeller);
router.patch('/seller', authenticateJWT, checkSellerRegistration, updateSeller);

export default router;
