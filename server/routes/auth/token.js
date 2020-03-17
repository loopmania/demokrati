const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // to be set in frontend
    const bearerHeader = req.headers['authorization'];
    if(!bearerHeader) {
        res.status(403).json({
            status: 'bad',
            code: 4,
            msg: 'Cannot use this service. Bad token.'
        });
    } else {
        const bearerToken = bearerHeader;
        jwt.verify(bearerToken, process.env.TOKEN_SECRET, (err, decoded) => {
            if(err) {
                res.status(401).json({
                    status: 'bad',
                    code: 5,
                    msg: 'Tempered token. Access denied.'
                });
            } else {
                req.user = decoded;
                next();
            };
        });
    };
};

function refreshAuth(req, res, next) {
    // to be set in frontend
    const bearerHeader = req.headers['authorization'];
    if(!bearerHeader) {
        res.status(403).json({
            status: 'bad',
            code: 4,
            msg: 'Cannot use this service. Bad token.'
        });
    } else {
        const bearerToken = bearerHeader;
        jwt.verify(bearerToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err) {
                res.status(401).json({
                    status: 'bad',
                    code: 5,
                    msg: 'Tempered token. Access denied.'
                });
            } else {
                req.user = decoded;
                next();
            };
        });
    };
};

module.exports.auth = auth;
module.exports.refreshAuth = refreshAuth;