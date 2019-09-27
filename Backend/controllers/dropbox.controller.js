const crypto = require('crypto');
const NodeCache = require('node-cache');
const requestPromise = require('request-promise');

const config = require('../config');

const myCache = new NodeCache();


async function getFilenamesAsync(token) {
    const result = await listFilePathsAsync(token, '');
    const temporaryLinkResults = await getTemporaryLinksForPathsAsync(token,result.paths);
    const links = temporaryLinkResults.map(entry => entry.metadata.name);

    return links;
}

async function listFilePathsAsync(token, path) {
    const options = {
        url: config.DBX_API_DOMAIN + config.DBX_LIST_FOLDER_PATH,
        headers: {'Authorization': 'Bearer ' + token},
        method: 'POST',
        json: true,
        body: {'path': path}
    }

    try {
        const result = await requestPromise(options);
        
        const paths = result.entries.map(entry => entry.path_lower);
        const response = {}

        response.paths = paths;
        if (result.hasmore) response.cursor = result.cursor;
        return response;
    }
    catch (err) {
        return next(new Error('error listing folder. ' + err.message));
    }
}

async function getTemporaryLinksForPathsAsync(token, paths) {
    let options = {
        url: config.DBX_API_DOMAIN + config.DBX_GET_TEMPORARY_LINK_PATH,
        headers: {'Authorization': 'Bearer ' + token},
        method: 'POST',
        json: true
    }

    const promises = paths.map(path => {
        options.body = {'path': path};
        return requestPromise(options);
    });

    return Promise.all(promises);
}

const home = async (req, res) => {
    let token = myCache.get('aTempTokenKey');
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

    myCache.set(state, 'aTempSessionValue', 600);

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
    if (!myCache.get(state)) {
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

        myCache.set('aTempTokenKey', response.access_token, 3600);
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