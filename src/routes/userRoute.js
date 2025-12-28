import express from 'express'
import { getUsers,getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js'


const router = express.Router();
router.get('/',protectedRoute,isAdmin,getUsers);
router.get('/:id',protectedRoute, getUserById);
router.put('/:id',protectedRoute, updateUser);
router.delete('/:id',protectedRoute, isAdmin, deleteUser);

export default router;