const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));

const dbxRoute = require('./routes/dropbox');
app.use('/dropbox', dbxRoute);
app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});