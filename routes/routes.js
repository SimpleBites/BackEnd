const express = require("express")
const session = require("express-session")
const cors = require("cors")
const bodyparser = require("body-parser")
const flash = require("express-flash")
const {register} = require("../controllers/auth/registercontroller")
const {login, logout} = require("../controllers/auth/logincontroller")
const {sendMail} = require("../controllers/mailcontroller")
const {dashboardcontroller} = require("../controllers/admin/dashboardcontroller")
const {userCreate, userUpdate, userDelete} = require("../controllers/admin/usercontroller")
const { recipeCreate, recipeUpdate, recipeDelete} = require("../controllers/recipecontroller")
const {RecipeViewCountCreate, recipeViewCountUpdate, recipeViewCountDelete} = require("../controllers/admin/recipe_view_count_controller")
const {recipeIngredientsCreate, recipeIngredientsUpdate, recipeIngredientsDelete} = require("../controllers/admin/recipe_ingredients_controller");
const {commentsCreate, commentsUpdate, commentsDelete} = require("../controllers/admin/commentscontroller");
const {recipeCategoriesCreate, recipeCategoriesUpdate, recipeCategoriesDelete} = require("../controllers/admin/recipe_categories_controller");
const {authcheck} = require("../middleware/authcheck")
const {admincheck} = require("../middleware/admincheck")
const { admin } = require("googleapis/build/src/apis/admin")

require('dotenv').config()


const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    optionsSuccessStatus: 200, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}

const app = new express()

app.use(bodyparser.urlencoded({
    extended: true,
    limit: "100mb"
}));

app.use(session({
    secret: "harrypotter",
    saveUninitialized: false,
    cookie: {secure: false},
    resave: false,
}))

app.use(express.json({limit: '50mb'}))
app.use(cors(corsOptions))
app.use(bodyparser.json({limit: '50mb'}))
app.use(flash())

app.post("/registerSubmit", register)
app.post("/loginSubmit", login)
app.post("/logout", logout)
app.post("/sendMail", sendMail)

app.get("/admin/dashboard", dashboardcontroller)

app.post("/admin/users/store", admincheck, userCreate)
app.put("/admin/users/update", admincheck, userUpdate)
app.post("/admin/users/delete", admincheck, userDelete)

app.post("/recipes/create", recipeCreate)
app.post("/admin/recipes/update", admincheck, recipeUpdate)
app.post("/admin/recipes/delete", admincheck, recipeDelete)

//app.post("/admin/recipeviewcount/create", admincheck, RecipeViewCountCreate)
app.post("/admin/recipeviewcount/update", admincheck, recipeViewCountUpdate)
app.delete("/admin/recipeviewcount/update", admincheck, recipeCategoriesUpdate)

app.post("/admin/ingredients/create", admincheck, recipeIngredientsCreate)
app.post("/admin/ingredients/update", admincheck, recipeIngredientsUpdate)
app.delete("/admin/ingredients/delete", admincheck, recipeIngredientsDelete)

app.post("/admin/comments/create", admincheck, commentsCreate)
app.post("/admin/comments/update", admincheck, commentsUpdate)
app.delete("/admin/comments/delete", admincheck, commentsDelete)

app.get("/session", ((req,res) => {
    res.json(req.session)
    
}))



app.use("*", ((req,res) => {
    res.status(404).send("<h1>Resource not found</h1>")
}))

app.listen(4000, () => {
    console.log("app listening on port: 4000")
})
