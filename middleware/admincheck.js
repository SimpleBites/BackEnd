const session = require("express-session")

const admincheck = (req,res,next) => {
    if(req.session.role !== "admin"){
        return res.status(401).send("Unauthorized")
    } else{
        next()
    }
}

module.exports = {admincheck}