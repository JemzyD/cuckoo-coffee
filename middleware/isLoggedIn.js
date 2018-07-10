
module.exports = function(req, res, next){
  if(req.isAuthenticated()) return next()
  req.flash('error', 'Please log in to access this page')
  res.redirect('/auth/login')
}
