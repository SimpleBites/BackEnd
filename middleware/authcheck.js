const session = require("express-session")
const authcheck = ((req,res,next) => {
    if(req.session){
        res.redirect("localhost:3000/home")
    }

    next()

})

module.exports = {authcheck}