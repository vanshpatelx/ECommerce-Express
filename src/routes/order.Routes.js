const router = require('express').Router();
const orderCtrl = require('../controllers/order.Ctrl');
const authenticateJWT = require('../middleware/JWTMiddleware');
const {checkCustomerRegistration, checkSellerRegistration} = require('../middleware/checkRegistration');


router.post('/checkout', authenticateJWT, checkCustomerRegistration, orderCtrl.checkout);
router.post('/webhook', authenticateJWT, orderCtrl.webhook);

router.patch('/order/status', authenticateJWT, checkSellerRegistration, orderCtrl.updateOrderStatus);

router.get('/orders/customer', authenticateJWT, checkCustomerRegistration, orderCtrl.getAllOrdersCustomer);
router.get('/orders/customer', authenticateJWT, checkCustomerRegistration, orderCtrl.getOrderCustomer);
router.get('/orders/seller', authenticateJWT, checkSellerRegistration, orderCtrl.getAllOrdersSeller);
router.get('/orders/seller', authenticateJWT, checkSellerRegistration, orderCtrl.getOrderSeller);



module.exports = router;