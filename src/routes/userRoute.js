import express from 'express'
import { getUsers,getUserById, updateUser, deleteUser,updatePassword, forgotPasswordToken, resetPassword, getWishlist, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getAllOrders, getOrderbyUser, authMe } from '../controllers/userController.js';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js';


const router = express.Router();
router.get('/',protectedRoute,isAdmin,getUsers);
router.get('/me',protectedRoute, authMe);
router.put('/update/:id',protectedRoute, updateUser);
router.delete('/:id',protectedRoute, isAdmin, deleteUser);
router.put('/password',protectedRoute, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/reset-password/:token', resetPassword );
router.post('/wishlist',protectedRoute, getWishlist);
router.post('/cart',protectedRoute, userCart);
router.post('/get-cart',protectedRoute, getUserCart);
router.post('/empty-cart',protectedRoute, emptyCart);
router.post('/apply-coupon',protectedRoute, applyCoupon );
router.post('/create-order',protectedRoute, createOrder );
router.post('/get-order',protectedRoute, getOrderbyUser)
router.get('/get-all-orders',protectedRoute,isAdmin, getAllOrders)

router.get('/:id',protectedRoute, getUserById);



export default router;