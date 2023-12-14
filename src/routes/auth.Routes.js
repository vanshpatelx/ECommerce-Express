const router = require('express').Router();

const authCtrl = require('../controllers/auth.Ctrl');

router.post('/register', authCtrl.registerUser);
router.post('/login', authCtrl.loginUser);

module.exports = router;