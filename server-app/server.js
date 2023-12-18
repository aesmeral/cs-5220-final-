const express = require('express');
const cookieSession = require('cookie-session');
const logger = require('morgan');
const cors = require('cors');
const mongo = require('./mongo');

const User = require('./users/user.model');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  credentials: true,
};

const cookieSessionOptions = {
  name: 'session',
  keys: ['super_secret_key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

const passportConfig = {
  clientID: '942898309732-bha8jlnenc672cjkaf3pudf60ii0mi9j.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:8080/auth/google/callback',
  scope: ['profile'],
};

const verify = async (_tokens, profile, done) => {
  console.log(profile);
  const user = await User.findOne({ username: profile.displayName, google_id: profile.id });
  if (user) {
    return done(null, user);
  } else {
    const newUser = await User.create({ username: profile.displayName, google_id: profile.id });
    return done(null, newUser);
  }
};

const app = express();

//passport
passport.use(new GoogleStrategy(passportConfig, verify));
passport.serializeUser(function (user, cb) {
  cb(null, { id: user.google_id, username: user.username, user_id: user._id });
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

// session check middleware
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({ message: 'You are not logged in!' });
}

// middlewares
app.use(cors(corsOptions));
app.use(cookieSession(cookieSessionOptions));
app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session());

app.listen(8080, async () => {
  console.log('Listening on port 8080');
  await mongo.connectDB();
});

app.get('/login', passport.authenticate('google'));
app.get('/auth/google/callback', passport.authenticate('google',{ failureRedirect: '/login', successRedirect: 'http://localhost:3000/' }));

app.post('/logout', async function (req, res) {
  req.logout();
  res.json({ message: 'You are logged out!' });
});

app.get('/ensured', ensureAuthenticated, (req, res) => {
  res.json({ message: 'You are in ensured logged in!' });
});

module.exports = app;