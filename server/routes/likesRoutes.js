const express = require('express');
const router = express.Router();
const likeCtrl = require('../controllers/like');
const authHelper = require("../helpers/authHelper");


router.post('/likeMusic',authHelper.ProtectedRoutes,likeCtrl.likeMusic)
router.post('/dislikeMusic', authHelper.ProtectedRoutes, likeCtrl.dislikeMusic)
router.post('/getUserLikes/:id', authHelper.ProtectedRoutes, likeCtrl.getUserLikes)

module.exports = router;