const router = require('express').Router();

const productCtrl = require('../controllers/product.Ctrl');


router.post('/product', productCtrl.creatProduct);
router.patch('/product', productCtrl.updateProduct);
router.delete('/product', productCtrl.deleteProduct);
router.get('/product', productCtrl.getProduct);
router.get('/products', productCtrl.getAllProduct);
router.get('/products/seller', productCtrl.getAllProductBySeller);
router.get('/products/search', productCtrl.getAllProductBySearch);

// Review
router.get('/product/review', productCtrl.getAllReview);
router.post('/product/review', productCtrl.createReview);
router.patch('/product/review', productCtrl.updateReview);
router.delete('/product/review', productCtrl.deleteReview);
router.get('/product/review/seller', productCtrl.getAllReviewForSeller);


module.exports = router;