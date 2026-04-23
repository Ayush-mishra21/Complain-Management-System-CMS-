import mongoose from "mongoose";

const Employeschema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
    department:String
});

export default Employeschema;