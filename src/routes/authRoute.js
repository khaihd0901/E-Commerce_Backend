import express from 'express';
import {protectedRoute} from '../middlewares/authMiddleware.js'
import { signUp, signIn, signOut } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout',protectedRoute, signOut)

export default router;