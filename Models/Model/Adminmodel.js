import mongoose from "mongoose";
import Adminschema from "../Schema/Adminschema.js";

const Adminmodel = mongoose.model("admins", Adminschema);

export default Adminmodel;