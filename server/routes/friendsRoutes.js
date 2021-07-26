const express = require('express');
const router = express.Router();
const friendCtrl = require('../controllers/friends.js');
const authHelper = require("../helpers/authHelper");

router.post('/follow-user', authHelper.ProtectedRoutes, friendCtrl.followUser);
router.post('/unfollow-user', authHelper.ProtectedRoutes, friendCtrl.unfollowUser);
router.post('/mark/:id', authHelper.ProtectedRoutes, friendCtrl.markNotification);
router.get('/getUserFollowers', authHelper.ProtectedRoutes,friendCtrl.getUserFollowers);
router.get('/getUserFollowing', authHelper.ProtectedRoutes,friendCtrl.getUserFollowing);
module.exports = router;