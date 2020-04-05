'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');
const Votes = require('./Votes');
const Members = require('./Members');
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
            })
            .catch(() => {
                reject();
            })
    })
};
Polls.activate = function(poll) {
    return new Promise((resolve, reject) => {
        Polls.update({
            active: true
        },
        {
            where: {
                id: poll
            }
        })
            .then(record => {
                resolve(record);
            })
            .catch(error => {
                reject(error);
            });
    })
};
Polls.inactivate = function(pollID) {
    return new Promise((resolve, reject) => {
        Polls.update({
            active: false
        }, {
            where: {
                active: true,
                id: pollID
            }
        })
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject();
            })
    })
};

Polls.getResults = function(pollID) {
    return new Promise((resolve, reject) => {
        Polls.findActive()
            .then(result => {
                if(result[0].active === true && result[0].id === pollID) {
                    Polls.inactivate(pollID)
                        .then(() => {
                            const candidates = result[0].candidates;
                            Votes.findAll({
                                attributes: ['vote', [Sequelize.fn('COUNT', 'vote'), 'result']],
                                where: {
                                    pollId: pollID
                                },
                                group: ['vote'],
                                raw: true,
                            })
                                .then(votes => {
                                    let data = {
                                        title: result[0].title,
                                        candidates: {}
                                    };
                                    let totalVotes = 0;
                                    votes.forEach(vote => totalVotes += parseInt(vote.result));
                                    candidates.forEach(candidate => {
                                        data['candidates'][candidate] = {
                                            votes: 0,
                                            percentage: 0
                                        }
                                    })
                                    votes.forEach(({vote, result}) => {
                                        data.candidates[candidates[vote]] = {
                                            votes: parseInt(result),
                                            percentage: +((parseInt(result) / totalVotes * 100).toFixed(2))
                                        }
                                    })
                                    Members.resetVote();
                                    resolve(data);
                                })
                                .catch(error => {
                                    reject(error);
                                });
                        })
                        .catch(error => {
                            reject(error);
                        });
                }
            })
            .catch(error => {
                reject(error);
            });
    
    })
}


module.exports = Polls;