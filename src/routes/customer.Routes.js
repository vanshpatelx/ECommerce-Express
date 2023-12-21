const router = require('express').Router();
const customerCtrl = require('../controllers/customer.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');



router.post('/customer', authenticateJWT, customerCtrl.addCustomer);
router.patch('/customer',authenticateJWT, customerCtrl.updateCustomer);

// wishlist
router.get('/customer/wishlist', customerCtrl.getWishlist);
router.post('/customer/wishlist', customerCtrl.addWishlist);
router.patch('/customer/wishlist', customerCtrl.updateWishlist);
router.delete('/customer/wishlist', customerCtrl.deleteWishlist);


module.exports = router;