const session = require("express-session")
const authcheck = (req, res, next) => {
    if (!req.session.userId) {  // Assuming you store user ID in the session upon login
      return res.status(401).send("<h1>Unauthorized</h1>");
    }
    
  };

module.exports = {authcheck}