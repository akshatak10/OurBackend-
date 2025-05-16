import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content || typeof content !== String){
        throw new ApiError(404, "content is required and must be string")
    }

    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    res.status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid userid")
    }

    const tweets = await Tweet.find({owner : userId})
    .sort({createdAt : -1})
    .populate('owner', 'username email');

    res.status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, 'Invalid tweetId');
    }

    if (!content || typeof content !== 'string'){
        throw new ApiError(400, 'Content is required and must be a string');
    }

    const tweet = Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "not authorized to update this tweet")
    }

    tweet.content = content;
    await tweet.save();

    res.status(200)
    .json(new ApiResponse(200, tweet, 'Tweet updated'))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, 'Invalid tweetId');
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Not authorized to delete this tweet');
    }

    await Tweet.findByIdAndDelete(tweetId)

    res.status(200)
    .json(new ApiResponse(200, {}, "tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}