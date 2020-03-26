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

router.post('/invalidate', async (req, res) => {
    const maybeMember = req.body.id;
    const member = await Members.findByPk(maybeMember);
    if(!member) {
        return MsgHandler(res, 20, { id: maybeMember });
    };
    member.invalidate();
    return MsgHandler(res, 19, { id: maybeMember });
});

router.put('/invokePoll', (req, res) => {
    const poll = req.body.pollID;
    Polls.findActive()
        .then(error => {
            if(error.length > 0) {
                console.log(error);
                return MsgHandler(res, 22);
            }
        })
        .catch(result => {
            Polls.activate(poll)
                .then(() => {
                    exports.io.to('sm').emit('invokePoll');
                    return res.sendStatus(200);
                })
                .catch(error => {
                    console.log(error);
                });
        });
});

router.get('/inactivate', (req, res) => {
    Polls.findActive()
        .then(record => {
            record.active = false;
            record.save();
            exports.io.to('sm').emit('inactivate');
            return res.sendStatus(200);
        })
        .catch(error => {
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