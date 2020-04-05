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
    name: {
        type: Sequelize.STRING
    },
    searchname:{
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
    },
    attendance: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    }
});

Members.findByEmail = function(email) {
    return Members.findOne({
        where: {
            email: email
        },
    });
};
Members.resetVote = function() {
    Members.update({
        has_voted: false
    },
    {
        where: {
            has_voted: true
        }
    })
};
Members.reset = function() {
    Members.update({
        signed_in: false,
        present: false
    },
    {
        where: {
            signed_in: true,
            present: true
        }
    })
};
Members.hasVoted = function() {
    return new Promise((resolve, reject) => {
        Members.findAll({
            attributes: ['has_voted', [Sequelize.fn('COUNT', 'has_voted'), 'result']],
            group: ['has_voted'],
            where: {
                signed_in: true
            },
            raw: true
        })
            .then(members => {
                let data = [];
                let totalMembers = 0;
                members.forEach(member => totalMembers += parseInt(member.result));
                members.forEach(member => data.push({
                    hasVoted: member.has_voted,
                    percentage: +((parseInt(member.result) / totalMembers * 100).toFixed(2))
                }));
                resolve(data);
            })
            .catch(() => {
                reject();
            })
    })
    
}

Members.prototype.activate = function() {
    /*
    * Generates a randomized code,
    * then stores it to the instance,
    * for later validation.
    */
   return new Promise((resolve,reject) => {
        Words.generateCode()
            .then(code => {
                Members.update({
                        temp_pass: code
                    }, {
                        where: {
                            email: this.email,
                            present: !this.admin,
                            signed_in: false
                        },
                        returning: true
                    })
                        .then(result => {
                            if(result[0] === 1) {
                                resolve(result[1][0]);
                            } else {
                                reject(this);
                            }
                        });
            });
   })
    
};
Members.prototype.inactivate = function() {
    return Members.update({
        present: false,
        signed_in: false,
        temp_pass: null,
    }, {
        where: {
            id: this.id,
            present: !this.admin,
            signed_in: true,
            email: this.email,
        }
    })
};
Members.prototype.getCode = function() {
    return this.temp_pass;
};
Members.prototype.signIn = function() {
    this.signed_in = true;
    this.temp_pass = null;
    this.save();
};

Members.prototype.setAttendance = function() {
    const date = new Date();
    const month = Number(date.getMonth() + 1);
    let data = [];
    if(this.attendance !== null) {
        this.attendance.forEach(att => data.push(att))
    }
    if(month === 8 || month === 9) {
        if(!data.includes('SM1')) {
            data.push('SM1');
        }
    }
    if(month === 10 || month === 11) {
        if(!data.includes('SM2')) {
            data.push('SM2');
        }
    }
    if(month === 1 || month === 2) {
        if(!data.includes('SM3')) {
            data.push('SM3');
        }
    }
    if(month === 3 || month === 4) {
        if(!data.includes('SM4')) {
            data.push('SM4');
        }
    }
    if(month >= 5 && month <= 7) {
        if(!data.includes('SMX')) {
            data.push('SMX');
        }
    }
    this.attendance = data;
    this.save();
    
    
}
Members.prototype.isAdmin = function() {
    return this.admin;
};
Members.prototype.setRefreshToken = function(token) {
    Members.update({
        refresh_token: token
    }, {
        where: {
            id: this.id,
            signed_in: true,
            present: !this.admin
        }
    })
};
Members.prototype.hasVoted = function() {
    return this.has_voted;
};
Members.prototype.vote = function() {
    return new Promise((resolve, reject) => {
        Members.update({
            has_voted: true
        }, {
            where: {
                has_voted: false,
                id: this.id,
                present : !this.admin,
                signed_in: true,
            }
        })
            .then(result => {
                if(result[0] === 1) {
                    resolve();
                } else {
                    reject();
                }
            });
        })
};


module.exports = Members;
