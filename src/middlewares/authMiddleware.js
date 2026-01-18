import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protectedRoute = (req, res, next) =>{
    try {
        //get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1];

        
        console.log(authHeader)
        //verify token
        if(!token){
            return res.status(401).json({message: "Token not found !!!"});
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err,decodedUser)=>{
            if(err){
                console.error(err)
                return res.status(403).json({message: "Access token expired or invalid"})
            }
        //get user
            const user = await User.findById(decodedUser.userId).select('-hashedPassword');
            if(!user){
                return res.status(404).json({message: "User not exit"})
            }

        //return user in req
        req.user = user;
        next();
        })
    } catch (error) {
        console.log("error when verify jwt in authMiddleware", error)
        return res.status(500).json({message: "system error"})
    }
}
export const isAdmin = (req, res, next) =>{
    const user = req.user;
    if(user.isAdmin === false){
        return res.status(403).json({message: "You are not admin, access denied"})
    }else{
        next();
    }
}