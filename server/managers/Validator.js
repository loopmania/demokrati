const Joi = require('joi');

/**
 * Validates if the email
 *  1. is a correct email
 *  2. is a kth provided email
 */
const validEmail = (data) => {
    const schema = {
        email: Joi.string().email().regex(/@kth.se$/).required()
    };
    return Joi.validate(data, schema);
}

const validCode = (data) => {
    const schema = {
        temp_pass: Joi.string().regex(/^([A-Z]{4}-?){4}$/).required()
    };
    return Joi.validate(data, schema);
}

module.exports.validEmail = validEmail;
module.exports.validCode = validCode;