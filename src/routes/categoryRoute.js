import express from "express";
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'


const router = express.Router();

router.post('/create-category', protectedRoute, isAdmin, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/update/:id', protectedRoute, isAdmin, updateCategory);
router.delete('/:id', protectedRoute, isAdmin, deleteCategory);

export default router;