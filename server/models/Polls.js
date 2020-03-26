'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');

const Polls = db.define('polls', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    candidates: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
    },
    active: {
        type: Sequelize.BOOLEAN
    }
});

Polls.findActive = function() {
    return new Promise((resolve, reject) => {
        Polls.findAndCountAll({
            where: {
                active: true
            },
            raw: true
        })
            .then(result => {
                if(result.count !== 1) {
                    reject(result.count);
                } else {
                    resolve(result.rows);
                }
            });
    })
};
Polls.activate = function(poll) {
    return new Promise((resolve, reject) => {
        Polls.findByPk(poll)
            .then(record => {
                record.active = true;
                record.save();
                resolve();
            })
            .catch(error => {
                reject(error);
            })
    })
};
Polls.inactivate = function(poll) {
    Polls.findByPk(poll)
        .then(record => {
            record.active = false;
            record.save();
        })
        .catch(error => {
            console.log(error);
        });
};


module.exports = Polls;