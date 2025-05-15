import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const match = {}
    if(query){
        const regex = RegExp(query, 'i')
        match.$or = [
            {title : regex},
            {description : regex}
        ];
    }

    if(userId){
        if(!isValidObjectId(userId)) {
            throw new ApiError(404, "Invalid User")
        }
        match.owner = mongoose.Types.ObjectId(userId);
    }

    const sort = { [sortBy]: sortType === 'asc' ? 1 : -1}

    const aggregate = Video.aggregate([
        {
            $match: match
        },{
            $sort: sort
        },{
            $lookup: {
                from: 'users',
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: {
                path : "$owner",
                preserveNullAndEmptyArrays: true
            }
        }
    ])

    const options = { page : parseInt(page), limit : parseInt(limit)}
    const result = await Video.aggregatePaginate(aggregate, options)

    res.status(200)
    .json(new ApiResponse(200, result, "Videos fetched"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description, duration } = req.body;
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(400, 'Video file and thumbnail are required');
  }

  // Upload to Cloudinary
  const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path, 'videos');
  const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path, 'thumbnails');

  const video = await Video.create({
    title,
    description,
    duration,
    videoFile: videoUpload.secure_url,
    thumbnail: thumbnailUpload.secure_url,
    owner: req.user.id
  });

  res.status(201).json(new ApiResponse(201, video, 'Video published'));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views : 1 },
        },
        {
            new : true // insure updated document is return instead of original one
        }
    ).populate("owner", "username email");

    if (!video) throw new ApiError(404, 'Video not found');
    
    res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched"));

    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }

    const update = {};
    ["title", "description"].forEach(field => {
        if(req.body[field] != null) update[field] = req.body[field]
    })

    if(req.file){
        const thumb = await uploadOnCloudinary(req.file?.path, 'thumbnails')
        update.thumbnail = thumb.secure_url
    }
        
    const video = await Video.findByIdAndUpdate(videoId, update, {
        new : true
    })
    
    if(!video){
        throw new ApiError(404, "video not found");
    }

    req
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"))
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id");
    }

    await Video.findByIdAndDelete(videoId);

    res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successsfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid video id")
    } 
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, 'Video not found');

    video.isPublished = !video.isPublished;
    await video.save();

    res
    .status(200)
    .json(new ApiResponse(200, null, "published status toggled"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}