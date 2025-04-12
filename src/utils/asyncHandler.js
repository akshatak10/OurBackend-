const asyncHandler = (requestHandler) => (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err));
}

export {asyncHandler}

// const asyncHandler = (fn) => async (req,res,next) => { // function ko ek aur function mai pass krdiya aur usko async krrdiya
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// } 