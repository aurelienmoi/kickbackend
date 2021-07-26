const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const snapHelper = require('../helpers/snapAuthHelper');


router.post ('/registerMongoDB', authController.createUser);
router.post('/login',authController.loginUser);
router.post('/registerTest', snapHelper.snapAuth, authController.testRegister)


module.exports = router;