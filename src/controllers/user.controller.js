import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "Hello i am Akshat Rawat"
    // })
    

    /* 
    1. get user details from frontent 
    2. validate user authentication - not empty
    3. check if user already exits check from username and email
    4. check for images and check for avatar
    5. upload them to cloudinary and get it's url, check for avatar
    6. create user object - create entry in Datebase
    7. remove password and refresh token field from response
    8. check for user creation 
    9. return res
    */
    const {email, fullName, userName, password} = res.body
    console.log(email);
    if(
        [email, fullName, userName, password].some((value) => value?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required");
    }
    
    const existedUser = User.findOne({
        $or : [{ userName }, { email }]// or operator
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    // if(!coverImageLocalPath){
    //     throw new ApiError(400, "Avatar file is required");
    // }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = User.findById(User._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "registration of User is unsuccessfull")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {
    registerUser,
}
