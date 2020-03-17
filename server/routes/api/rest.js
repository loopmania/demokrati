'use strict'
const Sequelize = require('sequelize');
const Joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// models
const Members = require('../../models/Members');
const Words = require('../../models/Words');

// managers
const Mailer = require('../../managers/Mailer');
const {validEmail, validCode} = require('../../managers/Validator');

// middleware
const {auth, refreshAuth} = require('../auth/token');

router.post('/activate', async (req, res) => {
    const {error} = validEmail(req.body);
    if(error) {
        return res.status(400).json({
            status: 'bad',
            code: 3,
            msg: `Cannot validate email. \
            Please make sure you use a valid \
            email provided by KTH`
        });
    }

    const maybeEmail = req.body.email;
    /*
    * Checks if email of member is
    * apart of database of valid 
    * THS members-register
    */
    const member = await Members.findOne({
        where: {
            email: maybeEmail,
            present: false
        }
    });
    if (!member) {
        return res.status(400).json({
            status: 'bad',
            code: 2,
            msg: `It seems like you are \
            not registered as a THS member, \
            please contact Valberedningen or IT`
        });
    };
    /*
    * Start a validation process
    * to allow the user to
    * sign in via validating their email
    */
    await member.activate();
    // check whether member is admin or regular
    const message = {
        from: 'noreply@iare.se',
        to: `${maybeEmail}`,
        subject: `Your Temporary Demokrati \
        Login Code`,
        html: `<b>${member.getCode()}</b>`
        // To-do: style email html
    };
    /*Mailer.sendMail(message, (err, info) => {
        if(err) {
            console.log(err);
        } else {
            console.info(info);
        }
    });
    */
   let payload = {
    email: maybeEmail
   };
    if(member.isAdmin()) {
        payload.admin = {
            foo: 'bar'
        }
    };
    jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '25m'},(err, token) => {
        res.status(200).json({
            status: 'success',
            code: 1,
            token: token,
            msg: `A validation email has been sent to ${maybeEmail}`,
            code: member.getCode()
        });
    });
});

router.post('/verify', auth, async (req, res) => {
    const {error} = validCode(req.body);
    if(error) {
        return res.status(400).json({
            status: 'bad',
            code: 7,
            msg: `The temporary login code \
            is invalid. Check your inbox.`
        });
    };
    const tempCode = req.body.temp_pass;
    const email = req.user.email;
    const member = await Members.findOne({
        where: {
            email: email,
            present: false,
            temp_pass: tempCode
        }
    });
    if(!member) {
        return res.status(400).json({
            status: 'bad',
            code: 7,
            msg: `The temporary login code \
            is invalid. Check your inbox.`
        });
    };
    await member.signIn();
    jwt.sign(req.user, process.env.REFRESH_TOKEN_SECRET, async (err, token) => {
        await member.setRefreshToken(token);
        res.status(200).json({
            status: 'success',
            code: 6,
            refreshToken: token,
            msg: 'Welcome',
            payload: req.user
        });
    });
});

router.post('/refresh', refreshAuth, async (req, res) => {
    const refreshToken = req.headers['authorization'];
    const member = await Members.findByEmail(req.user.email);
    if(refreshToken == null) {
        return res.status(403).json({
            status: 'bad',
            code: 8,
            msg: `refreshToken is not authorized.`
        });
    };
    if(!req.user) {
        return res.status(401).json({
            status: 'bad',
            code: 9,
            msg: `No user found on client`
        });
    };
    if(!member) {
        return res.status(400).json({
            status: 'bad',
            code: 10,
            msg: `No user found in db`
        });
    };
    if(member.refresh_token !== refreshToken) {
        return res.status(403).json({
            status: 'bad',
            code: 8,
            msg: `refreshToken is not authorized.`
        });
    };
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.status(403).json({
                status: 'bad',
                code: 8,
                msg: `refreshToken is not authorized.`
            });
        };
        let payload = {
            email: user.email
        };
        if(member.isAdmin()) {
            payload.admin = {
                foo: 'bar'
            };
        };
        jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '25m'},(err, token) => {
            res.status(200).json({
                status: 'success',
                code: 11,
                token: token,
                msg: `Token extended with 25 minutes`
            });
        });
    });
});

module.exports = router;