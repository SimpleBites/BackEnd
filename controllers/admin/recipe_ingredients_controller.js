const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');

const recipeIngredientsCreate = [
    
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const {recipe_id, ingredient_id, quantity} = req.body
        const recipeIngredientsData = {
            recipe_id: recipe_id,
            ingredient_id: ingredient_id,
            quantity: quantity,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO recipe_ingredients SET ?', recipeIngredientsData, (err, results) => {
                
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering recipeIngredients');
                    return;
                }
            });
        });

    }
}
]

const recipeIngredientsUpdate = [
    
(req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const {id, recipe_id, ingredient_id, quantity} = req.body
        const recipeIngredientsData = {
            recipe_id: recipe_id,
            ingredient_id: ingredient_id,
            quantity: quantity,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
           connection.query("UPDATE TABLE recipe_ingredients SET ? where id = ?", [recipeIngredientsData, id] ,(err, results) => {
            connection.release()
           })
        });

    }
}
]

const recipeIngredientsDelete = async(req,res) => {
    const {id} = req.body.id;

    connection.query("delete from recipe_ingredients where id = ?", id, (err,results) => {
        if(err){
            console.log(err)
        }
        connection.end()
        
    })
}

module.exports = {recipeIngredientsCreate, recipeIngredientsUpdate, recipeIngredientsDelete}