const router = require('express').Router();

const dbxController = require('../controllers/dropbox.controller');

router.route('/')
    .get(dbxController.home);

router.route('/login')
    .get(dbxController.login);

router.route('/oauthredirect')
    .get(dbxController.oauthredirect);

module.exports = router;
