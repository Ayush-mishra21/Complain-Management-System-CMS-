import mongoose from "mongoose";
import Studentschema from "../Schema/Studentschema.js";

const Studentmodel = mongoose.model("students", Studentschema);

export default Studentmodel;