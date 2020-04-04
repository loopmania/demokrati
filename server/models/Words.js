'use strict'
const Sequelize = require('sequelize');
const db = require('../database/db');

const Words = db.define('words_dataset', {
    name: {
        type: Sequelize.STRING
    }
},
{
    freezeTableName: true
}
);

/**
* Create a randomized temporary
* login code from a wordset
* @return {login code} from words 
*/
Words.generateCode = function() {
    return new Promise(resolve => {
        Words.findAll({
            order: Sequelize.fn('RANDOM'),
            limit: 4,
            raw: true
        })
            .then(words => {
                resolve(words.map(word => word.name).join('-'));
            })
    })
    
};

module.exports = Words;