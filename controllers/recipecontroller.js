const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');
const multer  = require('multer')
const upload = multer({ dest: 'images/' })
//const {authcheck} = require("../../middleware/authcheck")

const recipeGet = async(req,res) => {
        pool.getConnection((err, connection) => {
            if(err){
                console.log(err)
            }
    
            connection.query("Select * from recipes", (err, results) => {
                connection.release()
                if(err){
                    console.log(err)
                }
    
                const recipes = results
                res.json({users: users})
                
            })
        })
}


const recipeCreate = [
    /*
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
    }),*/
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const formData = req.body.formData
        console.log(formData)
        upload.single(formData.selectedImage)
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const recipeData = {
            title: formData.title,
            description: formData.description,
            preparation_time: formData.prepTime,
            cooking_time: formData.cookTime,
            servings: formData.servings,
            user_id: req.session.userId,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO recipes SET ?', recipeData, (err, results) => {
                
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



module.exports = {recipeCreate}