const express = require("express")
const session = require("express-session")
const cors = require("cors")
const bodyparser = require("body-parser")
const {register} = require("../controllers/auth/registercontroller")
const {login, logout} = require("../controllers/auth/logincontroller")
const {sendMail} = require("../controllers/mailcontroller")
const {userGet, userCreate, userUpdate, userDelete} = require("../controllers/usercontroller")
const {authcheck} = require("../middleware/authcheck")
const { recipeCreate } = require("../controllers/recipecontroller")

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
    extended: true,
    limit: "100mb"
}));

app.use(session({
    secret: "harrypotter",
    saveUninitialized: false,
    cookie: {secure: false},
    resave: false,
}))

app.use(express.json({limit: '50mb'}))
app.use(cors(corsOptions))
app.use(bodyparser.json({limit: '50mb'}))

app.post("/registerSubmit", register)
app.post("/loginSubmit", login)
app.post("/logout", logout)
app.post("/sendMail", sendMail)

app.get("/admin/users", authcheck, userGet)
app.post("/admin/users/store", userCreate)
app.put("/admin/users/update", userUpdate)
app.delete("/admin/users/delete", userDelete)

app.post("/recipes/create", recipeCreate)

app.get("/session", ((req,res) => {
    res.send(req.session)
    
}))

app.use("*", ((req,res) => {
    res.status(404).send("<h1>Resource not found</h1>")
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})
