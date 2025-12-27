import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    hashedPassword:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone:{
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    address:{
        type: String,
        lowercase: true,
        trim: true,
    },
    displayName:{
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl:{
        type: String,
    },
    avatarId:{
        type: String
    },
    isAdmin:{
        type: Boolean,
        default: false,
    }
    
},
{
    timestamps: true,
}
);
const User = mongoose.model("User", UserSchema);
export default User;