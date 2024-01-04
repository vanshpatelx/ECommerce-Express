const router = require('express').Router();
const sellerCtrl = require('../controllers/seller.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');
const {checkCustomerRegistration, checkSellerRegistration} = require('../middleware/checkRegistration');


router.get('/seller/inventory', authenticateJWT, checkSellerRegistration, sellerCtrl.getInventory);
router.post('/seller', authenticateJWT, sellerCtrl.addSeller);
router.patch('/seller', authenticateJWT, sellerCtrl.updateSeller);

module.exports = router;