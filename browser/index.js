"use strict";

var UraniumJS = require("./UraniumJS.js");
var UraniumCompressJS = require("./UraniumCompressJS.js");

UraniumJS.enrichFunctionCalls = UraniumCompressJS.UraniumJSEnrichFunctionCalls;
UraniumJS.depleteFunctionCalls = UraniumCompressJS.UraniumJSDepleteFunctionCalls;

if(typeof module != "undefined") {
    module.exports = UraniumJS;
}else {
    window.UraniumJS = UraniumJS;
}
