import express from 'express'
import { createProduct, deleteProduct, updateProduct, getProductById, getProducts } from '../controllers/productController'

const router = express.Router();

router.post('/create-product', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);