'use strict'
const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

// Credentials stored on a separate file
const rawCredentials = fs.readFileSync(path.join(__dirname, '../ssl', 'credentials.json'));
const credentials = JSON.parse(rawCredentials);

module.exports = new Sequelize(credentials.database.name, credentials.database.dev.username, credentials.database.dev.password, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});