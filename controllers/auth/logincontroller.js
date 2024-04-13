const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const login = [
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
    body('password').notEmpty().withMessage('Password is required'),
(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
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
          const errors = [{value: "field", value: password, msg: 'Incorrect password', path: 'password', location: 'body'}]
           //res.json({ errors: errors});
        }
      } else {
        connection.release();
        return res.status(404).json({ errors: [{ msg: "User not found" }] });
      }
    });
  })

}
]

const logout = ((req,res) => {
  
  req.session.destroy((err) => {
    if(err){
        console.log(err)
    }
})
return res.json({redirect:true, url: "http://localhost:3000/login"})
})

module.exports = {login, logout}