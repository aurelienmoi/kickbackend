const express = require("express");
const router = express.Router();
const userCtrl = require('../controllers/users');
const authHelpers = require("../helpers/authHelper");

router.get("/users", authHelpers.ProtectedRoutes, userCtrl.getAllUsers);
router.get("/users/:id", authHelpers.ProtectedRoutes, userCtrl.getUser);
router.get("/users/username/:username", authHelpers.ProtectedRoutes, userCtrl.getUserByName);
router.get("/getUserMusics/:id", userCtrl.getUserMusics);
router.get("/getUserAvatar/:userId", userCtrl.getUserAvatar);  //change it to post and protect the route
router.post("/changeBio", authHelpers.ProtectedRoutes,  userCtrl.changeBio);
router.post("/changePseudo", authHelpers.ProtectedRoutes, userCtrl.changePseudo);
router.get('/confirmEmail/:token', userCtrl.confirmEmail);
router.get('/emailConfirmed',userCtrl.emailConfirmed);
router.post('/reset-password',userCtrl.resetPassword);
router.post("/receive_new_password/:userId/:token",userCtrl.receiveNewPassword);
router.post('/changeEmail', authHelpers.ProtectedRoutes, userCtrl.changeEmail);
router.post('/getUserPlaylist', userCtrl.getUserPlaylist);
router.post('/changeAvatar',authHelpers.ProtectedRoutes,userCtrl.changeAvatar);

module.exports = router;