import express from 'express';
const router = express.Router();

import {
    creatProduct,
    updateProduct,
    deleteProduct,
    getAllProduct,
    getProduct,
    getAllProductBySeller,
    getAllReviewOfProduct,
    createReview,
    updateReview,
    deleteReview,
    getAllReviewForSeller
} from '../controllers/product.Ctrl.js';
import { uploadImages } from '../config/ImageUpload.js';
import authenticateJWT from '../middleware/JWTMiddleware.js';
import { checkCustomerRegistration, checkSellerRegistration } from '../middleware/checkRegistration.js';

router.post('/product', authenticateJWT, checkSellerRegistration, uploadImages('files', 5), creatProduct);
router.patch('/product', authenticateJWT, checkSellerRegistration, uploadImages('files', 5), updateProduct);
router.delete('/product', authenticateJWT, checkSellerRegistration, deleteProduct);
router.get('/product', authenticateJWT, getProduct);
router.get('/products', authenticateJWT, getAllProduct);
router.get('/products/seller', authenticateJWT, getAllProductBySeller);
// router.get('/products/search', productCtrl.getAllProductBySearch);

// Review
router.get('/product/review', authenticateJWT, getAllReviewOfProduct);
router.post('/product/review', authenticateJWT, checkCustomerRegistration, createReview);
router.patch('/product/review', authenticateJWT, checkCustomerRegistration, updateReview);
router.delete('/product/review', authenticateJWT, checkCustomerRegistration, deleteReview);
router.get('/product/review/seller', authenticateJWT, checkSellerRegistration, getAllReviewForSeller);

export default router;
