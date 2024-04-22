const {pool, connection} = require("../../Database/mysql")

const dashboardcontroller = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to get database connection.');
        }

        const query = (sql) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results[0]);
                    }
                });
            });
        };

        Promise.all([
            query("SELECT COUNT(*) as recipecount FROM recipes"),
            query("SELECT COUNT(*) as commentcount FROM comments"),
            query("SELECT COUNT(*) as usercount FROM users")
        ])
        .then(([recipeCount, commentCount, userCount]) => {
            connection.release();
            res.send({ recipeCount, commentCount, userCount });
        })
        .catch(error => {
            connection.release();
            console.error(error);
            res.status(500).send('Failed to execute database queries.');
        });
    });
};




module.exports = {dashboardcontroller}