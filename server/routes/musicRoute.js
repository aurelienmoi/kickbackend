const express = require("express");
const trackRoute = express.Router();
const  authHelper = require ("../helpers/authHelper");
const musicCtrl = require ( '../controllers/music');
/**
 * NodeJS Module dependencies.
 */


trackRoute.post('/',authHelper.ProtectedRoutes, musicCtrl.uploadMusic); // ADD PROTECTEDROUTE 
trackRoute.get('/:trackID', musicCtrl.getMusic);
trackRoute.post('/addToPlaylist',authHelper.ProtectedRoutes,musicCtrl.addToPlaylist);
trackRoute.post('/deleteFromPlaylist',authHelper.ProtectedRoutes,musicCtrl.deleteFromPlaylist);
trackRoute.post('/deleteFromLibrary', authHelper.ProtectedRoutes, musicCtrl.deleteFromLibrary);

module.exports = trackRoute;