const {connection, pool} = require("../../Database/mysql")
const {body, validationResult} = require("express-validator")
const session = require("express-session")
const crypto = require("crypto")
const moment = require('moment');


const commentsCreate = [
  
 (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const {recipe_id, user_id, comment, stars} = req.body
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const commentsData = {
            recipe_id,
            user_id,
            comment,
            stars,
            created_at: formattedDate,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query('INSERT INTO comments SET ?', commentsData, (err, results) => {
                
                connection.release();
        
                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).send('Error registering comments');
                    return;
                }
            });
        });

    }
}
]

const commentsUpdate = [
    
(req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.json({ errors: errors.array() });
    } else {
        const {recipe_id, user_id, comment, stars} = req.body
        let formattedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const commentsData = {
            recipe_id,
            user_id,
            comment,
            stars,
            updated_at: formattedDate
        };

        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
        
            connection.query("UPDATE TABLE comments SET ? where id = ?", [commentsData, id], (err, results) => {
                if (err) {
                    console.log("something went wrong");
                } 
                connection.release()
            });
        });

    }
}
]

const commentsDelete = async(req,res) => {
    const {id} = req.body.id;

    connection.query("delete from comments where id = ?", id, (err,results) => {
        if(err){
            console.log(err)
        }
        connection.end()
        
    })
}

module.exports = {commentsCreate, commentsUpdate, commentsDelete}