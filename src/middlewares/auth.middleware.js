import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        //console.log("hi divyanshu");
        const token = req.cookies?.accessToken || req.header("Authorisation")?.replace("bearer", "")
        // const token = req.cookie?.accessToken || req.header("Authorisation")?.replace("bearer","")
        //console.log(token);
        if(!token){
            throw new apiError(401,"unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECREAT)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken ")
    
        if(!user){
            throw new apiError(401,"Invalid access token");
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message || "invalid acces token")
    }
})