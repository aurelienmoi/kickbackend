const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/posts');
const authHelper = require("../helpers/authHelper");

router.post('/post/addPost',authHelper.ProtectedRoutes, postCtrl.addPost);
router.get('/posts',authHelper.ProtectedRoutes,postCtrl.getAllPosts);
router.get('/posts/:id',authHelper.ProtectedRoutes, postCtrl.getPost)
router.post('/post/addLike',authHelper.ProtectedRoutes,postCtrl.addLike);
router.post('/post/addComment',authHelper.ProtectedRoutes,postCtrl.addComment);
module.exports= router;