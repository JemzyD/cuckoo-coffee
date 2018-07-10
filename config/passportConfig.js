var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('../models/userModel')

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  User.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false)
    }
    if (!user.validPassword(password)) {
      return done(null, false)
    }
    return done(null, user) // all good return user
  })
}))

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

module.exports = passport
