import mongoose from 'mongoose'
const mongo_uri  = process.env.MONGO_URI
mongoose.connect(mongo_uri)

const Schema = mongoose.Schema({
    userId: String,
    ambience: String,
    text: String,
    emotion: String,
    keywords:[String],
    summary:String,
},{timestamps:true})

const dbModel = mongoose.model("users",Schema)

export default dbModel

