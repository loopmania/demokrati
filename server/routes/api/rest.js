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
const {auth} = require('../auth/token');

router.get('/members', (req, res) => {
    Members.findAll()
        .then(members => {
            console.log(members);
            res.sendStatus(200);
        })
        .catch(err => console.log(err));
});

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
    console.log(member.temp_pass);
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
    jwt.sign({email: maybeEmail}, process.env.TOKEN_SECRET, {expiresIn: '6h'},(err, token) => {
        res.status(200).json({
            status: 'success',
            code: 1,
            token: token,
            msg: `A validation email has been sent to ${maybeEmail}`,
            code: member.getCode()
        });
    });
});

router.post('/verify', auth, (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_SECRET, async (err, authData) => {
        if(err) {
            res.status(401).json({
                status: 'bad',
                code: 5,
                msg: 'Tempered token. Access denied.'
            });
        };
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
        const email = authData.email;
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
        
        res.status(200).json({
            status: 'success',
            code: 6,
            msg: 'Welcome'
        });
    })
})

module.exports = router;