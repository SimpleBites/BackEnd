const express = require("express")
const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const flash = require("express-flash")
const cors = require("cors")
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt")
const moment = require('moment');
const {authcheck} = require("../middleware/authcheck")
require('dotenv').config();


const corsOptions = {
    origin: "http://localhost:3000",
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

app.get("/Register", ((req,res) => {
    console.log("test")
}))

app.post("/registersubmit", [
    body("username").isLength({length:3}).withMessage("Username must be at least 3 characters long"),
    body('email').isEmail().normalizeEmail().withMessage('Email must be valid').custom(async email => {
        const user = await new Promise((resolve,reject) => {
            connection.query("SELECT email from users where email = ?", [email], (err,results,fields) => {
                if(err){
                    reject(new Error("something went wrong"))
                } else{
                    resolve(results.length > 0 ? results[0] : null);
                }
            })
        })
        if (user) {
            throw new Error('Email already in use');
        }
    }),
    body('password1').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body("password2").custom((value, { req }) => {
        if (value !== req.body.password1) {
          throw new Error('Password confirmation does not match password');
        }
        
        return true;
      }),
], 
((req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        flash('errors', errors);
        res.set({ errors: errors.array() })
        res.redirect("localhost:3000/Register")
    } else{
        const saltrounds = 10
        const hashedPassword = bcrypt.hashSync(req.body.password1, saltrounds)
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function(err, connection){
            connection.query('INSERT INTO users SET ?', userData, (err, results, fields) => {
                if(err){
                    console.log(err)
                }

                connection.release()
            })
        })

        var hour = 3600000
        req.session.cookie.expires = new Date(Date.now() + hour)
        req.session.cookie.maxAge = hour
        req.session.user = [userData.username, userData.email]

        req.session.regenerate(() => {
           
        })
       
        res.redirect("http://localhost:3000/home")
    }
}))

app.get("/session", ((req,res) => {
    res.send(req.session)
    res.end()
}))

app.use("*", ((req,res) => {
    res.status(404).send("<h1>Resource not found</h1>")
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})