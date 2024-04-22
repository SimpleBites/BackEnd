const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const login = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  const  email = req.body.email;

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

      if(results.length === 0){
        connection.release()
        const errors = [{value: "field", value: req.body.email, msg: 'No user with that email', path: 'email', location: 'body'}];
        return res.json({ errors: errors});
        console.log(errors)
      }
      else if (results.length > 0) {
        const user = results[0];
        const reqpassword = req.body.password
        const salt = user.salt
        const iterations = 10000; 
        const keyLength = 64;  
        const digest = 'sha512';  
        const hash = crypto.pbkdf2Sync(reqpassword, salt, iterations, keyLength, digest).toString('hex');
        console.log(user.password)
        console.log(hash)
        let hashresult = hash.slice(0,45)
        console.log(hashresult)

        
        if (hashresult === user.password) {
          const token = jwt.sign({ userId: user.id }, 'harrypotter', { expiresIn: '1h' });
          req.session.token = token;
          req.session.userId = user.id;
          req.session.username = user.username;
          req.session.email = user.email
          req.session.role = user.role
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
          const errors = [{value: "field", value: reqpassword, msg: 'Incorrect password', path: 'password', location: 'body'}]
          return res.json({ errors: errors});
        }
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