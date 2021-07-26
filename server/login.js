const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override')
const cors = require('cors');

const jwt = require('jsonwebtoken');
const config = require('./config/config');

const url = require('url');
// ---------------------------------------

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');
const options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem'),
  ca: fs.readFileSync('chain.pem')
};
// TUTO PATRICK MONGODB
const _ = require('lodash');
const mongoose = require('mongoose');
const dbConfig = require('./config/secret');
const message = require('./routes/messageRoutes');
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoutes');
const like = require('./routes/likesRoutes')
const posts = require('./routes/postRoutes')
const server = require('https').createServer(options, app);
const io = require('socket.io').listen(server);
require('./socket/private')(io);
const { User } = require('./helpers/userClass');
const trackRoute = require('./routes/musicRoute');
const map = require('./routes/mapRoute');

require('./socket/streams')(io, User, _);
mongoose.Promise = global.Promise;
mongoose.connect(
  dbConfig.url,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.set('useFindAndModify', false); //sets down a deprecation warning about user.findAndUpdate
app.use('/chatApp', auth);
app.use('/chatApp', message);
app.use('/chatApp', users);
app.use('/chatApp', friends);
app.use('/tracks', trackRoute);
app.use('/chatApp', map);
app.use('/chatApp', like);
app.use('/chatApp', posts);
app.use(express.json());


app.post('/chatApp/testParsing', function (req) {
  console.log(req.body);
})

//---------------------------------------Verification du token-----------------------------------

const ProtectedRoutes = express.Router();
app.use('/api', ProtectedRoutes);

ProtectedRoutes.use((req, res, next) => {


  // check header for the token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || (req.body.data && req.body.data.token); // delete the 2nd ?

  // decode token
  if (token) {

    //console.log(token, "token reconnu");
    // verifies secret and checks if the token is expired
    jwt.verify(token, 'worldisfullofdeveloppers', (err, decoded) => {
      if (err) {
        let loggedIn = false;
        return res.status(500).json({ message: 'invalid token', loggedIn, err });

      } else {
        //console.log('token validé par la street');
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();

      }
    });

  } else {

    // if there is no token  

    res.status(500).json({

      message: 'No token provided.'
    });

  }


});
//---------------------------------- music streaming----------------

//----------------------Test token routes-------------------------------------


app.post('/testToken', ProtectedRoutes, function (req, res) {


  console.log(req.decoded);
  let username = req.decoded.username;
  console.log(username);
  res.send({ id: req.decoded.id, loggedIn: true, username: req.decoded.username, isBeatmaker: req.decoded.isBeatmaker, bio: req.decoded.bio, registrationDate: req.decoded.registrationDate, following: req.decoded.following, followers: req.decoded.followers, pseudo: req.decoded.pseudo, roles: req.decoded.roles });



});
//-----------------------SNAPCHAT TESTING POGGIES ---------------------



const passport = require('passport');
const SnapchatStrategy = require('passport-snapchat').Strategy;

process.env.CLIENT_ID = "27afbed1-958b-44be-8c13-fefa4cb8f533"
process.env.CLIENT_SECRET = "ebcu7HHTA6uNFe_dSG0_9fYDq4xqSo5DUaGyeqXms9w"
process.env.SESSION_SECRET = "whatever"




// Configure the Snapchat strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Snapchat API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authorization.
passport.use(new SnapchatStrategy({
  clientID: config.CLIENT_ID || process.env.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET || process.env.CLIENT_SECRET,
  callbackURL: 'https://kickserver.xyz/login/snapchat/callback',
  profileFields: ['id', 'displayName', 'bitmoji'],
  scope: ['user.display_name', 'user.bitmoji.avatar'],
  pkce: true,
  state: true
},
  function (accessToken, refreshToken, profile, cb) {
    // In this example, the user's Snapchat profile is supplied as the user
    // record.  In a production-quality application, the Snapchat profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authorization with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authorization state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Snapchat profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});



// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: config.SESSION_SECRET || process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// Initialize Passport and restore authorization state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.

app.get('/login/snapchat',
  passport.authenticate('snapchat'));

app.get('/login/snapchat/callback',
  passport.authenticate('snapchat', { failureRedirect: 'http://kickapp.app/home' }),
  function (req, res) {
    console.log(req.user);


    res.redirect(url.format({
      pathname: "/snapRegisterTest",
      query: {
        "userId": req.user.id,
        "userAvatarId" : req.user.bitmoji.avatarId,
        "userAvatarUrl" : req.user.bitmoji.avatarUrl,
        "userPseudo" : req.user.displayName

      }
    }))


  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render('profile', { user: req.user });
  });









server.listen(process.env.PORT || 443);















/*

the email router looks like

import express from "express"
import * as emailController from "./email.controller"

export const emailRouter = express.Router()

emailRouter.route("/user/:email").post(emailController.sendPasswordResetEmail)

emailRouter
.route("/receive_new_password/:userId/:token")
.post(emailController.receiveNewPassword)

*/
// and need to do the client side tho :x
