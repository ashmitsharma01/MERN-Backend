import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },   
    avatar: {
        type: String, //cloudnary
        required: true,
    },
    coverImage: {
        type: String, 
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "video"
        }
    ],
    
    password: {
        type: String, 
        required: [true, "Password required"]
    },
    refreshToken: {
        type: String, 
    },
},{timestamps:true})
 
// this is used to encrypt the password using pre hook
userSchema.pre("save", async function(next) { // pre("save") this line means that function will run before the data will save in db 
    if(!this.isModified("password"))
        return next;
    this.password = await bcrypt.hash(this.password,10)// bcrypt ask for two things one is string to be encrypted and second is how many rounds of encryption we want
    next()
})

//by this we can make custome methods as we want
userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password) // this gives the output as true or false
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
)
}

export const User = mongoose.model("User", userSchema)