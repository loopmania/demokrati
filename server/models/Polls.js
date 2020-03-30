'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');
const Votes = require('./Votes');

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
                resolve(record);
            })
            .catch(error => {
                reject(error);
            })
    })
};
Polls.inactivate = function(pollID) {
    return new Promise((resolve, reject) => {
        Polls.findActive()
            .then(result => {
                if(result[0].active === true && result[0].id === pollID) {
                    Polls.findByPk(pollID)
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

Polls.getResults = function(pollID) {
    return new Promise((resolve, reject) => {
        Polls.findActive()
            .then(result => {
                if(result[0].active === true && result[0].id === pollID) {
                    Polls.findByPk(pollID)
                        .then(record => {
                            //record.active = false;
                            //record.save();
                            const candidates = record.candidates;
                            Votes.findAll({
                                attributes: ['vote', [Sequelize.fn('COUNT', 'vote'), 'result']],
                                where: {
                                    pollId: pollID
                                },
                                group: ['vote'],
                                raw: true,
                            })
                                .then(votes => {
                                    console.log(votes);
                                    let data = {
                                        title: record.title,
                                        candidates: {}
                                    };
                                    let i = 0;
                                    let totalVotes = 0;
                                    votes.forEach(vote => totalVotes += parseInt(vote.result));
                                    data.title = record.title;
                                    candidates.forEach(candidate => {
                                        let vote = votes[i] !== undefined ? parseInt(votes[i].result) : 0
                                        data['candidates'][candidate] = {
                                            votes: vote,
                                            percentage: totalVotes !== 0 ? +((vote / totalVotes * 100).toFixed(2)) : 0
                                        }
                                        i++;
                                    });
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