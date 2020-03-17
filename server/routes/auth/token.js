const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(!bearerHeader) {
        res.status(403).json({
            status: 'bad',
            code: 4,
            msg: 'Cannot use this service. Bad token.'
        });
    } else {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    };
}
module.exports.auth = auth;