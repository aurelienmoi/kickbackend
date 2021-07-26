const express = require('express');
const { getWebradioCoordinates } = require('../controllers/map');
const router = express.Router();
const mapCtrl = require('../controllers/map');
const authHelper = require("../helpers/authHelper");

router.get('/getCoordinates',authHelper.ProtectedRoutes, mapCtrl.getCoordinates);
router.post('/putCoordinates',authHelper.ProtectedRoutes,mapCtrl.putCoordinates);
router.get('/getCoordinates/:userId', authHelper.ProtectedRoutes,mapCtrl.getUserCoordinates);
router.get('/getRapperCoordinates',authHelper.ProtectedRoutes, mapCtrl.getRapperCoordinates);
router.get('/getBeatmakerCoordinates',authHelper.ProtectedRoutes, mapCtrl.getBeatmakerCoordinates);
router.get('/getProducerCoordinates',authHelper.ProtectedRoutes,mapCtrl.getProducerCoordinates);
router.get('/getClipmakerCoordinates',authHelper.ProtectedRoutes,mapCtrl.getClipmakerCoordinates);
router.get('/getWebradioCoordinates',authHelper.ProtectedRoutes,mapCtrl.getWebradioCoordinates);

module.exports = router;