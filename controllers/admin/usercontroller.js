const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');

const userCreate = [
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
 (req, res) => {
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
}
]

const userUpdate = [
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
(req, res) => {
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
}
]

const userDelete = async(req,res) => {
    const {id} = req.body;
    pool.getConnection((err, connection) => {
        connection.query("delete from users where id = ?", id, (err,results) => {
            connection.release()
            if(err){
                console.log(err.code)
            }
        })
        req.flash('success', `Success! User with id: ${id} is deleted`)
        res.json({success: req.flash("success")})
    })

}

module.exports = {userCreate, userUpdate, userDelete}