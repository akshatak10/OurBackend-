import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

// ;( async () => {
//     try {
//         const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}}`)
//     } catch (error) {
//         console.log(error);
        
//     }
// })()
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGO DB connection error", error);
        process.exit(1)
    }
}

export default connectDB
