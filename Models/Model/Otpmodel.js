import mongoose from "mongoose";
import Otpschema from "../Schema/Otpschema.js";

const Otpmodel = mongoose.model("otps", Otpschema);

export default Otpmodel;