import mongoose from "mongoose";
import Employeschema from "../Schema/Employeschema.js";

const Employemodel = mongoose.model("employes", Employeschema);

export default Employemodel;