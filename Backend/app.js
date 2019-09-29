const config = require('./config');

const express = require('express');
const redis = require('redis');
const crypto = require('crypto');
const sessions = require('express-sessions');
const session = require('express-session');

const app = express();
const redisClient = redis.createClient();

const port = process.env.PORT || 5000;
const sessionsStore = new sessions({
    storage: 'redis',
    instance: redisClient,
    collection: 'sessions'
});
const sess = {
    secret: config.SESSION_ID_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: true, // maybe should be true
    store: sessionsStore,
    genid: req => crypto.randomBytes(16).toString('hex'),
}

app.use(session(sess));

app.get('/', (req, res) => res.send('Hello World with Express'));

const dbxRoute = require('./routes/dropbox.router');
app.use('/dropbox', dbxRoute);

app.listen(port, () => {
    console.log('Server is running on http://localhost:' + port);
});