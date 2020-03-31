'use strict'
const Sequelize = require('sequelize');
const Joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// models
const Members = require('../../../models/Members');
const Polls = require('../../../models/Polls');
/*
const Votes = require('../../../models/Votes');
*/
// Managers
const MsgHandler = require('../../../managers/MsgHandler');
// inits
exports.io = undefined;

router.use((req, res, next) => {
    if(!req.user.admin) {
        return MsgHandler(res, 21);
    } else {
        console.log('authenticated');
        next();
    }
})

router.get('/me', (req, res) => {
    return MsgHandler(res, 23);
});

router.post('/invalidateMember', async (req, res) => {
    const maybeMember = req.body.member;
    //const member = await Members.findByPk(maybeMember);
    const member = await Members.findOne({
        where: {
            email: maybeMember
        }
    });
    if(!member) {
        return MsgHandler(res, 20, { id: maybeMember });
    };
    member.invalidateMember();
    return MsgHandler(res, 19, { id: maybeMember });
});

router.post('/addValidMember', async (req, res) => {
    const maybeMember = req.body.member;
    console.log(maybeMember);
    const member = await Members.findOne({
        where: {
            email: maybeMember
        }
    });
    if(!member){
        return MsgHandler(res, 37, { id: maybeMember });
    }
    member.validateMember();
    return MsgHandler(res, 36, { id: maybeMember });

    // här måste man skilja på ifall det var en tidigare THS medlem eller ej?? Finns i members redan eller inte
});

router.get('/validMembers', (req, res) => {
    Members.findAll({
        where: {
            present: true
        }
    })
        .then((members) => {
            return MsgHandler(res, 38, {members: members});
        })
        .catch(() => {
            return MsgHandler(res, 39);
        })
});

router.get('/invalidMembers', (req, res) => {
    Members.findAll({
        where: {
            present: false
        }
    })
        .then((members) => {
            return MsgHandler(res, 40, {members: members});
        })
        .catch(() => {
            return MsgHandler(res, 41);
        })
});

router.post('/createPoll', (req,res) => {
    const poll = req.body.poll;
    const candidates = `{${poll.candidates.join(',')}}`;
    Polls.create({
        title: poll.title,
        candidates: poll.candidates
    })
        .then(() => {
            exports.io.to('admin').emit('refreshPolls');
            return MsgHandler(res, 28);
        })
        .catch(() => {
            return MsgHandler(res, 29);
        })

});

router.get('/polls', (req, res) => {
    Polls.findAll({
        attributes: ['id','title', 'candidates','active']
    })
        .then((polls) => {
            return MsgHandler(res, 30, {polls: polls});
        })
        .catch(() => {
            return MsgHandler(res, 31);
        })
});

router.put('/invokePoll', (req, res) => {
    const poll = req.body.pollID;
    Polls.findActive()
        .then(error => {
            if(error.length > 0) {
                return MsgHandler(res, 22);
            }
        })
        .catch(() => {
            Polls.activate(poll)
                .then((result) => {
                    exports.io.to('sm').emit('invokePoll');
                    exports.io.to('admin').emit('refreshPolls');
                    return MsgHandler(res, 32, {title: result.title});
                })
                .catch(error => {
                    return MsgHandler(res, 33);
                });
        });
});

router.put('/results', (req, res) => {
    return new Promise((resolve, reject) => {
        const poll = req.body.pollID;
        Polls.getResults(poll)
            .then(votes => {
                return MsgHandler(res, 34, { votes: votes});
            })
            .catch(error => {
                return MsgHandler(res, 35);
            });
    })

})

router.put('/inactivate', (req, res) => {
    const poll = req.body.pollID;
    Polls.inactivate(poll)
        .then(() => {
            exports.io.to('sm').emit('inactivate');
            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error);
        });
})

router.get('/refresh', (req, res) => {
    exports.io.to('sm').emit('refresh');
    res.sendStatus(200);
});

module.exports = router;
module.exports.init = ({ io }) => {
    exports.io = io;
};
