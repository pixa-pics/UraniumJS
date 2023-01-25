"use strict";

var _UraniumJS = _interopRequireDefault(require("./UraniumJS"));
var _UraniumCompressJS = _interopRequireDefault(require("./UraniumCompressJS"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_UraniumJS.default.enrichFunctionCalls = _UraniumCompressJS.default.UraniumJSEnrichFunctionCalls;
_UraniumJS.default.depleteFunctionCalls = _UraniumCompressJS.default.UraniumJSDepleteFunctionCalls;
if (typeof module != "undefined") {
  module.exports = _UraniumJS.default;
}else {
  window.UraniumJS = _UraniumJS.default;
}
