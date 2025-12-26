import mongoose from 'mongoose'

export const connectDB= async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTION_STR);
        console.log("Connect DB successfully!");
    }catch(err){
        console.log("False to connect DB:", err);
        process.exit(1);
    }
}