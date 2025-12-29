import express from 'express'
import { createProduct, deleteProduct, updateProduct, getProductById, getProducts, addToWishlist, ratingProduct, uploadProductImages } from '../controllers/productController.js'
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'
import { productImageReSize, uploadPhoto } from '../middlewares/uploadImage.js';

const router = express.Router();

router.post('/create-product',protectedRoute,isAdmin, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/update/:id',protectedRoute,isAdmin, updateProduct);
router.delete('/:id',protectedRoute,isAdmin, deleteProduct);
router.post('/wishlist', protectedRoute, addToWishlist);
router.post('/rating', protectedRoute, ratingProduct);
router.put("/upload/:id", protectedRoute, isAdmin, uploadPhoto.array("images", 5),productImageReSize,uploadProductImages)

export default router;