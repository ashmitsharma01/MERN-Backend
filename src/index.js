// require('dotenv').config()
import dotenv from "dotenv"// alternat of above written comment
import connectDB from './db/index.js'
import app from './app.js'

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, function(error){
        if(error) console.log("Error Ocuured")
        console.log("App is listening on port", process.env.PORT || 3000)
    })
})
.catch((error) => {
    console.log("DB connection failded!!!", error)
}) 













/*
import express from 'express'
const app = express()

(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR : " , error);
            throw err
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is  listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.error("ERROR: ", error)
        throw err
    }
})() //ifiis
 */