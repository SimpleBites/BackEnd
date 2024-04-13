const express = require("express")
const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const flash = require("connect-flash")
const cors = require("cors")
const bodyparser = require("body-parser")
const crypto = require("crypto")
const moment = require('moment');


//const {authcheck} = require("../../middleware/authcheck")

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
//app.use(authcheck)

app.get("/admin/users/get", ((req,res) => {
    pool.getConnection((err, connection) => {
        if(err){
            console.log(err)
        }

        connection.query("Select * from users", (err, results) => {
            if(err){
                console.log(err)
            }

            const users = results
            res.json({users: users})

        })
    })
}))

app.post("/admin/users/create", [
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
        const {username, email, password1, password2} = req.body
        const salt = crypto.randomBytes(16).toString('hex'); 
        const iterations = 10000; 
        const keyLength = 64;  
        const digest = 'sha512';  
        const hashedPassword = crypto.pbkdf2Sync(password1, salt, iterations, keyLength, digest).toString('hex');
      
   

        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const userData = {
            username: username,
            email: email,
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
            });
        });

    }
});

app.post("/admin/users/update", [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long").isLength({max:18}).withMessage("username can not be more than 18 characters "),
    body('email').isEmail().normalizeEmail().withMessage('Email must be valid').custom(async email => {
        const user = await new Promise((resolve, reject) => {
            
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
        const {username, email, password1, password2} = req.body
        const salt = crypto.randomBytes(16).toString('hex'); 
        const iterations = 10000; 
        const keyLength = 64;  
        const digest = 'sha512';  
        const hashedPassword = crypto.pbkdf2Sync(password1, salt, iterations, keyLength, digest).toString('hex');
      
   

        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const userData = {
            username: username,
            email: email,
            password: hashedPassword,
            salt: salt,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query("SELECT email from users where email = ?", [email], (err, results, fields) => {
                if (err) {
                    console.log("something went wrong");
                } else {
                   connection.query("Update ")
                }

                connection.release()
            });
        });

    }
});

app.post("/admin/users/delete", ((req,res) => {
    const {id} = req.body.id;

    connection.query("delete from users where id = ?", id, (err,results) => {
        if(err){
            console.log(err)
        }
        connection.end()
        
    })
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})