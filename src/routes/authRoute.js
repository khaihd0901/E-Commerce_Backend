import express from 'express';
import {protectedRoute} from '../middlewares/authMiddleware.js'
import { signUp, signIn, signOut, sendOTP, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout',protectedRoute, signOut)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);


export default router;