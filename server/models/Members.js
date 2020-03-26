'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');
const Words = require('./Words');

const Members = db.define('members', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    },
    admin: {
        type: Sequelize.BOOLEAN
    },
    refresh_token: {
        type: Sequelize.STRING
    },
    has_voted: {
        type: Sequelize.BOOLEAN
    }
});

Members.findByEmail = function(email) {
    return Members.findOne({
        where: {
            email: email
        }
    });
};

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
Members.prototype.isAdmin = function() {
    return this.admin;
};
Members.prototype.setRefreshToken = function(token) {
    this.refresh_token = token;
    this.save();
};
Members.prototype.invalidate = function() {
    this.temp_pass = null;
    this.present = false;
    this.signed_in = false;
    this.refresh_token = null;
    this.hasVoted = false;
    this.save();
};
Members.prototype.hasVoted = function() {
    return this.has_voted;
};
Members.prototype.vote = function() {
    this.has_voted = true;
    this.save();
};


module.exports = Members;