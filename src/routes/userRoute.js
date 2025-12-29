import express from 'express'
import { getUsers,getUserById, updateUser, deleteUser,updatePassword } from '../controllers/userController.js';
import {protectedRoute, isAdmin} from '../middlewares/authMiddleware.js';


const router = express.Router();
router.get('/',protectedRoute,isAdmin,getUsers);
router.get('/:id',protectedRoute, getUserById);
router.put('/update/:id',protectedRoute, updateUser);
router.delete('/:id',protectedRoute, isAdmin, deleteUser);
router.put('/password',protectedRoute, updatePassword);

export default router;