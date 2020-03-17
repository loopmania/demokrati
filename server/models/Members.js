'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');
const Words = require('./Words');

const Members = db.define('members', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING
    },
    temp_pass: {
        type: Sequelize.STRING
    },
    amount_of_times: {
        type: Sequelize.INTEGER
    },
    present: {
        type: Sequelize.BOOLEAN
    },
    signed_in: {
        type: Sequelize.BOOLEAN
    }
});

Members.prototype.activate = async function() {
    /*
    * Generates a randomized code,
    * then stores it to the instance,
    * for later validation.
    */
    const code = await Words.generateCode();
    this.present = false; // change later to true
    this.temp_pass = code;
    this.save();
};
Members.prototype.getCode = function() {
    return this.temp_pass;
};
Members.prototype.signIn = async function() {
    this.signed_in = false; // change later to true
    this.save();
};

module.exports = Members;