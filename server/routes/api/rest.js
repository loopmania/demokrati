'use strict'
const Sequelize = require('sequelize');
const Joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// models
const Members = require('../../models/Members');
const Polls = require('../../models/Polls');
const Votes = require('../../models/Votes');
const Words = require('../../models/Words');

// managers
const Mailer = require('../../managers/Mailer');
const {validEmail, validCode} = require('../../managers/Validator');
const MsgHandler = require('../../managers/MsgHandler');

exports.io = undefined;

// middleware
const {auth, isMember} = require('../auth/token');

router.get('/me', auth, isMember, (req, res) => {
    const admin = req.member.isAdmin();

    let user = {
                    present: req.member.present,
                    signedIn: req.member.signed_in,
                    hasVoted: req.member.has_voted,
                };
    if(admin) {
        user.admin = admin;
    }

    return MsgHandler(res, 12, {user: user});
});

router.post('/activate', async (req, res) => {
    const {Error} = validEmail(req.body);
    if(Error) {
        return MsgHandler(res, 3);
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
        return MsgHandler(res, 2);
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
    email: maybeEmail,
    ip: req.header('x-forwarded-for') || req.connection.remoteAddress
   };
    if(member.isAdmin()) {
        payload.admin = {
            foo: 'bar'
        }
    };
    jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '25m'},(err, token) => {
        return MsgHandler(res, 1, {
            token: token,
            email: maybeEmail, // to be removed
            code: member.getCode() // to be removed
        });
    });
});

router.post('/verify', auth, (req, res) => {
    const {Error} = validCode(req.body);
    if(Error) {
        return MsgHandler(res, 7);
    };
    const tempCode = req.body.code;
    const email = req.user.email;
    Members.findOne({
        where: {
            email: email,
            present: false,
            temp_pass: tempCode
        }
    })
        .then(member => {
            member.signIn();
            const user = req.user;
            delete user.exp;
            let localUser = {
                present: member.present,
                signedIn: member.signed_in,
                hasVoted: member.has_voted,
            };
            if(member.isAdmin()) {
                localUser.admin = true;
            }
            
            jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, async (err, token) => {
                await member.setRefreshToken(token);
                return MsgHandler(res, 6, {token: token, user: localUser});
            })
        })
        .catch(() => {
            
            return MsgHandler(res, 7);
        })
});

router.patch('/refresh', auth, isMember, (req, res) => {
    const refreshToken = req.body.refreshToken || null; // should validate
    const member = req.member;
    if(member.refresh_token !== refreshToken) {
        return MsgHandler(res, 5);
    };
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) {
            return MsgHandler(res, 5);
        };
        let payload = {
            email: user.email,
            ip: user.ip
        };
        const admin = req.member.isAdmin();
        if(admin) {
            payload.admin = {
                foo: 'bar'
            };
        };
        
        let localUser = {
            present: req.member.present,
            signedIn: req.member.signed_in,
            hasVoted: req.member.has_voted,
        };
        if(admin) {
            localUser.admin = admin;
        }
        jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '25m'},(err, token) => {
            return MsgHandler(res, 11, { token: token, user: localUser });
        });
    });
});

router.get('/findVote', auth, isMember, (req, res) => {
    const member = req.member;
    Polls.findActive()
        .then(result => {
            if(member.hasVoted()) {
                return MsgHandler(res, 15, {
                    title: result[0].title
                });
            }
            return MsgHandler(res, 16, {
                vote: {
                    id: result[0].id,
                    title: result[0].title,
                    candidates: result[0].candidates
                }
            })
        })
        .catch(error => {
            if(error > 1) {
                return MsgHandler(res, 18);
            }
            if(error === 0) {
                return MsgHandler(res, 17);
            }
        });
});

router.put('/vote', auth, isMember, (req, res) => {
    const poll = req.body.poll;
    const candidate = req.body.candidate;
    Polls.findByPk(poll,{
        where: {
            active: true
        }
    })
        .then(result => {
            const member = req.member;
            member.vote()
                .then(async () => {
                    await Votes.create({
                        pollId: poll,
                        vote: candidate
                    });
                    return MsgHandler(res, 27);
                })
                .catch(()=> {
                    return MsgHandler(res, 15, {title: result.title})
                });
        })
        .catch(error => {
            return MsgHandler(res, 17);
        });
});

router.get('/timeleft', auth, isMember, (req, res) => {
    const user = req.user;
    const currentTime = Math.floor(Date.now() / 1000);
    const expireTime = user.exp;
    if(expireTime - currentTime < 2 * 60 && currentTime < expireTime) {
        return MsgHandler(res, 25);
    } else {
        return MsgHandler(res, 26);
    }

})
module.exports = router;