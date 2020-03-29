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

async function isMember(req, res, next) {
    if(!req.user) {
        return MsgHandler(res, 9);
    };
    const member = await Members.findByEmail(req.user.email,{
        where: {
            present: false, // change to true
            signed_in: false // change to true
        }
    }); // should find a better way to store frequently asked data
    if(!member) {
        return MsgHandler(res, 10);
    };
    req.member = member;
    next();
}

module.exports.auth = auth;
module.exports.isMember = isMember;