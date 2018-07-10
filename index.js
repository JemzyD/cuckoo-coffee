// require dependencies
require('dotenv').config({
  silent: true
})
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
var flash = require('connect-flash')
var session = require('express-session')
var mongoose = require('mongoose')
var ejsLayouts = require('express-ejs-layouts')
var methodOverride = require('method-override')
var passport = require('./config/passportConfig')
var isLoggedIn = require('./middleware/isLoggedIn')
var multer = require('multer')
var upload = multer({
  dest: './uploads'
})
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dssz6awpk', 
  api_key: '993131227115598', 
  api_secret: 'W1TTYEVW57gKCJzCunAnrAliqoI'
});

var fs = require('fs')
var image = require('./models/imageModel')
// var cheerio = require('cheerio')

// initialize app
var app = express()

// connect to database
var dbURI = process.env.PROD_MONGODB || 'mongodb://localhost:27017/cuckoo'
mongoose.connect(dbURI)
mongoose.Promise = global.Promise

// check if our database connection is okay
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  // we are connected
  console.log('connected suckaasss!')
})

// set up the layout file
app.set('view engine', 'ejs')
app.use(ejsLayouts)

// set up static folders
app.use(express.static(path.join(__dirname, 'public')))

// set up body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(cookieParser())

// set up the method override method
app.use(methodOverride('_method'))

// set up express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'girth',
  resave: false,
  saveUnintialized: true
}))
// passport initialization
app.use(passport.initialize())
app.use(passport.session())

// set up flash middleware
app.use(flash())
app.use(function (req, res, next) {
  // this middleware will call on every request and set the req.flash() value.
  // res.locals.message is used here to get the req.flash() values on the current page without having to refresh page
  res.locals.message = req.flash()
  // passport fills the req.user object with the current user
  res.locals.currentUser = req.user
  next()
})

// set up the routes
app.get('/', function (req, res) {
  console.log(req.body)
  res.render('landing', {req: req.user})
})
var publicController = require('./controllers/publicController')
var userController = require('./controllers/userController')

app.use('/public', publicController)
app.use('/auth', userController)
// app.use(isLoggedIn)

// set the port
var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('app is running at ' + port)
})
