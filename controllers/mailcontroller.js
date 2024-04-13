const express = require("express")
const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const flash = require("connect-flash")
const cors = require("cors")
const bodyparser = require("body-parser")
const crypto = require("crypto")
const moment = require('moment');
const jwt = require("jsonwebtoken")
//const {authcheck} = require("../../middleware/authcheck")
require('dotenv').config();


const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}


const app = new express()

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "harrypotter",
    saveUninitialized: false,
    cookie: {secure: false},
    resave: false
}))

app.use(express.json())
app.use(cors(corsOptions))
app.use(bodyparser.json())



app.post("/sendEmail", ((req,res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {user: process.env.EMAIL, pass: process.env.EMAIL_PASS}
    })

    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: req.session.email, // sender address
          to: "jansoniusjur@gmail.com", // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world?", // plain text body
          html: "<b>Hello world?</b>", // html body
        });
      
        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }
      
      main().catch(console.error);
      
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})