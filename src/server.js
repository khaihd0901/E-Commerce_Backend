import express from 'express';
import dotenv from 'dotenv';
import cookies from 'cookie-parser'
import {connectDB} from './libs/db.js';
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import productRoute from './routes/productRoute.js'
import categoryRoute from './routes/categoryRoute.js'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middlewares
app.use(express.json());
app.use(cookies())


app.use('/api/auth', authRoute)

app.use('/api/user', userRoute)

app.use('/api/category', categoryRoute)

app.use('/api/product', productRoute)

connectDB().then(()=>{
app.listen(PORT, ()=>{
    console.log("Server running on: ", PORT)
})
})