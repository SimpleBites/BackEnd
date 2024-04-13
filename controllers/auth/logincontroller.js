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
const {authcheck} = require("../../middleware/authcheck")
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

app.get("/register", ((req,res) => {
  res.write(JSON.stringify(process.env.EMAIL))
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
            return reject(new Error("Database connection error"));
          }
          connection.query("SELECT email FROM users WHERE email = ?", [email], (err, results) => {
            if (err) {
              connection.release();
              return reject(new Error("Database query error"));
            }
            if (results.length === 0) {
              connection.release();
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

  const { email, password } = req.body;

  pool.getConnection(function(err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).send('Database error');
    }

    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        connection.release();
        return res.status(500).send('Database error');
      }

      if (results.length > 0) {
        const user = results[0];
        const hash = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
        
        if (hash === user.password) {
          const token = jwt.sign({ userId: user.id }, 'harrypotter', { expiresIn: '1h' });
          req.session.token = token;
          req.session.userId = user.id;
          req.session.username = user.username;
          req.session.email = user.email
          var hour = 3600000;
          req.session.cookie.expires = new Date(Date.now() + hour);
          req.session.cookie.maxAge = hour;

          req.session.save(err => {
            connection.release(); 
            if (err) {
              console.error('Error saving session:', err);
              return res.status(500).send('Error saving session');
            }
            return res.json({ redirect: true, url: "http://localhost:3000/home" });
          });
        } else {
          connection.release();
          console.log("Incorrect password");
          return res.status(401).json({ errors: [{ msg: "Incorrect password" }] });
        }
      } else {
        connection.release();
        return res.status(404).json({ errors: [{ msg: "User not found" }] });
      }
    });
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

  app.get('/protected-route', async (req, res) => {
    const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json()
      console.log(data)
  });
  
  
    app.use("*", ((req,res) => {
        res.status(404).send("<h1>Resource not found</h1>")
    }))
    
    app.listen(4000, () => {
        console.log("app listening on port: 4000")
    })