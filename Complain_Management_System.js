import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";

// models
import Employemodel from "./Models/Model/Employemodel.js";
import Studentmodel from "./Models/Model/Studentmodel.js";
import Complainmodel from "./Models/Model/Complainmodel.js";
import Otpmodel from "./Models/Model/Otpmodel.js";
import Adminmodel from "./Models/Model/Adminmodel.js";

dotenv.config();

const app = express();

// middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(expressLayouts);

app.set("view engine", "ejs");
app.set("layout", "layout");

// ✅ MongoDB Atlas connection using :contentReference[oaicite:0]{index=0}
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Atlas Connected");
    } catch (error) {
        console.error("❌ DB Error:", error);
        process.exit(1);
    }
};
connectDB();

// 🔐 secrets
const JWT_SECRET = process.env.JWT_SECRET;

// 📧 mail setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("server_error");
});

// 🔐 auth middleware
const veryfication = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.redirect("/login");
    }
};


// ================= ROUTES =================

// signup (same logic, untouched)
app.post("/signup", async (req, res) => {
    const people = req.body;

    try {
        let existingUser;

        existingUser = await Employemodel.findOne({ email: people.email }) ||
                       await Studentmodel.findOne({ email: people.email }) ||
                       await Adminmodel.findOne({ email: people.email });

        if (existingUser) {
            return res.render("first_page", { message: "Already Email is Registered" });
        }

        if (people.refno !== "for_test123") {
            return res.render("first_page", {
                message: "Wrong Secret Reference Key"
            });
        }

        const hashedPassword = await bcrypt.hash(people.password, 10);

        // Employee
        if (people.department) {
            await Employemodel.create({
                name: people.name,
                email: people.email,
                password: hashedPassword,
                department: people.department
            });

        // Admin
        } else if (people.adminpassword) {
            if (people.adminpassword !== "Ayush_bhai") {
                return res.render("first_page", {
                    message: "Wrong Admin Key"
                });
            }

            await Adminmodel.create({
                name: people.name,
                email: people.email,
                password: hashedPassword
            });

        // Student
        } else {
            await Studentmodel.create({
                name: people.name,
                email: people.email,
                password: hashedPassword
            });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: people.email,
            subject: "Account Created",
            text: "Your CMS account is ready ✅"
        });

        res.render("first_page", { message: "Account created successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).render("server_error");
    }
});


// login
app.post("/login", async (req, res) => {
    const people = req.body;

    try {
        let result;

        if (people.role === "Employee") {
            result = await Employemodel.findOne({ email: people.email });
        } else if (people.role === "Student") {
            result = await Studentmodel.findOne({ email: people.email });
        } else {
            result = await Adminmodel.findOne({ email: people.email });
        }

        if (!result) return res.redirect("/?msg=Wrong Details");

        const isMatch = await bcrypt.compare(people.password, result.password);
        if (!isMatch) return res.redirect("/?msg=Wrong Details");

        const token = jwt.sign(
            { id: result._id, email: result.email, role: people.role, name: result.name },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect("/dashboard");

    } catch {
        res.status(500).render("server_error");
    }
});

// basic routes
app.get("/", (req, res) => {
    if (req.cookies.token) return res.redirect("/dashboard");
    res.render("first_page", { message: "Please login" });
});

app.get("/dashboard", veryfication, (req, res) => {
    res.render("dashboard", {
        role: req.user.role,
        name: req.user.name
    });
});

// ================= SERVER =================

const PORT = process.env.PORT || 12345;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});