const router = require('express').Router();
const customerCtrl = require('../controllers/customer.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');
const {checkCustomerRegistration} = require('../middleware/checkRegistration');


router.post('/customer', authenticateJWT, customerCtrl.addCustomer);
router.patch('/customer',authenticateJWT, customerCtrl.updateCustomer);

// wishlist
router.get('/customer/wishlist', authenticateJWT , checkCustomerRegistration, customerCtrl.getWishlist);
router.post('/customer/wishlist', authenticateJWT, checkCustomerRegistration, customerCtrl.addWishlist);
router.delete('/customer/wishlist', authenticateJWT, checkCustomerRegistration, customerCtrl.deleteWishlist);


module.exports = router;