const router = require('express').Router();
const orderCtrl = require('../controllers/order.Ctrl');


router.post('/order', orderCtrl.createOrder);
router.patch('/order', orderCtrl.updateOrder);

router.patch('/order/status', orderCtrl.updateOrderStatus);

router.get('/orders/customer', orderCtrl.getAllOrdersCustomer);
router.get('/orders/customer', orderCtrl.getOrderCustomer);
router.get('/orders/seller', orderCtrl.getAllOrdersSeller);
router.get('/orders/seller', orderCtrl.getOrderSeller);



module.exports = router;