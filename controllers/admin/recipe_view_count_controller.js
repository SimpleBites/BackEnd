const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');


const recipeViewCountCreate = [
   
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const {view_count_total, view_count_day, recipe_id} = req.body
        const recipeViewCountData = {
            view_count_total: view_count_total,
            view_count_day: view_count_day,
            created_at: formattedDate,
            updated_at: formattedDate,
            recipe_id: recipe_id
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO recipe_view_count SET ?', recipeViewCountData, (err, results) => {
                
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering recipeViewCount');
                    return;
                }
            });
        });

    }
}
]

const recipeViewCountUpdate = [
(req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const {id, view_count_total, view_count_day, recipe_id} = req.body
        const recipeViewCountData = {
            view_count_total: view_count_total,
            view_count_day: view_count_day,
            created_at: formattedDate,
            updated_at: formattedDate,
            recipe_id: recipe_id
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query("UPDATE TABLE recipe_view_count SET ? where id = ? ", [recipeViewCountData, id], (err, results, fields) => {
                if (err) {
                    console.log("something went wrong");
                } 
                
                connection.release()
            });
        });

    }
}
]

const recipeViewCountDelete = async(req,res) => {
    const {id} = req.body.id;

    connection.query("delete from recipe_view_count where id = ?", id, (err,results) => {
        if(err){
            console.log(err)
        }
        connection.end()
        
    })
}

module.exports = {recipeViewCountCreate, recipeViewCountUpdate, recipeViewCountDelete}