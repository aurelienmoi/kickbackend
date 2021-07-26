const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const url = require ('url');
const SnapchatStrategy = require('passport-snapchat').Strategy;
process.env.CLIENT_ID = "27afbed1-958b-44be-8c13-fefa4cb8f533"
process.env.CLIENT_SECRET = "ebcu7HHTA6uNFe_dSG0_9fYDq4xqSo5DUaGyeqXms9w"
process.env.SESSION_SECRET = "whatever"

var app = express();



module.exports = {

    snapAuth: ((req, res, next) => {

        if (req.body.authWithSnap == true) {

            console.log("wants to authwithsnap")
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
            app.use(passport.initialize());
            app.use(passport.session());

            passport.authenticate('snapchat')
            app.get('/login/snapchat/callback',
                passport.authenticate('snapchat', { failureRedirect: '/login' }),
                function (req, res) {
                
                    res.redirect(url.format({
                        pathname: "/snapRegisterRRRRRR",
                        query : {
                            "user" : req.user
                        }
                    }));
                });
        }
        else {
            next();
        }

    }),




}