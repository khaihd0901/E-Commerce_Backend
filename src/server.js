import express from 'express';
import dotenv from 'dotenv';
import cookies from 'cookie-parser'
import {connectDB} from './libs/db.js';
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import productRoute from './routes/productRoute.js'
import categoryRoute from './routes/categoryRoute.js'
import brandRoute from './routes/brandRoute.js'
import couponRoute from './routes/couponRoute.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

//config dotenv 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
app.use(express.json());
app.use(cookies())
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173", credentials:true}));

app.use(errorHandler);
app.use(notFound);


app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/brand', brandRoute)
app.use('/api/category', categoryRoute)
app.use('/api/product', productRoute)
app.use('/api/coupon', couponRoute)

connectDB().then(()=>{
app.listen(PORT, ()=>{
    console.log("Server running on: ", PORT)
})
})