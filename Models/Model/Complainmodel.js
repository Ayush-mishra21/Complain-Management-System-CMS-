import mongoose from "mongoose";
import Complainschema from "../Schema/Complainschema.js"

const Complainmodel = mongoose.model("complains", Complainschema);

export default Complainmodel;