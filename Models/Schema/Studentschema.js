import mongoose from "mongoose";

const Studentschema = mongoose.Schema({
    name:String,
    email:String,
    password:String
});

export default Studentschema;