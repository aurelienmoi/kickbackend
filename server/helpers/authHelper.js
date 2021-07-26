const express = require('express');
const ProtectedRoutes = express.Router();
const jwt = require('jsonwebtoken');
const user = require('../Models/userModels');
const config = require('../config/config');
module.exports =
{

    ProtectedRoutes: ((req, res, next) => {
        const authorisation = req.get('x-access-token');

        // check header for the token
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || (req.body.data && req.body.data.token) || authorisation// delete the 2nd ?

        // decode token
        if (token) {

          //  console.log(token, "token reconnu");
            // verifies secret and checks if the token is expired
            jwt.verify(token, 'worldisfullofdeveloppers', (err, decoded) => {
                if (err) {
                    let loggedIn = false;
                    return res.json({ message: 'invalid token', loggedIn, err });

                } else {
                  //  console.log('token validé par la street');
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();

                }
            });

        } else {

            // if there is no token  

            res.send({

                message: 'No token provided.'
            });

        }


    }),


}