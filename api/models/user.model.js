import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar:{
        type: String,
        default:"https://e7.pngegg.com/pngimages/803/368/png-clipart-computer-icons-user-profile-avatar-heroes-silhouette-thumbnail.png"
    }
}, { timestamps: true });

const User = mongoose.model("users",userSchema)

export default User;