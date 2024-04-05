import mongoose , {Schema} from "mongoose";
import  Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true
        },
        email :{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true
        },        
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,  //cloudnary url
            required:true,
        },
        coverimage:{
            type:String, //cloudnary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video"  
            }
        ],
        password:{
            type:String,
            required:[true,"Password is required! "]
        },
        refreshToken:{
            type:String,
        }
    },{
        timestamps:true
    }
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 8)
    next()
})

userSchema.methods.ispasswordcorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return Jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCES_TOKEN_SECREAT,
    {
        expiresIn: process.env.ACCES_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return Jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECREAT,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
        )
}

export const User = mongoose.model("User",userSchema);