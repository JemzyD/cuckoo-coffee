var User = require('../models/userModel')
var addFile = require('../models/addFileModel')
var Image = require('../models/imageModel')
var event = require('../models/eventModel')
var passport = require('../config/passportConfig')
var express = require('express')
var router = express.Router({mergeParams: true})
var multer = require('multer')
var cloudinary = require('cloudinary')
var upload = multer({dest: './uploads/'})
var isLoggedIn = require('../middleware/isLoggedIn')
var eventVar = require('../models/eventModel')


// ############ /auth/signup ############### //
router.get('/signup', function (req, res) {
  res.render('signupForm', {req: req.user})
})
router.post('/signup', function (req, res) {
  User.create(req.body, function (err, createduser) {
    if (err) {
      console.log(err)
      res.redirect('/auth/signup')
      return
    } else {
      res.redirect('/auth/login')
    }
  })
})

// ############ /auth/login ############### //
router.get('/login', function (req, res) {
  res.render('loginForm', {req: req.user})
})
router.post('/login', passport.authenticate('local', {
  successRedirect: '/auth/profile/',
  successFlash: 'Login successful!',
  failureRedirect: '/auth/login',
  failureFlash: 'Sorry you have entered invalid username/password'
}))

// ############ /auth/profile ############### //
router.get('/profile', isLoggedIn, function (req, res) {
  addFile.find({user: req.user.id})
  .exec(function (err, addFile2) {
    if (err) {
      console.log(err)
      return
    }
    console.log(addFile2)
    res.render('profile', {addFile2: addFile2, user: req.user, req: req.user})
  })
})
router.post('/profile', upload.single('myFile'), function (req, res) {

  cloudinary.uploader.upload(req.file.path, function (result) {

    console.log('trying to upload')
    console.log(req.user)

    User.findById(req.user.id, function (err, user) {

      if (err)console.log(err)

      addFile.create({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        addFileProperties: result.url
      }, function (err, image) {
        
        if (err) {

          console.log(err)
        } else {

          console.log('before redirect')
          req.flash('success', 'File successfully uploaded')
          res.redirect('/auth/profile')
        }
      })
    })
  }, {resource_type: 'video'})
})



// ############ /auth/profile/editprofile ############### //
router.get('/profile/editprofile', isLoggedIn, function (req, res) {
  res.render('editProfile', {req: req.user})
})

// ############ /auth/profile/editProfile ############### //
router.post('/profile/editprofile', upload.single('profilePicture'), function (req, res) {
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function (result) {
      console.log('uploading profile pic')
      User.findByIdAndUpdate(req.user.id, {
        image: result.url,
        contact: req.body.contact,
        aboutme: req.body.aboutme
      }, function (err, user) {
        if (err){
          console.log(err)
        }else {
          req.flash('success', 'Profile updated')
          res.redirect('/auth/profile')
        }
      })
    })
  } else {
    User.findByIdAndUpdate(req.user.id, {
      contact: req.body.contact,
      aboutme: req.body.aboutme
    }, function (err, user) {
      if (err)console.log(err)
      else {
        req.flash('success', 'Profile updated')
        res.redirect('/auth/profile')
      }
    })
  }
})

// ############ /auth/profile/events ############### //
router.get('/profile/events', isLoggedIn, function (req, res) {
  if (req.user) {
    User.findById(req.user.id)
    .populate('eventsOrganized')
    .populate('eventsAttending')
    .exec(function (err, user) {
      if (err) console.log(err)
      console.log('checking time' + user);
      res.render('usereventsdashboard', {
        user: user,
        req: req.user})
    })
  } else {
    req.flash('error', 'You need to log in to view your events')
    res.redirect('/auth/login')
  }
})

// ############ /auth/profile/events/create-event ############### //
router.get('/profile/events/create-event', isLoggedIn, function (req, res) {
  res.render('createnewevent', {user: req.user, req: req.user})
})
router.post('/profile/events/create-event', function (req, res) {
  event.create({
    user: req.user.id,
    eventName: req.body.eventName,
    organizerName: req.user.name,
    description: req.body.description,
    startDate: req.body.startDate,
    location: req.body.location,
    type: req.body.type,
    numberOfSpots: req.body.numberOfSpots,
    status: req.body.status,
    attendees: []
  }, function (err, event) {
    if (err) {
      console.log(err)
      return
    } else {

        User.findById(req.user.id, function (err, user) {
          // console.log('user', user)
          // console.log(event._id)
          if (err)console.log(err)
          user.update({
            $push: { eventsOrganized: event._id }},
            function (err, user2) {
              if (err) return console.log(err)
              res.redirect('/auth/profile/events')
            })
          })
          console.log(event);
          console.log(req.user);
          event.update({
            $push: {attendees: req.user}}, function(err, data){
              if(err) console.log(err);
            }
          )
          event.save()
          console.log('function ran');

        }
      }
    )
  })

// ############ /auth/profile/events/:id ############### //
router.get('/profile/events/:id', isLoggedIn, function (req, res) {
  event.findById(req.params.id, function (err, event) {
    res.render('userindividualeventpage', {event: event, req: req.user})
  })
})
router.delete('/profile/events/:id', function (req, res) {
  event.findOneAndRemove({_id: req.params.id}, function (err, event) {
    console.log('delete')
    if (err) {
      console.log(err)
      return
    } else {
      User.findByIdAndUpdate(
        req.user.id,
        {$pull: { eventsOrganized: event._id }},
        function (err, event2) {
          if (err) {
            console.log(err)
            return
          }
          res.redirect('/auth/profile/events')
        })
    }
  })
})

// ############ /auth/profile/events/:id/edit ############### //
router.get('/profile/events/:id/edit', isLoggedIn, function (req, res) {
  event.findById(req.params.id, function (err, event) {
    res.render('editeventform', {event: event, req: req.user})
  })
})
router.put('/profile/events/:id/edit', function (req, res) {
  event.findOneAndUpdate({_id: req.params.id}, req.body, function (err, event) {
    if (err) {
      console.log(err)
      return
    } else {
      res.redirect('/auth/profile/events/' + req.params.id)
    }
  })
})

// ############ /auth/profile/events/:id/myattendees ############### //
router.get('/profile/events/:id/myattendees', isLoggedIn, function (req, res) {
  event
  .findById(req.params.id)
  .populate('attendees')
  .exec(function (err, event1) {
    if (err) console.log(err)
    else {
      res.render('myattendees', {arrayOfAttendees: event1.attendees, req: req.user})
    }
  })
})

// ############ /auth/profile/events/:id/withdraw ############### //
router.put('/profile/events/:id/withdraw', function (req, res) {
  event.findById(req.params.id, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      data.update({
        $pull: {attendees: req.user.id},
        $set: {numberOfSpots: data.numberOfSpots + 1}},
      function (err, data1) {
        if (err) {
          console.log(err)
        }
      })
      User.findById(req.user.id, function (err, user) {
        if (err) {
          console.log(err)
        } else {
          user.update({$pull: {eventsAttending: data._id}}, function (err, data2) {
            if (err) console.log(err)
          }
            )
        }
      })
    }
    req.flash('success', 'You have successfully withdrawn')
    res.redirect('/auth/profile/events')
  })
})

// ############ /auth/profile/:id ############### //
router.get('/profile/:id', isLoggedIn, function (req, res) {
  User.findById(req.params.id, function (err, foundUser) {
    if (err) console.log(err)
    else {
      addFile.find({user: req.params.id}, function (err, addFiles) {
        if (err)console.log(err)
        res.render('otherUser', {req: req.user, foundUser: foundUser, addFiles: addFiles})
      })
    }
  })
})


router.get('/events/event/:id', isLoggedIn, function (req, res) {
  eventVar
  .findById(req.params.id)
  .populate('attendees')
  .exec(function (err, event) {
    if (err) {
      console.log(err)
      return
    } else {
      console.log(event);
      res.render('publicEventList', {event: event, req: req.user})
    }
  })
})



// ############ /auth/profile/:id ############### //
router.delete('/profile/:id', function(req, res){
  console.log('the id is' + req.params.id);
  addFile.findByIdAndRemove({_id: req.params.id, }, function(err, addedFile){
    console.log('delete')
    if(err) {
      console.log(err)
      return
    } else {
      res.redirect('/auth/profile')
    }
  })
})

router.get('/logout', function (req, res) {
  req.logout()
  console.log('logged out')
  res.redirect('/')
})

module.exports = router
