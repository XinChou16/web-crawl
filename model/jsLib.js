var mongoose = require("mongoose");
var jsLibSchema = require("../schemas/jsLib");
var jsLib = mongoose.model('JsLib',jsLibSchema);

module.exports = jsLib;