const requestPromise = require('request-promise');

const config = require('../../config');

async function getFilenamesAsync(token) {
    const result = await listFilePathsAsync(token, '');
    const temporaryLinkResults = await getTemporaryLinksForPathsAsync(token, result.paths);
    const links = temporaryLinkResults.map(entry => entry.metadata.name);

    return links;
}

async function listFilePathsAsync(token, path) {
    const options = {
        url: config.DBX_API_DOMAIN + config.DBX_LIST_FOLDER_PATH,
        headers: { 'Authorization': 'Bearer ' + token },
        method: 'POST',
        json: true,
        body: { 'path': path }
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
        headers: { 'Authorization': 'Bearer ' + token },
        method: 'POST',
        json: true
    }

    const promises = paths.map(path => {
        options.body = { 'path': path };
        return requestPromise(options);
    });

    return Promise.all(promises);
}

module.exports = {
    getFilenamesAsync
}