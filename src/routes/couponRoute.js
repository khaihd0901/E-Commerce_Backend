import express from 'express';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'
import {createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();
router.post('/create-coupon',protectedRoute,isAdmin, createCoupon);
router.get('/',protectedRoute,isAdmin, getAllCoupons);
router.put('/update/:id',protectedRoute,isAdmin, updateCoupon);
router.delete('/:id',protectedRoute,isAdmin, deleteCoupon);

router.get('/:id', getCouponById);


export default router;