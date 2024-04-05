const mysql = require("mysql")

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "hoijur123",
    database: "simplebites"
})

const pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "hoijur123",
    database: "simplebites"
})

module.exports = {connection, pool}