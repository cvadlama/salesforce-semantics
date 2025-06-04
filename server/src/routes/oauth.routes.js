const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth.controller');

// OAuth routes
router.get('/authorize', oauthController.authorize);
router.get('/callback', oauthController.callback);
router.get('/settings', oauthController.authSettings);
router.post('/set-mode', express.urlencoded({ extended: true }), oauthController.setAuthMode.bind(oauthController));

module.exports = router;
