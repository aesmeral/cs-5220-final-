// server.js
const express = require('express');
const session = require('express-session')
const logger = require('morgan');
const cors = require('cors');
const mongo = require('./mongo');

const User = require('./users/user.model');


/* Create Express App */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc')

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}

const sessionOptions = {
  secret: 'super_secret_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  name: 'test-server-app'
}


const app = express();
app.use(cors(corsOptions));
app.use(session(sessionOptions))
app.use(logger('dev'));

passport.use(new GoogleStrategy({
  clientID: '942898309732-bha8jlnenc672cjkaf3pudf60ii0mi9j.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:8080/auth/google/callback',
  scope: [ 'profile' ]
}, async function verify(_issuer, profile, cb) {
  const user = await User.findOne({ username: profile.displayName });
  if (user) {
    return cb(null, user);
  }
  const newUser = await User.create({ username: profile.displayName });
  return cb(null, newUser);
}));

app.listen(8080, async () => {
  console.log("Listening on port 8080");
  await mongo.connectDB();
});

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.get('/login', passport.authenticate('google'));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Successful authentication, redirect or respond as needed
  res.redirect('http://localhost:3000/')
});


module.exports = app;