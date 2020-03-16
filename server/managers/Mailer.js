'use strict'
const nodemailer = require("nodemailer");
const path = require('path');
const fs = require('fs');

const rawCredentials = fs.readFileSync(path.join(__dirname, '../ssl', 'credentials.json'));
const credentials = JSON.parse(rawCredentials);

let transport = nodemailer.createTransport({
    host: credentials.mail.host,
    port: credentials.mail.port,
    auth: credentials.mail.auth
  });
  module.exports = transport;