import express from 'express';
import {protectedRoute} from '../middlewares/authMiddleware.js'
import { signUp, signIn, signOut, sendOTP, verifyOTP, adminLogin, refreshToken, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/verify-email/:token',verifyEmail)
router.post('/signin', signIn);
router.post('/admin-login', adminLogin);
router.post('/signout', signOut)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/refresh-token', refreshToken);



export default router;