import {asyncHandler} from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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

    const existeduser = User.findOne({
        $or: [{username},{email}]
    })
    if(existeduser){
        throw new apiError(409, "your username or email is already exist! ");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverimage = await uploadOnCloudinary(coverimageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken" 
    )

    if(!createdUser){
        throw new apiError(500,"something went wrong while registoring the user");
    }

    return res.status(201).json(
        new apiResponse(200,createdUser,"User registored successfuly")
    )
})

export {registorUser}