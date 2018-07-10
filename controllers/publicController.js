var express = require('express')

// pass in mergeParams to router to access params from the parent router
var router = express.Router({
  mergeParams: true
})

var eventVar = require('../models/eventModel')
var User = require('../models/userModel')

// full route: /public/events
router.get('/events', function (req, res) {
  eventVar.find({}, function (err, event) {
    if (err) {
      return
    } else {
      res.render('publicEventsList', {event: event, req: req.user})
    }
  })
})

//SHIFTED THIS TO USER CONTROLLER
// // full route: /public/events/events/:id
router.get('/events/event/:id', function (req, res) {
  eventVar.findById(req.params.id, function (err, event) {
    if (err) {
      console.log(err)
      return
    } else {
      console.log(event);
      console.log(req.user);
      res.render('publicEventList', {event: event, req: req.user})
    }
  })
})

// if viewer wants to join event, check if user is signed in.
// if viewer is signed in, allow to join
// if viewer is not signed in,
// redirect them to log in or sign up page

// full route: /public/events/event/:id/joinevent
router.get('/events/event/:id/joinevent', function (req, res) {
  eventVar.findById(req.params.id, function (err, event) {
    if (!req.user) {
      res.render('publicEventList', {event: event, req: req.user})
    } else {
      req.flash('error', 'You need to login to join the event')
      res.redirect('auth/login')
    }
  })
})
router.put('/events/event/:id/joinevent', function (req, res) {
  eventVar.findOne({_id: req.params.id}, function (err, event) {
    if (err) {
      console.log(err)
      return
    } else {
      if (req.user && event.numberOfSpots && event.attendees.indexOf(req.user._id) < 0) {
        console.log('the user object is' + req.user)
        //reduce the number of spots by 1
        event.update({
          $push: {attendees: req.user},
          $set: {numberOfSpots: event.numberOfSpots-1}},
        function (err, data) {
          if (err) console.log(err)
        })
        event.save()
        // console.log(event);
        User.findById(req.user._id, function (err, user) {
          if (err) {
            console.log(err)
          } else {
            user.update({
              $push: {eventsAttending: event}}, function (err, data) {
                if (err)console.log(err)
            })
            user.save()
          }
        })
        req.flash('success', 'Your attendance has been saved')
        res.redirect('/public/events/event/' + req.params.id)
      } else {
        if(!req.user){
          req.flash('error', 'Please log in to join event')
          // res.redirect('auth/login')
          res.redirect('/public/events')
        } else if(!event.numberOfSpots){
          req.flash('error', 'Sorry, this event is already full!')
          res.redirect('/public/events')
        } else if(event.attendees.indexOf(req.user._id) > 0){
          req.flash('error', 'You have already joined this event')
          res.redirect('/public/events')
        } else if (event.attendees.indexOf(req.user._id) === 0){
          req.flash('error', 'You are the organizer of this event')
          res.redirect('/public/events')

        }
      }
    }
  })
})

router.get('/events/event/:id/yourevent', function (req, res) {
  console.log('individual event page')
  // chain .find method with exec so Mongoose will execute the query
  eventVar.find({user: req.user.id}).exec(function (err, user) {
    res.redirect('/auth/profile/events')
  })
})

// if viewer signs up for event, update attenees array from the eventModel
// update viewer's eventsAttending array to include said event.

module.exports = router
