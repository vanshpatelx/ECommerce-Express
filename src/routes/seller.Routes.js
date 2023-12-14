const router = require('express').Router();
const sellerCtrl = require('../controllers/seller.Ctrl');

router.get('/seller/inventory', sellerCtrl.getInventory);
router.post('/seller', sellerCtrl.addSeller);
router.patch('/seller', sellerCtrl.updateSeller);

module.exports = router;