const express = require ('express');
const router = express.Router();
const authHelper = require("../helpers/authHelper");
const messageCtrl = require ( '../controllers/message');


router.post('/chat-messages/:sender_Id/:receiver_Id',authHelper.ProtectedRoutes,messageCtrl.sendMessage); //ProtectedRoutes we need to add protected route as middleware for this route and the other ones ! 
router.get('/chat-messages/:sender_Id/:receiver_Id',authHelper.ProtectedRoutes,messageCtrl.getAllMessages);
//router.get('/chat-messages/getUserConversations',authHelper.ProtectedRoutes,messageCtrl.getUserConversations);
router.get('/chat-messages/getUserConversations', authHelper.ProtectedRoutes, messageCtrl.getUserConversations);
module.exports = router;