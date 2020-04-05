'use strict'
const express = require('express');
const socket = require('socket.io')
const path = require('path');
// modules for filesystem and ssl
const fs = require('fs');
const http = require('http');
const https = require('https');
const dotenv = require('dotenv');
const Members = require('./models/Members');
// config
dotenv.config();

/*
* custom modules area
*/
// REST-api for backend operations
const REST = require('./routes/api/rest');
const ADMIN = require('./routes/api/admin/rest');
// database: psql + sequelize
const db = require('./database/db');
// Public path
const publicPath = path.join(__dirname, '..', 'client', 'dist');

db.authenticate()
    .then(() => {
        console.log('Database connected..')
        Members.reset();
    })
    .catch(err => console.log(`Error: ${err}`));

const httpApp = express();
const app = express();

// middlewares
app.use(express.json());
const {auth} = require('./routes/auth/token');
// Oklart om detta kommer behövas på backenden?
// app.use(express.urlencoded({extended: false}));
app.use('/api', REST);
app.use('/api/admin', auth, ADMIN);
// client-side
app.use(express.static(publicPath));

const PORT = parseInt(process.env.PORT);
const PORTS = parseInt(process.env.PORTS);
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost.key'))
};
app.set('port', PORTS);

/*
httpApp.set('port', PORT);
httpApp.all('*', (req, res) => {
    const url = `https://${req.hostname}:${PORTS}${req.url}`;
    console.log(`Redirecting a unsecure request to (${url})`);
    res.redirect(307,url);
    
});

http.createServer(httpApp)
    .listen(httpApp.get('port'), () => {
        console.log(`Normal Backend started on port ${httpApp.get('port')}`);
    });
*/

const secureServer = https.createServer(httpsOptions, app)
    .listen(app.get('port'), () => {
        console.log(`Secure Backend started on port ${app.get('port')}`);
    });

const io = socket(secureServer, {
    pingTimeout: 60000,
});
ADMIN.init({io});
REST.init({io});

io.on('connection', (socket) => {
    console.log(`client ${socket.id} connected`);

    socket.on('disconnect', () => {
        console.log(`client ${socket.id} disconnected`);
    });
    socket.on('join', (room) => {
        socket.join(room, () => {
            console.log(`client ${socket.id} joined ${room}`);
        });
    })
});
