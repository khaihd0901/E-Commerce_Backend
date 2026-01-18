import express from 'express';
import {protectedRoute} from '../middlewares/authMiddleware.js'
import { signUp, signIn, signOut, sendOTP, verifyOTP, authMe, adminLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.get('/me',protectedRoute, authMe);
router.post('/signin', signIn);
router.post('/admin-login', adminLogin);
router.post('/signout', signOut)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);


export default router;