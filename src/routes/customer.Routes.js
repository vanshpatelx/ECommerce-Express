const router = require('express').Router();
const customerCtrl = require('../controllers/customer.Ctrl');



router.post('/customer', customerCtrl.addCustomer);
router.patch('/customer', customerCtrl.updateCustomer);

// wishlist
router.get('/customer/wishlist', customerCtrl.getWishlist);
router.post('/customer/wishlist', customerCtrl.addWishlist);
router.patch('/customer/wishlist', customerCtrl.updateWishlist);
router.delete('/customer/wishlist', customerCtrl.deleteWishlist);


module.exports = router;