const express = require("express")
const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const flash = require("connect-flash")
const cors = require("cors")
const bodyparser = require("body-parser")
const crypto = require("crypto")
const moment = require('moment');
const jwt = require("jsonwebtoken")
const {authcheck} = require("../middleware/authcheck")
require('dotenv').config();


const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}

function hashPassword(password, callback) {
    const salt = crypto.randomBytes(16).toString('hex');  // Generate a 16-byte salt
    const iterations = 10000;  // Recommended number of iterations
    const keyLength = 64;  // Recommended key length
    const digest = 'sha512';  // Recommended hash function
  
    crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
      if (err) {
        callback(err, null);
      } else {
        // Callback with the salt and the hash
        callback(null, {
          salt: salt,
          hash: derivedKey.toString('hex')
        });
      }
    });
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
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long").isLength({max:18}).withMessage("username can not be more than 18 characters "),
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
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const reqpassword = req.body.password1
        const salt = crypto.randomBytes(16).toString('hex'); 
        const iterations = 10000; 
        const keyLength = 64;  
        const digest = 'sha512';  
        const hashedPassword = crypto.pbkdf2Sync(reqpassword, salt, iterations, keyLength, digest).toString('hex');
      
   

        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            salt: salt,
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
                
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering user');
                    return;
                }

                const token = jwt.sign({ userId: results.insertId}, 'harrypotter', { expiresIn: '1h' });
                req.session.token = token
        
                var hour = 3600000;
                req.session.cookie.expires = new Date(Date.now() + hour);
                req.session.cookie.maxAge = hour;
        
                
                req.session.userId = results.insertId;
                req.session.username = userData.username;
        
                
                req.session.save(err => {
                    if (err) {
                        console.error('Session save error:', err);
                        res.status(500).send('Error saving session');
                        return;
                    }
        
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