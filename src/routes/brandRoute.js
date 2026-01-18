import express from 'express';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'
import {createBrand, getAllBrands, getBrandById, updateBrand, deleteBrand } from '../controllers/brandController.js';

const router = express.Router();
router.post('/create-brand',protectedRoute,isAdmin, createBrand);
router.get('/', getAllBrands);
router.put('/update/:id',protectedRoute,isAdmin, updateBrand);
router.delete('/:id',protectedRoute,isAdmin, deleteBrand);

router.get('/:id', getBrandById);


export default router;