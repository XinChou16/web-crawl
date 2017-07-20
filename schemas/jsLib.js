/**
 * js库schema表结构
 */
var mongoose = require('mongoose'); 
var jsLibSchema = new mongoose.Schema({
    name: String,
    libsNum: Number
});

module.exports = jsLibSchema;
 