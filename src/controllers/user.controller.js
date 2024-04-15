import {asyncHandler} from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})

       return {accessToken, refreshToken}
    } catch (error) {
        throw new apiError(500,"something went wrong while generating access and refresh token! ",error);
    }
}

const registorUser = asyncHandler(async (req,res) => {
    //get user detail from frontend
    //validation - not empty
    //check if user already exist: username and email
    // check for images -> check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in DB
    //remove password and refresh token from response
    //check for user creation
    //return response

    const {username,fullname, email,password} = req.body
    console.log(`${email}`);

    if(fullname === ""){
        throw new apiError(400, "all fields are required")
    }
    if(username === ""){
        throw new apiError(400, "all fields are required")
    }
    if(email === ""){
        throw new apiError(400, "all fields are required")
    }
    if(password === ""){
        throw new apiError(400, "all fields are required")
    }

    const existeduser =  await User.findOne({
        $or: [{username},{email}]
    })
    if(existeduser){
        throw new apiError(409, "your username or email is already exist! ");
    }
    //console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverimageLocalPath = req.files?.coverimage[0]?.path;
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required");
    }
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage && req.files.coverimage.length() > 0)){
        coverimageLocalPath = req.files.coverimage[0].path;
    }
    const Avatar = await uploadOnCloudinary(avatarLocalPath)
    const Coverimage = await uploadOnCloudinary(coverimageLocalPath)
    if(!Avatar){
        throw new apiError(400, "Avatar file is required");
    }
    
    const user = await User.create({
        fullname,
        avatar: Avatar.url,
        coverimage:Coverimage?.url || "",
        email, 
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    )

    if(!createdUser){
        throw new apiError(500,"something went wrong while registoring the user");
    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"User registored")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    //todos
    //req body -> get data
    //username or email
    //find the user
    //password check'
    //access and refresh token
    //send cookies
    const {email, username, password} = req.body
    if(!username && !email){
        throw new apiError(400,"Username or email is required! ");
    }
    console.log(email);
    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apiError(404,"user does not exist! ");
    }

    const ispasswordvalid = await user.ispasswordcorrect(password); 
    
    if(!ispasswordvalid){
        throw new apiError(404,"password is incorrect !");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    } 

    return res.status(200).cookie("accessToken",accessToken, options).cookie("refreshToken",refreshToken, options).json(new apiResponse(200,{
        user:loggedInUser, accessToken, refreshToken
    },"user loggedin successfully"));

})

const logoutUser = asyncHandler(async (req, res) =>{
    console.log("hi bro");
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    } 

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(200,{},"user logged out successfully"));
})

const refreshTokenAccess = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401,"unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECREAT
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"refresh token is expired or used");
        }
    
        const option ={
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res.$orstatus(200)
        .cookie("accessToken",accessToken, option)
        .cookie("refreshToken",newRefreshToken, option)
        .json(
            new apiResponse(
                200, 
                {accessToken, newRefreshToken},"accesstoken refreshed successfully"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message||"invalid refresh Token");
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.User?._id);
    const validpassword = await user.ispasswordcorrect(oldPassword)

    if(!validpassword){
        throw new apiError(400,"invalid Password");
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new apiResponse(200,{},"Password changed successfully !"))

})

const getCurrentUser = asyncHandler(async (req, res) =>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully!");
})

export {registorUser,logoutUser, loginUser, refreshTokenAccess,changeCurrentPassword, getCurrentUser}