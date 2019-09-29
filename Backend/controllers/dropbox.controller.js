const crypto = require('crypto');
const NodeCache = require('node-cache');

const config = require('../config');
const { getFilenamesAsync } = require('./actions/dropbox.action');

const myCache = new NodeCache();

function regenerateSessionAsync(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate(err => {
            err ? reject(err) : resolve();
        });
    });
}

const home = async (req, res) => {
    let token = req.session.token;
    if (token) {
        const filenames = await getFilenamesAsync(token);
        res.send(filenames);
    }
    else {
        res.redirect('/dropbox/login');
    }
}

const login = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');

    myCache.set(state, req.sessionID, 600);

    const dbxRedirect = config.DBX_OAUTH_DOMAIN
        + config.DBX_OAUTH_PATH
        + "?response_type=code&client_id=" + config.DBX_APP_KEY
        + "&redirect_uri=" + config.OAUTH_REDIRECT_URL
        + "&state=" + state;

    res.redirect(dbxRedirect);
}

const oauthredirect = async (req, res, next) => {
    if (req.query.error_description) {
        return next(new Error(req.query.error_description))
    }

    let state = req.query.state;
    if (myCache.get(state) !== req.sessionID) {
        return next(new Error('Session expired or invalid state'));
    }

    const options = {
        url: config.DBX_OAUTH_DOMAIN + config.DBX_TOKEN_PATH,
        qs: {
            'code': req.query.code,
            'grant_type': 'authorization_code',
            'client_id': config.DBX_APP_KEY,
            'client_secret': config.DBX_APP_SECRET,
            'redirect_uri': config.OAUTH_REDIRECT_URL
        },
        method: 'POST',
        json: true
    };

    try {
        const response = await requestPromise(options);

        await regenerateSessionAsync(req);
        req.session.token = response.access_token;

        res.redirect('/dropbox');
    }
    catch (error) {
        return next(new Error('error getting token. ' + error.message));
    }
}

module.exports = {
    home,
    login,
    oauthredirect
}