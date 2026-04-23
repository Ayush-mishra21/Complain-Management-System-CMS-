import mongoose from "mongoose";

const Adminschema = mongoose.Schema({
    name:String,
    email:String,
    password:String
});

export default Adminschema;