var mongoose = require('mongoose')
var User = require('../models/userModel')

var addFileSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.ObjectId, ref: 'User'},
  title: {type: String},
  description: {type: String},
  date: {type: Date, default: Date.now},
  addFileProperties: {type: String}
})

var addFile = mongoose.model('addFile', addFileSchema)
module.exports = addFile
