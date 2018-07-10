var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
var eventModel = require('./eventModel')

var userSchema = new mongoose.Schema({
  name: {type: String, require: true, minlength: [3, 'name must be between 3 and 50 characters'], maxlength: [50, 'name must be between 3 and 50 characters']},

  email: {type: String, require: true, unique: true, lowercase: true, match: emailRegex},

  password: {type: String, require: true, minlength: [8, 'name must be between 8 and 40 characters']},

  image: {type: String},

  contact: {type: String},

  interests: {type: String},

  memberSince: {type: Date, default: Date.now()},

  eventsOrganized: [{type: mongoose.Schema.ObjectId, ref: 'Event'}],

  eventsAttending: [{type: mongoose.Schema.ObjectId, ref: 'Event'}]
})

userSchema.pre('save', function (next) {
  var user = this
  // only hash the password if the password is new or has been modified
  if (!user.isModified('password')) return next

  var hashedPassword = bcrypt.hashSync(user.password, 10)
  user.password = hashedPassword
  next()
})

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

// exclude password from  JSON data when returning to the client
userSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.password
    return ret
  }
}

var User = mongoose.model('User', userSchema)

module.exports = User
