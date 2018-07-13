var mongoose = require('mongoose')

var eventSchema = new mongoose.Schema({
  startDate: {type: Date, require: true, min: Date.now()},
  eventName: {type: String, require: true},
  organizerName: {type: String, require: true},
  description: {type: String},
  location: {type: String, require: true},
  typeOfEvent: {type: String},
  numberOfSpots: {type: Number},
  contact: {type: String},
  createdAt: {type: Date, default: Date.now()},
  attendees: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
})

var Event = mongoose.model('Event', eventSchema)

module.exports = Event
