const session = require("express-session")
const authroutes = ((req,res,next) => {
    if(!req.session.user){
        return res.status(401).send("Unauthorized");
    }

    next()
})

module.exports = authroutes