const {connection, pool} = require("../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');
const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Make sure this folder exists
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
  
  const upload = multer({ storage: storage });

  
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
                res.json({recipes: recipes})
                
            })
        })
}


const recipeCreate = [
   
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const formData = req.body.formData

        const tools = formData.toolValues
        const toolsFiltered = tools.filter(elm => elm)
        const instructions = formData.inputValues
        const instructionsFiltered = instructions.filter(elm => elm);

        console.log(formData)
        console.log(toolsFiltered)
        console.log(instructionsFiltered)
        upload.single(formData.selectedImage)
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const recipeData = {
            title: formData.title,
            description: formData.description,
            preparation_time: formData.prepTime,
            cooking_time: formData.cookTime,
            servings: formData.servings,
            instructions: JSON.stringify(instructionsFiltered),
            tools: JSON.stringify(toolsFiltered),
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

            req.flash('success', 'Success! Recipe is created')
            res.json({success: req.flash("success")})
        });

    }
}
]

const recipeUpdate = [
   
(req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const recipeData = {
            recipename: recipename,
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
        
            connection.query("SELECT email from recipes where email = ?", [email], (err, results, fields) => {
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

const recipeDelete = async(req,res) => {
    const {id} = req.body;
    pool.getConnection((err, connection) => {
        connection.query("delete from recipes where id = ?", id, (err,results) => {
            connection.release()
            if(err){
                console.log(err.code)
            }
        })
        req.flash('success', `Success! Recipe with id: ${id} is deleted`)
        res.json({success: req.flash("success")})
    })

   
    
}

module.exports = {recipeGet, recipeCreate, recipeUpdate, recipeDelete}

