'use strict'

const Handler = (res, id, args) => {
    args = args || {
        token: null,
        email: null,
        code: null,
        user: null,
        vote: null,
        id: null,
    };
    const handles = [
        {
            status: 'success',
            statusCode: 200,
            code: 1,
            token: args.token,
            msg: `A validation email has been sent to ${args.email}`,
            code: args.code
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 2,
            msg: `It seems like you are \
            not registered as a THS member, \
            please contact Valberedningen or IT`
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 3,
            msg: `Cannot validate email. \
            Please make sure you use a valid \
            email provided by KTH`
        },
        {
            status: 'bad',
            statusCode: 403,
            code: 4,
            msg: 'Cannot use this service. Bad token.'
        },
        {
            status: 'bad',
            statusCode: 401,
            code: 5,
            msg: 'Tempered token. Access denied.'
        },
        {
            status: 'success',
            code: 6,
            statusCode: 200,
            refreshToken: args.token,
            msg: 'Welcome',
            payload: args.user
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 7,
            msg: `The temporary login code \
            is invalid. Check your inbox.`
        },
        {
            status: 'success',
            statusCode: 401,
            code: 8,
            msg: `refreshToken is not found.`
        },
        {
            status: 'bad',
            statusCode: 401,
            code: 9,
            msg: `No user found on client`
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 10,
            msg: `No user found in db`
        },
        {
            status: 'success',
            statusCode: 200,
            code: 11,
            token: args.token,
            msg: `Token extended with 25 minutes`
        },
        {
            status: 'success',
            statusCode: 200,
            code: 12,
            msg: 'Server is online'
        },
        {
            status: 'success',
            statusCode: 200,
            code: 13,
            msg: 'New client'
        },
        {
            status: 'success',
            statusCode: 200,
            code: 14,
            voted: false,
            msg: `You have not voted yet but \
            there is no active poll`
        },
        {
            status: 'bad',
            statusCode: 403,
            code: 15,
            voted: true,
            msg: `You have already voted \
            on the currently active poll`
        },
        {
            status: 'success',
            statusCode: 200,
            code: 16,
            voted: false,
            vote: args.vote,
            msg: `You have not voted yet and \
            there is a active poll`
        },
        {
            status: 'bad',
            statusCode: 404,
            code: 17,
            voted: false,
            msg: 'No active poll was found'
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 18,
            voted: false,
            msg: `More than one poll is active. \
            Not allowed, please contact IT or Valberedningen`
        },
        {
            status: 'success',
            statusCode: 200,
            code: 19,
            msg: `Member with id ${args.id} session has been invalidated`
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 20,
            msg: `Member with id ${args.id} doesn't exist`
        },
        {
            status: 'bad',
            statusCode: 403,
            code: 21,
            msg: `No admin-user found on client`
        },
        {
            status: 'bad',
            statusCode: 400,
            code: 22,
            msg: `There already exists a active poll.`
        }

    ];
    id -= 1;
    const handle = handles[id];
    const statusCode = handle.statusCode;
    return res.status(statusCode).json(handle);
}

module.exports = Handler;