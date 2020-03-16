'use strict'
const express = require('express');
const path = require('path');
// modules for filesystem and ssl
const fs = require('fs');
const https = require('https');

/*
* custom modules area
*/
// REST-api for backend operations
const REST = require('./routes/api/rest');
// database: psql + sequelize
const db = require('./database/db');

db.authenticate()
    .then(() => console.log('Database connected..'))
    .catch(err => console.log(`Error: ${err}`));

const app = express();

app.use(express.json());
// Oklart om detta kommer behövas på backenden?
app.use(express.urlencoded({extended: false}));
app.use('/api', REST);

const PORT = process.env.PORT || 5000;
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

https.createServer(httpsOptions, app)
    .listen(PORT, () => {
        console.log(`Backend started on port ${PORT}`)
    });