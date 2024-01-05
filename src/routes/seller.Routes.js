const router = require('express').Router();
const sellerCtrl = require('../controllers/seller.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');
const {checkSellerRegistration} = require('../middleware/checkRegistration');


router.get('/seller/inventory', authenticateJWT, checkSellerRegistration, sellerCtrl.getInventory);
router.post('/seller', authenticateJWT, sellerCtrl.addSeller);
router.patch('/seller', authenticateJWT, checkSellerRegistration, sellerCtrl.updateSeller);

module.exports = router;