'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');
const Votes = db.define('votes', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: 'polls',
        referencesKey: 'pollId'
    },
    vote: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Votes;
