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

router.post('/invalidate', async (req, res) => {
    const maybeMember = req.body.id;
    const member = await Members.findByPk(maybeMember);
    if(!member) {
        return MsgHandler(res, 20, { id: maybeMember });
    };
    member.invalidate();
    return MsgHandler(res, 19, { id: maybeMember });
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