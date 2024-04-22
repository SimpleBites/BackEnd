const express = require("express")
const app = new express()
const refuseBodyParser = ((req, res, next) => {
    if (req.path === '/recipes/create') {
      // If the route is for file upload, skip JSON parsing
      next();
    } else {
      // For all other routes, parse JSON
      bodyParser.json()(req, res, next);
    }
  });

  module.exports = {refuseBodyParser}