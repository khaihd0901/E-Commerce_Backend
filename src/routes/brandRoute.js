import express from 'express';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'
import {createBrand, getAllBrands, getBrandById, updateBrand, deleteBrand } from '../controllers/brandController.js';

const router = express.Router();
router.post('/create-brand',protectedRoute,isAdmin, createBrand);
router.get('/', getAllBrands);
router.get('/:id', getBrandById);
router.put('/update/:id',protectedRoute,isAdmin, updateBrand);
router.delete('/:id',protectedRoute,isAdmin, deleteBrand);

export default router;