import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {subscriberId} = req.user._id

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "invalid channel id")
    }
    if(channelId === subscriberId){
        throw new ApiError(400, "you can not subscribe to youself")
    }

    const existing = await Subscription.findOne({subscriber : subscriberId, channel : channelId})
    if(existing){
        await existing.remove();
        res.status(200)
        .json(new ApiResponse(200, {subscription : false}, "Unsubscribed successfullt"))
    }else{
        await Subscription.create({subscriber : subscriberId, channel : channelId})
        res.status(200)
        .json(new ApiResponse(200, {subscription : true}, "subscribed successfullt"))
    }
    // TODO: toggle subscription
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    const subs = await Subscription.find({subscriber : subscriberId}).poppulate("channel", "username email")

    const channels = subs.map(s => s.channel)

    res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    const subs = await Subscription.find({channel : channelId}).populate("subscriber", "username email")

    const subscribers = subs.map(s => s.subscriber)

    res
    .staus(200)
    .json(new ApiResponse(200, subscribers, "Channel subscribers fetched"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}