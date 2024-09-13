import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})// iska mtlab h validate mtt chlao sidha save krr do

       return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while access and refesh token genration")
    }
}

const registerUser = asyncHandler(  async(req,res) => {
    //get user details from front end
    //validation - not empty
    //check if user already exists
    //check for images and avatar
    //upload avatar and cover image to cloudnary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName, username, email, password} = req.body
    // console.log("email:",email);

    if ([fullName, username,password,email].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exist")
    }

    // console.log(req.files);

    // console.log(req.files) req.files is like req.body but it is used for the files like image, videos...
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path  // this will give the errror of undefined properties cant be read so we will do it using if else

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is needed")
    }


    let avatar =  await uploadOnCloudinary(avatarLocalPath)
    let coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    // console.log("FILE :", avatar);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registerd success")
    )

})

const loginUser = asyncHandler(async (req,res) => {

    const {email, username, password} = req.body
    if(!username || !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user){
        throw new ApiError(404,"user not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"password incorrect");
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser =  User.findById(user._id).select("-password -refreshToken")

  const options = { //by doing this we made our cookiess
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "User logged in success"
    )
  )

}) 

const logoutUser = asyncHandler(async (req,res) => {
    //clear the cookies to logout user
    //reset refresh token
    await User.findOneAndUpdate(
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

    const options = { //by doing this we made our cookiess
        httpOnly: true,
        secure: true,
      }

      return res.status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200), {}, "User Logged out")
    
})


export {
    registerUser,
    loginUser,
    logoutUser
}