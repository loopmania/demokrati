const jwt = require('jsonwebtoken');

const Members = require('../../models/Members');

const MsgHandler = require('../../managers/MsgHandler');

function auth(req, res, next) {
    // to be set in frontend
    const preHeader = req.headers['authorization'] || null;
    const bearerHeader = preHeader == 'null' ? null : preHeader;
    if(!bearerHeader) {
        return MsgHandler(res, 13);
    } else if(bearerHeader == null) {
        return MsgHandler(res, 4);
    } else {
        const bearerToken = bearerHeader;
        jwt.verify(bearerToken, process.env.TOKEN_SECRET, (err, decoded) => {
            if(err) {
                return MsgHandler(res, 5);
            } else {
                req.user = decoded;
                const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                if(req.user.ip !== ip) {
                    return MsgHandler(res, 24);
                }
                next();
            };
        });
    };
};

function isMember(req, res, next) {
    if(!req.user) {
        return MsgHandler(res, 9);
    };
    Members.findByEmail(req.user.email,{
        where: {
            present: false, // change to true
            signed_in: false // change to true
        }
    })
        .then(member => {
            req.member = member;
            next();
        })
        .catch(() => {
            return MsgHandler(res, 10);
        })
}

module.exports.auth = auth;
module.exports.isMember = isMember;