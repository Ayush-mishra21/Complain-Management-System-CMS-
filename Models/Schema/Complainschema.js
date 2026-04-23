import mongoose from "mongoose";

const Complainschema = mongoose.Schema({
    reason:String,
    complaineremail:String,
    complainermobno:String,
    resolveremail:String,
    complaindepartment:String,
    complainername:String,
    complainerdepartment:String,
    complainercourse:String,
    complainersection:String,
    resolvername:String,
    status:String,
    createddate: {
        type: Date,
        default: Date.now
    },
    otp: {
        type:String,
        default: "NotApproved"
    }
});

export default Complainschema;