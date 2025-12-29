import express from 'express';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'
import {createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();
router.post('/create-coupon',protectedRoute,isAdmin, createCoupon);
router.get('/',protectedRoute,isAdmin, getAllCoupons);
router.get('/:id', getCouponById);
router.put('/update/:id',protectedRoute,isAdmin, updateCoupon);
router.delete('/:id',protectedRoute,isAdmin, deleteCoupon);

export default router;