const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');

const recipeCategoriesCreate = [
    
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const {title} = req.body
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const recipeCategoriesData = {
            title: title
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO recipe_categories SET ?', recipeCategoriesData, (err, results) => {
                
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering recipeCategories');
                    return;
                }
            });
        });

    }
}
]

const recipeCategoriesUpdate = [
    
(req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const {id, title} = req.body
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const recipeCategoriesData = {
            title: title,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query("UPDATE TABLE recipe_categories SET ? WHERE id = ?", [recipeCategoriesData, id], (err, results) => {
                connection.release()
                if (err) {
                    console.log("something went wrong");
                }     
            });
        });

    }
}
]

const recipeCategoriesDelete = async(req,res) => {
    const {id} = req.body.id;

    connection.query("delete from recipe_categories where id = ?", id, (err,results) => {
        if(err){
            console.log(err)
        }
        connection.end()
        
    })
}

module.exports = {recipeCategoriesCreate, recipeCategoriesUpdate, recipeCategoriesDelete}