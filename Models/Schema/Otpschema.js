import mongoose from "mongoose";
const Otpschema = mongoose.Schema({
    otp:String,
    camp_id:String
});
export default Otpschema;