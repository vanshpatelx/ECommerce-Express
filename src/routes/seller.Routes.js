const router = require('express').Router();
const sellerCtrl = require('../controllers/seller.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');


router.get('/seller/inventory', sellerCtrl.getInventory);
router.post('/seller', authenticateJWT, sellerCtrl.addSeller);
router.patch('/seller', authenticateJWT, sellerCtrl.updateSeller);

module.exports = router;