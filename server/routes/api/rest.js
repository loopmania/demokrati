'use strict'
const Sequelize = require('sequelize');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

// models
const Members = require('../../models/Members');
const Words = require('../../models/Words');

// managers
const Mailer = require('../../managers/Mailer');

router.get('/members', (req, res) => {
    Members.findAll()
        .then(members => {
            console.log(members);
            res.sendStatus(200);
        })
        .catch(err => console.log(err));
});

router.post('/activate', (req, res) => {
    /*
    * Joi validation for 
    * email with kth.se as domain
    */
    const schema = {
        email: Joi.string().email().regex(/@kth.se$/).required()
    };
    const result = Joi.validate(req.body, schema);
    if(result.error) {
        res.status(400).json({
            status: 'bad',
            code: 3,
            msg: `Cannot validate email. \
            Please make sure you use a valid \
            email provided by KTH`
        })
        return;
    }

    const maybeEmail = result.value.email;
    /*
    * Checks if email of member is
    * apart of database of valid THS members
    */
    Members.findOne({
        where: {
            email: maybeEmail,
            present: false
        }
    })
        .then(member => {
            /*
            * if a member is found,
            * set it to being present
            */
            if(member) {
                /*
                * Start a validation process
                * to allow the user to
                * sign in via validating their email
                */
                member.activate();
                const message = {
                    from: 'noreply@iare.se',
                    to: `${maybeEmail}`,
                    subject: `Your Temporary Demokrati \
                    Login Code`,
                    html: `<b>${member.getCode()}</b>`
                    // To-do: style email
                }
                Mailer.sendMail(message, (err, info) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.info(info);
                    }
                });
                res.status(200).json({
                    status: 'success',
                    code: 1,
                    msg: `A validation email has been sent to ${maybeEmail}`
                })
            } else {
                res.status(400).json({
                    status: 'bad',
                    code: 2,
                    msg: `It seems like you are \
                    not registered as a THS member, \
                    please contact Valberedningen or IT`
                });
            }
        })
        .catch(err => console.log(err));
});

module.exports = router;