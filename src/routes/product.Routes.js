const router = require('express').Router();

const productCtrl = require('../controllers/product.Ctrl');
const { uploadImages } = require('../config/ImageUpload');
const authenticateJWT = require('../middleware/JWTMiddleware');


router.post('/product', authenticateJWT, uploadImages('files', 5), productCtrl.creatProduct);
router.patch('/product', authenticateJWT, uploadImages('files', 5), productCtrl.updateProduct);
router.delete('/product', authenticateJWT, productCtrl.deleteProduct);
router.get('/product', authenticateJWT, productCtrl.getProduct);
router.get('/products', authenticateJWT, productCtrl.getAllProduct);
router.get('/products/seller', authenticateJWT, productCtrl.getAllProductBySeller);
router.get('/products/search', productCtrl.getAllProductBySearch);

// Review
router.get('/product/review', productCtrl.getAllReview);
router.post('/product/review', productCtrl.createReview);
router.patch('/product/review', productCtrl.updateReview);
router.delete('/product/review', productCtrl.deleteReview);
router.get('/product/review/seller', productCtrl.getAllReviewForSeller);


module.exports = router;