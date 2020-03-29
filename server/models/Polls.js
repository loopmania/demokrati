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
    return new Promise((resolve, reject) => {
        Polls.findActive()
        .then(result => {
            if(result[0].active === true && result[0].id === poll) {
                Polls.findByPk(poll)
                    .then(record => {
                        record.active = false;
                        record.save();
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    })
            } else {
                reject();
            }
        })
        .catch((error) => {
            reject(error);
        })
    })
    
};


module.exports = Polls;