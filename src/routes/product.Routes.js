const router = require('express').Router();

const productCtrl = require('../controllers/product.Ctrl');
const { uploadImages } = require('../config/ImageUpload');
const authenticateJWT = require('../middleware/JWTMiddleware');
const {checkCustomerRegistration, checkSellerRegistration} = require('../middleware/checkRegistration');


router.post('/product', authenticateJWT, checkSellerRegistration, uploadImages('files', 5), productCtrl.creatProduct);
router.patch('/product', authenticateJWT, checkSellerRegistration, uploadImages('files', 5), productCtrl.updateProduct);
router.delete('/product', authenticateJWT, checkSellerRegistration, productCtrl.deleteProduct);
router.get('/product', authenticateJWT, productCtrl.getProduct);
router.get('/products', authenticateJWT, productCtrl.getAllProduct);
router.get('/products/seller', authenticateJWT, productCtrl.getAllProductBySeller);
// router.get('/products/search', productCtrl.getAllProductBySearch);

// Review
router.get('/product/review', authenticateJWT, productCtrl.getAllReviewOfProduct);
router.post('/product/review', authenticateJWT, checkCustomerRegistration, productCtrl.createReview);
router.patch('/product/review', authenticateJWT, checkCustomerRegistration, productCtrl.updateReview);
router.delete('/product/review', authenticateJWT, checkCustomerRegistration, productCtrl.deleteReview);
router.get('/product/review/seller', authenticateJWT,checkSellerRegistration ,productCtrl.getAllReviewForSeller);


module.exports = router;