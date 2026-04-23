import express, { text } from "express";
import mongoose from "mongoose";
import Employemodel from "./Models/Model/Employemodel.js";
import Studentmodel from "./Models/Model/Studentmodel.js";
import expressLayouts from "express-ejs-layouts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { memo } from "react";
import Complainmodel from "./Models/Model/Complainmodel.js";
import nodemailer from "nodemailer";
// import { MdSubject } from "react-icons/md";
import Otpmodel from "./Models/Model/Otpmodel.js";
import Adminmodel from "./Models/Model/Adminmodel.js";
import dotenv from "dotenv";


const app = express();
app.use(cookieParser());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ayushmishra0003@gmail.com",
      pass: "pilc eajc tdxw liwp" 
    }
});

app.set("view engine", "ejs");
app.set("views", "./views");
// app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layout");

// const url = "mongodb://localhost:27017/Complain_system";
// const connectDB = async () => {
//     try {
//         await mongoose.connect(url);
//         console.log("MongoDB connected successfully");
//     } catch (error) {
//         console.log("MongoDB connection failed", error);
//     }
// };
// connectDB();

const url = "mongodb+srv://ayushmishra0003_db_user:Ayush@123@cluster0.0nk49ns.mongodb.net/?appName=Cluster0";

mongoose.connect(url)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

const JWT_SECRET = "cms_secret_key_123";
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("server_error");
});

app.post("/signup", async (req, res) => {
    const people = req.body;

    try {
        let existingUser;

        existingUser = await Employemodel.findOne({ email: people.email });

            if (existingUser) {
                return res.render("first_page", {
                    message: "Already Email is Registered"
                });
            }

             existingUser = await Studentmodel.findOne({ email: people.email });

            if (existingUser) {
                return res.render("first_page", {
                    message: "Already Email is Registered"
                });
            }

            existingUser = await Adminmodel.findOne({ email: people.email });

            if (existingUser) {
                return res.render("first_page", {
                    message: "Already Email is Registered"
                });
            }

            if(people.refno !== "for_test123"){
                 return res.render("first_page", {
                message: "Wrong Secret Reference Key Connect With Collage/School."
            });
            }


        if (people.department) {

            const hashedPassword = await bcrypt.hash(people.password, 10);

            await Employemodel.create({
                name: people.name,
                email: people.email,
                password: hashedPassword,
                department: people.department
            });

            const option = {
                from :"ayushmishra0003@gmail.com",
                to :  people.email,
                subject: "Your Account Is Created Successfull Type-Employee",
                text:"Thank You For Creating Account, You Account Type is Employee Now You Can Used My C.M.S"
            }

            await transporter.sendMail(option);

            return res.render("first_page", {
                message: "Account created successfully"
            });
        }
        else if(people.adminpassword){

           const hashedpassword = await bcrypt.hash(people.password, 10);

           if(people.adminpassword !== "Ayush_bhai"){
             return res.render("first_page", {
                message: "Wrong Information Special Admin Key"
            });
           }
           
           await Adminmodel.create({
                name: people.name,
                email: people.email,
                password: hashedpassword
            });
            const option = {
                from :"ayushmishra0003@gmail.com",
                to :  people.email,
                subject: "Your Account Is Created Successfull Type-Admin",
                text:"Thank You For Creating Account, You Account Type is Admin Now You Can Used My C.M.S"
            }

            await transporter.sendMail(option);

            return res.render("first_page", {
                message: "Account created successfully"
            });
        }
        else {
            const hashedPassword = await bcrypt.hash(people.password, 10);

            await Studentmodel.create({
                name: people.name,
                email: people.email,
                password: hashedPassword
            });
            
            const option = {
                from :"ayushmishra0003@gmail.com",
                to :  people.email,
                subject: "Your Account Is Created Successfull Type-Student",
                text:"Thank You For Creating Account, You Account Type is Student Now You Can Used My C.M.S"
            }

            await transporter.sendMail(option);

            return res.render("first_page", {
                message: "Account created successfully"
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).render("server_error");
    }
});
app.use((err, req, res, next)=>{
    if(err){
     res.status(500).render("server_error");
    }
    next();
});
const veryfication = function(req, res, next){
    const token = req.cookies.token;

    if (!token) {
      res.redirect("/");
      return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect("/login");
    }
}

app.post("/login", async (req, res) => {
    const people = req.body;
    const token = req.cookies.token;
    if(token){
        res.redirect("/dashboard");
        return;
    }

    try {
        let result;

        if (people.role === "Employee") {
            result = await Employemodel.findOne({ email: people.email });
        } else if(people.role === "Student") {
            result = await Studentmodel.findOne({ email: people.email });
        }
        else{
            result = await Adminmodel.findOne({ email: people.email });
        }

        if (!result) {
            return res.redirect("/?msg=Wrong Details");
        }

        const isMatch = await bcrypt.compare(people.password, result.password);

        if (!isMatch && result.name != people.name) {
            return res.redirect("/?msg=Wrong Details");
        }

         const token = jwt.sign(
            { id: result._id, email: result.email,role:people.role, name : people.name},
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect("/dashboard");

    } catch (err) {
        res.status(500).render("server_error");
    }
});

app.get("/", (req, res) => {
    const token = req.cookies.token;
    if(token){
        res.redirect("/dashboard");
        return;
    }
    if(req.query.msg){
        res.render("first_page",{message:req.query.msg});
        return;
    }
    res.render("first_page",{message:"Firstly you need Login"});
});

app.get("/logout", veryfication, (req, res) => {
    res.clearCookie("token");
    res.redirect("/?msg= You have been logged out successfully");
});

app.get("/dashboard", veryfication,(req, res)=>{
    const role = req.user.role;
    res.render("dashboard",{role:role, name:req.user.name, message:req.query.msg});
});

app.get("/complaint", veryfication, async(req, res)=>{
    if(req.user.role !== "Student"){
        res.redirect("/dashboard?msg= You can not create a complain this is only for students")
        return;
    }
    const resolverList = await Employemodel.find();
    res.render("complain",{resolverList});
});

app.get("/Total-complaints", veryfication, async(req, res)=>{
    if(req.user.role == "Employee"){
        const result = await Complainmodel.find({resolveremail:req.user.email});
        res.render("totalcomplain",{result, role:req.user.role, message:req.query.msg});
        return;
    }
    if(req.user.role == "Admin"){
        const result = await Complainmodel.find();
        res.render("totalcomplain",{result, role:req.user.role, message:req.query.msg});
        return;
    }
    const result = await Complainmodel.find({complaineremail:req.user.email});
    res.render("totalcomplain",{result, role:req.user.role});
});

app.post("/contact-form", veryfication, async (req, res)=>{

    try{
        const option1 = {
        from : "Ayushmishra0003@gmail.com",
        to : "Ayushmishra0003@gmail.com",
        subject : "Some Query Please Check",
        text : req.body.reason
        }
        await transporter.sendMail(option1);
        const option2 = {
        from : "Ayushmishra0003@gmail.com",
        to : req.body.email,
        subject : "We will Connect You Soon",
        text : "Please Wait. We will connet you Asap or My team is connect you" + " You Concern Is -" + req.body.reason
        }
        await transporter.sendMail(option2);
     } 
    catch(err){
        res.render("contact",{message : "Somethink Wrong Try After Some Time"});
        return;
    }

   res.render("contact",{message : "Successfull Send Your Message"});
})

app.post("/complaint/create", veryfication, async (req, res) => {
    try {
        const complain = req.body;
        const resolver = await Employemodel.findById(complain.resolverId);

        if (!resolver) {
            const resolverList = await Employemodel.find();
            return res.render("complain", {
                resolverList,
                message: "Invalid Resolver Selected"
            });
        }
        await Complainmodel.create({
            reason: complain.reason,
            complaineremail: req.user.email,
            complainermobno: complain.mobnumber,

            resolveremail: resolver.email,
            complaindepartment: resolver.department,
            resolvername: resolver.name,

            complainername: req.user.name,
            complainerdepartment: complain.cdepartment,
            complainercourse: complain.course,
            complainersection: complain.section,
            status: "Created"
        });
        const resolverList = await Employemodel.find();

        const option1 = {
        from : "Ayushmishra0003@gmail.com",
        to :  resolver.email,
        subject : "Please Check One Complain",
        text : "Solve This Complain In 7 Days Reason is :- " + req.body.reason
        }
        await transporter.sendMail(option1);
        const option2 = {
        from : "Ayushmishra0003@gmail.com",
        to : req.user.email,
        subject : "Your Complain is Submitted",
        text : "We Will Connect You Soon Your Complain is Submitted Your Reason is :- " + req.body.reason
        }
        await transporter.sendMail(option2);

        res.render("complain", {
            resolverList,
            message: "Your Complaint is Registered Successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).render("server_error");
    }
});

app.get("/statusupdate/:id", async(req, res)=>{
    const id = req.params.id;
    res.render("status_update_form",{id});
});

app.post("/statusupdated/:id", async(req, res)=>{
    const id = req.params.id;
    try{
       await Complainmodel.findByIdAndUpdate(
             id,
              { $set: { status: req.body.st } },
        );
         const result = await Complainmodel.findById(id);

        if(req.body.st == "Resolved"){
            let otpstr = "";
            while(otpstr.length < 6){
                let rand = Math.floor(Math.random() * 10);
                otpstr += rand;
            }
            const existingOtp = await Otpmodel.findOne({ camp_id: id });
            if (existingOtp) {
               otpstr = existingOtp.otp; 
            } 
            else {
               await Otpmodel.create({
                 otp: otpstr,
                 camp_id: id
               });
            }
           const mailoption = {
               from: "Ayushmishra0003@gmail.com",
               to: result.complaineremail,
               subject: "Your Complaint Status Updated" + " is now " + req.body.st + " Complain id - "  + id,
               text: req.body.message + " You share this otp with resolver :- " + otpstr
            };
            await transporter.sendMail(mailoption);
        }
        else{
            const mailoption = {
              from: "Ayushmishra0003@gmail.com",
              to: result.complaineremail,
              subject: "Your Complaint Status Updated" + " is now " + req.body.st + " Complain id - "  + id,
              text: req.body.message 
            };
             await transporter.sendMail(mailoption);
        }

        // console.log(result);

        res.redirect("/Total-complaints");

    }
    catch(err){
        res.status(500).render("server_error");
    }
});

app.get("/statusotp/:id", async(req, res)=>{
    const id = req.params.id;
    res.render("otpform",{id});
});

app.post("/verify-otp/:id",async(req, res)=>{
    const id = req.params.id;
    const result = await Otpmodel.findOne({ camp_id: id });
    if(result.otp === req.body.otp){
        await Complainmodel.findByIdAndUpdate(id,{$set:{otp:"Approved"}});
        return res.redirect("/Total-complaints?msg=OTP Verified Successfully");
    }
    else{
        return res.redirect("/Total-complaints?msg=Invalid OTP");
    }
});

app.get("/deletecomp/:id", async(req, res)=>{
    const id = req.params.id;
    try{
        await Complainmodel.deleteOne({ _id: id });
        res.redirect("/Total-complaints?msg= Successfully Deleted");
    }
    catch(err){
        res.redirect("/Total-complaints?msg= Something is Wrong");
    }
});

app.post("/filtercamplain", veryfication, async (req, res) => {

    const filter = req.body.filterby;
    const role = req.user.role;
    const email = req.user.email;

    let query = {};

    if (role === "Employee") {
        query.resolveremail = email;
    } else if (role === "Student") {
        query.complaineremail = email;
    }
   
    if (filter === "Solved") {
        query.otp = "Approved";
    } else if (filter === "Unsolved") {
        query.otp = "NotApproved";
    } else if (filter === "Delay") {
        query.otp = "NotApproved";
    }

    try {
        const result = await Complainmodel.find(query);

        res.render("totalcomplain", {
            result,
            role: role,
            message: `Filter applied: ${filter}`
        });

    } catch (err) {
        console.log(err);
        res.status(500).render("server_error");
    }
});

app.get("/about",(req, res)=>{
    res.render("about");
})

app.get("/contact",(req, res)=>{
    res.render("contact");
});

app.get("/home",(req, res)=>{
    res.render("home");
});
const PORT = process.env.PORT || 12345;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app;