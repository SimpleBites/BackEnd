const express = require("express")
const session = require("express-session")
const cors = require("cors")
const bodyparser = require("body-parser")
const {register} = require("../controllers/auth/registercontroller")
const {login, logout} = require("../controllers/auth/logincontroller")
const {sendMail} = require("../controllers/mailcontroller")
//const {authcheck} = require("../../middleware/authcheck")

require('dotenv').config();


const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    optionsSuccessStatus: 200, 
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
    resave: false,
}))

app.use(express.json())
app.use(cors(corsOptions))
app.use(bodyparser.json())

app.post("/registerSubmit", register)
app.post("/loginSubmit", login)
app.post("/logout", logout)
app.post("/sendMail", sendMail)

app.get("/session", ((req,res) => {
    res.send(req.session)
    
}))

app.use("*", ((req,res) => {
    res.status(404).send("<h1>Resource not found</h1>")
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})
