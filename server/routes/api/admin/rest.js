'use strict'
const Sequelize = require('sequelize');
const Joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// models
const Members = require('../../../models/Members');

// managers
const Mailer = require('../../../managers/Mailer');
const {validEmail, validCode} = require('../../../managers/Validator');

// middleware
const {auth, refreshAuth} = require('../../auth/token');

router.post('/invalidate', auth, async (req, res) => {
    if(!req.user.admin) {
        return res.status(403).json({
            status: 'bad',
            code: 12,
            msg: `No admin-user found on client`
        });
    }
    const maybeMember = req.body.id;
    const member = await Members.findByPk(maybeMember);
    if(!member) {
        return res.status(400).json({
            status: 'bad',
            code: 12,
            msg: `Member with id ${maybeMember} doesn't exist`
        });
    };
    member.invalidate();
    return res.status(200).json({
        status: 'success',
        code: 13,
        msg: `Member with id ${maybeMember} session has been invalidated`
    });
});
module.exports = router;