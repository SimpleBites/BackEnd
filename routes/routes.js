const express = require("express")
const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const flash = require("connect-flash")
const cors = require("cors")
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt")
const moment = require('moment');
const jwt = require("jsonwebtoken")
const {authcheck} = require("../middleware/authcheck")
require('dotenv').config();


const corsOptions = {
    origin: "http://localhost:3000",
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
app.use(flash())
const {registersubmit} = require("../controllers/registercontroller")

const router = express.Router()

router.post("/registersubmit", registersubmit)

