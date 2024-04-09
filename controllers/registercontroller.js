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

app.get("/Register",  authcheck, ((req,res) => {
   
    console.log("test")
    res.end()
}))

app.post("/registersubmit", [
    body("username").isLength({ length: 3 }).withMessage("Username must be at least 3 characters long"),
    body('email').isEmail().normalizeEmail().withMessage('Email must be valid').custom(async email => {
        const user = await new Promise((resolve, reject) => {
            connection.query("SELECT email from users where email = ?", [email], (err, results, fields) => {
                if (err) {
                    reject(new Error("something went wrong"));
                } else {
                    resolve(results.length > 0 ? results[0] : null);
                }
            });
        });
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
], (req, res) => {
    const errors = validationResult(req);
    console.log(req.body);
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const saltrounds = 10;
        const hashedPassword = bcrypt.hashSync(req.body.password1, saltrounds);
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO users SET ?', userData, (err, results) => {
                // Always release the connection back to the pool first
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering user');
                    return;
                }
        
                // Set session expiration
                var hour = 3600000;
                req.session.cookie.expires = new Date(Date.now() + hour);
                req.session.cookie.maxAge = hour;
        
                // Store user details in the session
                req.session.userId = results.insertId;
                req.session.username = userData.username;
        
                // Save the session before sending the response
                req.session.save(err => {
                    if (err) {
                        console.error('Session save error:', err);
                        res.status(500).send('Error saving session');
                        return;
                    }
        
                    // Respond after session save is successfulsend('User registered and session stored');
                    return res.json({redirect:true, url: "http://localhost:3000/home"})
                });
            });
        });

    }
});



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