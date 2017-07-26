/**
 * js库schema表结构
 */
var mongoose = require('mongoose'); 
var jsLibSchema = new mongoose.Schema({
    name: {
        type: String,
        index: {
            unique: true,
            dropDups: true
        }
    },
    num: Number
});

module.exports = jsLibSchema;
 