const authcheck = ((req,res,next) => {
    if(req.session.user){
        res.redirect("localhost:3000/home")
    }

    next()

})

module.exports = {authcheck}