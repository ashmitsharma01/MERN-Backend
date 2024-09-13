import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"


const connectDB = async() => {
    try{
      const connectionInsatance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log( `\n MongooDB connected !! DBHost: ${connectionInsatance.connection.host}`);
    }catch(error){
        console.log("MongoDB CONNECTION FAILED ", error);
        process.exit(1)
    }
}


export default connectDB