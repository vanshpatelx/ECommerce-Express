import express from 'express';
const router = express.Router();

import { registerUser,loginUser } from '../controllers/auth.Ctrl.js';

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
