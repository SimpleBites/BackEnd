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

app.get("/register", authcheck, ((req,res) => {
  res.write("hello world")
  console.log("test")
  res.end()
}))

app.post('/loginsubmit', [
  body('email')
    .isEmail().withMessage('Enter a valid email address')
    .custom(email => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.error('Error getting database connection:', err);
            connection.release();
            return reject(new Error("Database connection error"));
          }
          connection.query("SELECT email FROM users WHERE email = ?", [email], (err, results) => {
            connection.release();
            if (err) {
              return reject(new Error("Database query error"));
            }
            if (results.length === 0) {
              return reject(new Error("No user with that email"));
            }
            resolve(true);
          });
        });
      });
    }),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email} = req.body;

  pool.getConnection(async function(err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).send('Database error');
    }

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        connection.release();
        return res.status(500).send('Database error');
      }

    
        const user = results[0];
        const dbpassword = user.password
        const password = req.body.password
        const passwordMatch = async (password, dbpassword) => {
          return await bcrypt.compare(password, dbpassword);
        };

      
        if (!passwordMatch) {
          //connection.release();
          console.log("incorrect password")
          //res.json({ errors: [{ msg: "Incorrect password" }] });
        }
        else{
          var hour = 3600000;
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.cookie.expires = new Date(Date.now() + hour);
        req.session.cookie.maxAge = hour;

        // Save the session before sending the response
        req.session.save(err => {
          connection.release(); // Release connection after session save
          if (err) {
            console.error('Error saving session:', err);
            return res.status(500).send('Error saving session');
          }
          // Response should be sent after session is saved successfully
          return res.json({ redirect: true, url: "http://localhost:3000/home" });
        });
        }

        // Password matches, set session variables
        
       
      })
    });
  });





app.post("/logout", ((req,res) => {
  req.session.destroy((err) => {
      if(err){
          console.log(err)
      }
  })
  return res.json({redirect:true, url: "http://localhost:3000/login"})
}))


app.get("/session", ((req,res) => {
  res.send(req.session)
  res.end()
}))

  app.get('/protected-route',(req, res) => {
  
  });
  
  
    app.use("*", ((req,res) => {
        res.status(404).send("<h1>Resource not found</h1>")
    }))
    
    app.listen(4000, () => {
        console.log("app listening on port: 4000")
    })