"use strict";

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
/* eslint-disable no-magic-numbers */
var DEFAULT_POOL_SIZE = 8192;
var validEncodings = new Set(["utf8", "utf-8",
// alias of utf8
"utf16le", "utf-16le", "latin1", "base64", "hex", "ascii", "binary",
// alias of latin1
"ucs2" // alias of utf16le
]);

var conversionBuffer = new ArrayBuffer(8);
var conversionBuffer8Bytes = new Uint8Array(conversionBuffer);
var conversionBuffer4Bytes = new Uint8Array(conversionBuffer, 0, 4);
var conversionBuffer2Bytes = new Uint8Array(conversionBuffer, 0, 2);
var conversionBufferFloat64 = new Float64Array(conversionBuffer, 0, 1);
var conversionBufferFloat32 = new Float32Array(conversionBuffer, 0, 1);
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var bigIntConsts = {};
try {
  bigIntConsts["8"] = BigInt("8");
  bigIntConsts["16"] = BigInt("16");
  bigIntConsts["24"] = BigInt("24");
  bigIntConsts["32"] = BigInt("32");
  bigIntConsts["40"] = BigInt("40");
  bigIntConsts["48"] = BigInt("48");
  bigIntConsts["56"] = BigInt("56");
  bigIntConsts["255"] = BigInt("255");
  bigIntConsts["9223372036854775807"] = BigInt("9223372036854775807");
  bigIntConsts["18446744073709551616"] = BigInt("18446744073709551616");
} catch (ex) {
  // BigInts aren't supported here.
}
var Buffer = /*#__PURE__*/function (_Uint8Array) {
  _inheritsLoose(Buffer, _Uint8Array);
  function Buffer() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (typeof args[0] === "string") {
      // I can't believe some widely used modules still use this 🤦‍♂️
      _this = _Uint8Array.call(this, Buffer.byteLength(args[0])) || this;
      Buffer.from(args[0], args[1]).copy(_assertThisInitialized(_this));
    } else {
      _this = _Uint8Array.call.apply(_Uint8Array, [this].concat(args)) || this;
    }
    return _assertThisInitialized(_this);
  }
  var _proto = Buffer.prototype;
  _proto.compare = function compare(target, targetStart, targetEnd, sourceStart, sourceEnd) {
    if (targetStart === void 0) {
      targetStart = 0;
    }
    if (targetEnd === void 0) {
      targetEnd = target.length;
    }
    if (sourceStart === void 0) {
      sourceStart = 0;
    }
    if (sourceEnd === void 0) {
      sourceEnd = this.length;
    }
    if (!(target instanceof Uint8Array)) {
      throw new TypeError("Comparison target must be a Uint8Array or Buffer");
    }
    var compareVal = 0;
    var targetI = targetStart;
    for (var thisI = sourceStart; thisI < sourceEnd; thisI += 1) {
      if (targetI >= targetEnd) {
        compareVal = 1;
        break;
      }
      var thisValue = this[thisI];
      var targetValue = target[targetI];
      if (thisValue > targetValue) {
        compareVal = 1;
        break;
      } else if (thisValue < targetValue) {
        compareVal = -1;
        break;
      }
      targetI += 1;
    }
    if (compareVal === 0 && targetEnd - targetStart > sourceEnd - sourceStart) {
      compareVal = -1;
    }
    return compareVal;
  };
  _proto.copy = function copy(target, targetStart, sourceStart, sourceEnd) {
    if (targetStart === void 0) {
      targetStart = 0;
    }
    if (sourceStart === void 0) {
      sourceStart = 0;
    }
    if (sourceEnd === void 0) {
      sourceEnd = this.length;
    }
    var source = sourceStart === 0 && sourceEnd === this.length ? this : this.subarray(sourceStart, sourceEnd);
    if (targetStart + source.length > target.length) {
      source = source.subarray(0, source.length - (targetStart + source.length - target.length));
    }
    target.set(source, targetStart);
    return source.length;
  };
  _proto.equals = function equals(otherBuffer) {
    if (!(otherBuffer instanceof Uint8Array)) {
      throw new TypeError("The \"otherBuffer\" argument must be an instance of Buffer or Uint8Array");
    }
    if (otherBuffer === this) {
      return true;
    }
    if (otherBuffer.length !== this.length) {
      return false;
    }
    if (this.length === 0) {
      return true;
    }
    if (this.length >= 4 && this.byteOffset % 4 === 0 && otherBuffer.byteOffset % 4 === 0) {
      /* Compare the buffers quicker if we can (4 bytes at a time)
         I would use Float64Arrays here, but then there's an issue with NaN */
      var uint32ArrayLength = this.length - this.length % 4;
      var thisUint32Array = new Uint32Array(this.buffer, this.byteOffset, uint32ArrayLength / 4);
      var otherUint32Array = new Uint32Array(otherBuffer.buffer, otherBuffer.byteOffset, thisUint32Array.length);
      for (var _i = 0; _i < thisUint32Array.length; _i += 1) {
        if (thisUint32Array[_i] !== otherUint32Array[_i]) {
          return false;
        }
      }
      // Compare the remaining 1-3 bytes if they exist
      for (var _i2 = uint32ArrayLength; _i2 < this.length; _i2 += 1) {
        if (this[_i2] !== otherBuffer[_i2]) {
          return false;
        }
      }
    } else {
      for (var _i3 = 0; _i3 < this.length; _i3 += 1) {
        if (this[_i3] !== otherBuffer[_i3]) {
          return false;
        }
      }
    }
    return true;
  };
  _proto.fill = function fill(value, start, end, encoding) {
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = this.length;
    }
    if (encoding === void 0) {
      encoding = "utf8";
    }
    if (typeof value === "number") {
      _Uint8Array.prototype.fill.call(this, value, start, end);
    } else {
      if (typeof value === "string") {
        value = Buffer.from(value, encoding);
      }
      if (!(value instanceof Uint8Array)) {
        throw new TypeError("fill value must be a number, string, Buffer, or Uint8Array");
      }
      if (!(value instanceof Buffer)) {
        value = new Buffer(value.buffer, value.byteOffset, value.length);
      }
      var shouldCopy = end - start;
      var copied = 0;
      for (var _i4 = start; _i4 <= end - value.length; _i4 += value.length) {
        copied += value.length;
        value.copy(this, _i4);
      }
      value.copy(this, start + copied, 0, shouldCopy - copied);
    }
    return this;
  };
  _proto.includes = function includes(value, byteOffset, encoding) {
    if (byteOffset === void 0) {
      byteOffset = 0;
    }
    if (encoding === void 0) {
      encoding = "utf8";
    }
    return this.indexOf(value, byteOffset, encoding) !== -1;
  };
  _proto.indexOf = function indexOf(value, byteOffset, encoding) {
    if (byteOffset === void 0) {
      byteOffset = 0;
    }
    if (encoding === void 0) {
      encoding = "utf8";
    }
    if (byteOffset < 0) {
      byteOffset = this.length + byteOffset;
    }
    if (typeof value === "number") {
      return _Uint8Array.prototype.indexOf.call(this, value, byteOffset);
    }
    if (typeof value === "string") {
      value = Buffer.from(value, encoding);
    } else if (!(value instanceof Uint8Array)) {
      throw new TypeError("The \"value\" argument must be one of type number or string or an instance of Buffer or Uint8Array.");
    }
    for (var _i5 = byteOffset; _i5 <= this.length - value.length; _i5 += 1) {
      if (this.subarray(_i5, _i5 + value.length).equals(value)) {
        return _i5;
      }
    }
    return -1;
  };
  _proto.lastIndexOf = function lastIndexOf(value, byteOffset, encoding) {
    if (byteOffset === void 0) {
      byteOffset = this.length;
    }
    if (encoding === void 0) {
      encoding = "utf8";
    }
    if (byteOffset < 0) {
      byteOffset = this.length + byteOffset;
    }
    if (typeof value === "number") {
      return _Uint8Array.prototype.lastIndexOf.call(this, value, byteOffset);
    }
    if (typeof value === "string") {
      value = Buffer.from(value, encoding);
    } else if (!(value instanceof Uint8Array)) {
      throw new TypeError("The \"value\" argument must be one of type number or string or an instance of Buffer or Uint8Array.");
    }
    for (var _i6 = byteOffset; _i6 >= 0; _i6 -= 1) {
      if (this.subarray(_i6, _i6 + value.length).equals(value)) {
        return _i6;
      }
    }
    return -1;
  };
  _proto.map = function map() {
    var _Uint8Array$prototype;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    var newArray = (_Uint8Array$prototype = _Uint8Array.prototype.map).call.apply(_Uint8Array$prototype, [this].concat(args));
    return new Buffer(newArray.buffer, newArray.byteOffset, newArray.byteLength);
  };
  _proto.readBigInt64BE = function readBigInt64BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readBigUInt64BE(offset);
    if (result > bigIntConsts["9223372036854775807"]) {
      result -= bigIntConsts["18446744073709551616"];
    }
    return result;
  };
  _proto.readBigInt64LE = function readBigInt64LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readBigUInt64LE(offset);
    if (result > bigIntConsts["9223372036854775807"]) {
      result -= bigIntConsts["18446744073709551616"];
    }
    return result;
  };
  _proto.readBigUInt64BE = function readBigUInt64BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = BigInt(this[offset + 7]);
    result += BigInt(this[offset + 6]) << bigIntConsts["8"];
    result += BigInt(this[offset + 5]) << bigIntConsts["16"];
    result += BigInt(this[offset + 4]) << bigIntConsts["24"];
    result += BigInt(this[offset + 3]) << bigIntConsts["32"];
    result += BigInt(this[offset + 2]) << bigIntConsts["40"];
    result += BigInt(this[offset + 1]) << bigIntConsts["48"];
    result += BigInt(this[offset]) << bigIntConsts["56"];
    return result;
  };
  _proto.readBigUInt64LE = function readBigUInt64LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = BigInt(this[offset]);
    result += BigInt(this[offset + 1]) << bigIntConsts["8"];
    result += BigInt(this[offset + 2]) << bigIntConsts["16"];
    result += BigInt(this[offset + 3]) << bigIntConsts["24"];
    result += BigInt(this[offset + 4]) << bigIntConsts["32"];
    result += BigInt(this[offset + 5]) << bigIntConsts["40"];
    result += BigInt(this[offset + 6]) << bigIntConsts["48"];
    result += BigInt(this[offset + 7]) << bigIntConsts["56"];
    return result;
  };
  _proto.readDoubleBE = function readDoubleBE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    // Idk how to actually do this so JS will do it for me lol;
    for (var _i7 = 0; _i7 < 8; _i7 += 1) {
      conversionBuffer8Bytes[_i7] = this[_i7 + offset];
    }
    conversionBuffer8Bytes.reverse();
    return conversionBufferFloat64[0];
  };
  _proto.readDoubleLE = function readDoubleLE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    for (var _i8 = 0; _i8 < 8; _i8 += 1) {
      conversionBuffer8Bytes[_i8] = this[_i8 + offset];
    }
    return conversionBufferFloat64[0];
  };
  _proto.readFloatBE = function readFloatBE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    // Idk how to actually do this so JS will do it for me lol;
    for (var _i9 = 0; _i9 < 4; _i9 += 1) {
      conversionBuffer4Bytes[_i9] = this[_i9 + offset];
    }
    conversionBuffer4Bytes.reverse();
    return conversionBufferFloat32[0];
  };
  _proto.readFloatLE = function readFloatLE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    for (var _i10 = 0; _i10 < 4; _i10 += 1) {
      conversionBuffer4Bytes[_i10] = this[_i10 + offset];
    }
    return conversionBufferFloat32[0];
  };
  _proto.readInt8 = function readInt8(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = this[offset];
    if (result > 127) {
      result -= 256;
    }
    return result;
  };
  _proto.readInt16BE = function readInt16BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUInt16BE(offset);
    if (result > 32767) {
      result -= 65536;
    }
    return result;
  };
  _proto.readInt16LE = function readInt16LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUInt16LE(offset);
    if (result > 32767) {
      result -= 65536;
    }
    return result;
  };
  _proto.readInt32BE = function readInt32BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUInt32BE(offset);
    if (result > 2147483647) {
      result -= 4294967296;
    }
    return result;
  };
  _proto.readInt32LE = function readInt32LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUInt32LE(offset);
    if (result > 2147483647) {
      result -= 4294967296;
    }
    return result;
  };
  _proto.readIntBE = function readIntBE(offset, byteLength) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUIntBE(offset, byteLength);
    if (result > Math.pow(2, byteLength * 8 - 1)) {
      result -= Math.pow(2, byteLength * 8);
    }
    return result;
  };
  _proto.readIntLE = function readIntLE(offset, byteLength) {
    if (offset === void 0) {
      offset = 0;
    }
    var result = this.readUIntLE(offset, byteLength);
    if (result > Math.pow(2, byteLength * 8 - 1)) {
      result -= Math.pow(2, byteLength * 8);
    }
    return result;
  };
  _proto.readUInt8 = function readUInt8(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    return this[offset];
  };
  _proto.readUInt16BE = function readUInt16BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = this[offset + 1];
    result += this[offset] << 8;
    return result;
  };
  _proto.readUInt16LE = function readUInt16LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = this[offset];
    result += this[offset + 1] << 8;
    return result;
  };
  _proto.readUInt32BE = function readUInt32BE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = this[offset + 3];
    result += this[offset + 2] << 8;
    result += this[offset + 1] << 16;
    result += this[offset] * 0x1000000; // Bitshifting in JS uses _signed_ 32-bit ints 🤷🏻‍♂️
    return result;
  };
  _proto.readUInt32LE = function readUInt32LE(offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var result = this[offset];
    result += this[offset + 1] << 8;
    result += this[offset + 2] << 16;
    result += this[offset + 3] * 0x1000000;
    return result;
  };
  _proto.readUIntBE = function readUIntBE(offset, byteLength) {
    if (typeof byteLength !== "number") {
      throw new TypeError("\"byteLength\" must be a number");
    }
    if (offset < 0 || offset + byteLength - 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var mul = 1;
    var val = 0;
    for (var _i11 = byteLength - 1; _i11 >= 0; _i11 -= 1) {
      val += this[offset + _i11] * mul;
      mul *= 0x100;
    }
    return val;
  };
  _proto.readUIntLE = function readUIntLE(offset, byteLength) {
    if (typeof byteLength !== "number") {
      throw new TypeError("\"byteLength\" must be a number");
    }
    if (offset < 0 || offset + byteLength - 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var mul = 1;
    var val = 0;
    for (var _i12 = 0; _i12 < byteLength; _i12 += 1) {
      val += this[offset + _i12] * mul;
      mul *= 0x100;
    }
    return val;
  };
  _proto.subarray = function subarray(start, end) {
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = this.length;
    }
    var newArray = _Uint8Array.prototype.subarray.call(this, start, end);
    return new Buffer(newArray.buffer, newArray.byteOffset, newArray.byteLength);
  };
  _proto.slice = function slice(start, end) {
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = this.length;
    }
    return this.subarray(start, end);
  };
  _proto.swap16 = function swap16() {
    if (this.length % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (var _i13 = 0; _i13 < this.length; _i13 += 2) {
      conversionBuffer2Bytes[0] = this[_i13];
      this[_i13] = this[_i13 + 1];
      this[_i13 + 1] = conversionBuffer2Bytes[0];
    }
    return this;
  };
  _proto.swap32 = function swap32() {
    if (this.length % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for (var _i14 = 0; _i14 < this.length; _i14 += 4) {
      conversionBuffer4Bytes[0] = this[_i14];
      conversionBuffer4Bytes[1] = this[_i14 + 1];
      conversionBuffer4Bytes[2] = this[_i14 + 2];
      conversionBuffer4Bytes[3] = this[_i14 + 3];
      this[_i14] = conversionBuffer4Bytes[3];
      this[_i14 + 1] = conversionBuffer4Bytes[2];
      this[_i14 + 2] = conversionBuffer4Bytes[1];
      this[_i14 + 3] = conversionBuffer4Bytes[0];
    }
    return this;
  };
  _proto.swap64 = function swap64() {
    if (this.length % 8 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for (var _i15 = 0; _i15 < this.length; _i15 += 8) {
      for (var ii = 0; ii < 8; ii += 1) {
        conversionBuffer8Bytes[ii] = this[_i15 + ii];
      }
      conversionBuffer8Bytes.reverse();
      for (var _ii = 0; _ii < 8; _ii += 1) {
        this[_i15 + _ii] = conversionBuffer8Bytes[_ii];
      }
    }
    return this;
  };
  _proto.toJSON = function toJSON() {
    return {
      data: [].concat(this),
      type: "Buffer"
    };
  };
  _proto.toString = function toString(encoding, start, end) {
    var _this2 = this;
    if (encoding === void 0) {
      encoding = "utf8";
    }
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = this.length;
    }
    var buf = this.subarray(start, end);
    switch (encoding.toLowerCase()) {
      case "utf8":
      case "utf-8":
        return decoder.decode(buf);
      case "utf16le":
      case "utf-16le":
      case "ucs2":
        return String.fromCharCode.apply(String, new Uint16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2));
      case "latin1":
      case "binary":
        return String.fromCharCode.apply(String, buf);
      case "ascii":
        return String.fromCharCode.apply(String, buf.map(function (v) {
          _newArrowCheck(this, _this2);
          return v & 127;
        }.bind(this)));
      case "base64":
        return btoa(String.fromCharCode.apply(String, buf));
      case "hex":
        {
          var str = "";
          for (var _i16 = 0; _i16 < buf.length; _i16 += 1) {
            var v = buf[_i16];
            if (v < 16) {
              str += "0";
            }
            str += v.toString(16);
          }
          return str;
        }
      default:
        throw new Error("Unknown encoding: " + encoding);
    }
  };
  _proto.write = function write(string, offset, length, encoding) {
    if (offset === void 0) {
      offset = 0;
    }
    if (length === void 0) {
      length = this.length - offset;
    }
    if (encoding === void 0) {
      encoding = "utf8";
    }
    if (typeof string !== "string") {
      throw new TypeError("argument must be a string");
    }
    var tmpBuffer = Buffer.from(string, encoding);
    tmpBuffer.copy(this, offset, 0, length);
    if (tmpBuffer.length < length) {
      return tmpBuffer.length;
    }
    return length;
  };
  _proto.writeBigInt64BE = function writeBigInt64BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      value = bigIntConsts["18446744073709551616"] + value;
    }
    return this.writeBigUInt64BE(value, offset);
  };
  _proto.writeBigInt64LE = function writeBigInt64LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      value = bigIntConsts["18446744073709551616"] + value;
    }
    return this.writeBigUInt64LE(value, offset);
  };
  _proto.writeBigUInt64BE = function writeBigUInt64BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset + 7] = Number(value & bigIntConsts["255"]);
    this[offset + 6] = Number(value >> bigIntConsts["8"] & bigIntConsts["255"]);
    this[offset + 5] = Number(value >> bigIntConsts["16"] & bigIntConsts["255"]);
    this[offset + 4] = Number(value >> bigIntConsts["24"] & bigIntConsts["255"]);
    this[offset + 3] = Number(value >> bigIntConsts["32"] & bigIntConsts["255"]);
    this[offset + 2] = Number(value >> bigIntConsts["40"] & bigIntConsts["255"]);
    this[offset + 1] = Number(value >> bigIntConsts["48"] & bigIntConsts["255"]);
    this[offset] = Number(value >> bigIntConsts["56"] & bigIntConsts["255"]);
    return offset + 8;
  };
  _proto.writeBigUInt64LE = function writeBigUInt64LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset] = Number(value & bigIntConsts["255"]);
    this[offset + 1] = Number(value >> bigIntConsts["8"] & bigIntConsts["255"]);
    this[offset + 2] = Number(value >> bigIntConsts["16"] & bigIntConsts["255"]);
    this[offset + 3] = Number(value >> bigIntConsts["24"] & bigIntConsts["255"]);
    this[offset + 4] = Number(value >> bigIntConsts["32"] & bigIntConsts["255"]);
    this[offset + 5] = Number(value >> bigIntConsts["40"] & bigIntConsts["255"]);
    this[offset + 6] = Number(value >> bigIntConsts["48"] & bigIntConsts["255"]);
    this[offset + 7] = Number(value >> bigIntConsts["56"] & bigIntConsts["255"]);
    return offset + 8;
  };
  _proto.writeDoubleBE = function writeDoubleBE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    conversionBufferFloat64[0] = value;
    conversionBuffer8Bytes.reverse();
    for (var _i17 = 0; _i17 < 8; _i17 += 1) {
      this[offset + _i17] = conversionBuffer8Bytes[_i17];
    }
    return offset + 8;
  };
  _proto.writeDoubleLE = function writeDoubleLE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 7 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    conversionBufferFloat64[0] = value;
    for (var _i18 = 0; _i18 < 8; _i18 += 1) {
      this[offset + _i18] = conversionBuffer8Bytes[_i18];
    }
    return offset + 8;
  };
  _proto.writeFloatBE = function writeFloatBE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    conversionBufferFloat32[0] = value;
    conversionBuffer4Bytes.reverse();
    for (var _i19 = 0; _i19 < 4; _i19 += 1) {
      this[offset + _i19] = conversionBuffer4Bytes[_i19];
    }
    return offset + 4;
  };
  _proto.writeFloatLE = function writeFloatLE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 3 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    conversionBufferFloat32[0] = value;
    for (var _i20 = 0; _i20 < 4; _i20 += 1) {
      this[offset + _i20] = conversionBuffer4Bytes[_i20];
    }
    return offset + 4;
  };
  _proto.writeInt8 = function writeInt8(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    if (value < 0) {
      value = 256 + value;
    }
    this[offset] = value;
    return offset + 1;
  };
  _proto.writeInt16BE = function writeInt16BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      // 2 ** 16
      value = 65536 + value;
    }
    this.writeUInt16BE(value, offset);
    return offset + 2;
  };
  _proto.writeInt16LE = function writeInt16LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      // 2 ** 16
      value = 65536 + value;
    }
    this.writeUInt16LE(value, offset);
    return offset + 2;
  };
  _proto.writeInt32BE = function writeInt32BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      // 2 ** 32
      value = 4294967296 + value;
    }
    this.writeUInt32BE(value, offset);
    return offset + 4;
  };
  _proto.writeInt32LE = function writeInt32LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (value < 0) {
      // 2 ** 32
      value = 4294967296 + value;
    }
    this.writeUInt32LE(value, offset);
    return offset + 4;
  };
  _proto.writeIntBE = function writeIntBE(value, offset, byteLength) {
    if (value < 0) {
      value = Math.pow(2, byteLength * 8) + value;
    }
    return this.writeUIntBE(value, offset, byteLength);
  };
  _proto.writeIntLE = function writeIntLE(value, offset, byteLength) {
    if (value < 0) {
      value = Math.pow(2, byteLength * 8) + value;
    }
    return this.writeUIntLE(value, offset, byteLength);
  };
  _proto.writeUInt8 = function writeUInt8(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset] = value;
    return offset + 1;
  };
  _proto.writeUInt16BE = function writeUInt16BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 2 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset + 1] = value & 255;
    this[offset] = value >> 8 & 255;
    return offset + 2;
  };
  _proto.writeUInt16LE = function writeUInt16LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 2 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset] = value & 255;
    this[offset + 1] = value >> 8 & 255;
    return offset + 2;
  };
  _proto.writeUInt32BE = function writeUInt32BE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 4 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset + 3] = value & 255;
    this[offset + 2] = value >> 8 & 255;
    this[offset + 1] = value >> 16 & 255;
    this[offset] = value >> 24 & 255;
    return offset + 4;
  };
  _proto.writeUInt32LE = function writeUInt32LE(value, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    if (offset < 0 || offset + 4 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    this[offset] = value & 255;
    this[offset + 1] = value >> 8 & 255;
    this[offset + 2] = value >> 16 & 255;
    this[offset + 3] = value >> 24 & 255;
    return offset + 4;
  };
  _proto.writeUIntBE = function writeUIntBE(value, offset, byteLength) {
    if (typeof byteLength !== "number") {
      throw new TypeError("\"byteLength\" must be a number");
    }
    if (typeof offset !== "number") {
      throw new TypeError("\"offset\" must be a number");
    }
    if (offset < 0 || offset + byteLength - 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var mul = Math.pow(0x100, byteLength);
    for (var _i21 = 0; _i21 < byteLength; _i21 += 1) {
      mul /= 0x100;
      this[offset + _i21] = Math.floor(value / mul) & 255;
    }
    return offset + byteLength;
  };
  _proto.writeUIntLE = function writeUIntLE(value, offset, byteLength) {
    if (typeof byteLength !== "number") {
      throw new TypeError("\"byteLength\" must be a number");
    }
    if (typeof offset !== "number") {
      throw new TypeError("\"offset\" must be a number");
    }
    if (offset < 0 || offset + byteLength - 1 >= this.length) {
      throw new RangeError("Attempt to access memory outside buffer bounds");
    }
    var mul = 1;
    for (var _i22 = 0; _i22 < byteLength; _i22 += 1) {
      this[offset + _i22] = Math.floor(value / mul) & 255;
      mul *= 0x100;
    }
    return offset + byteLength;
  };
  return Buffer;
}( /*#__PURE__*/_wrapNativeSuper(Uint8Array));
var fillBufferIfNotZero = function fillBufferIfNotZero(buffer, fill, encoding) {
  if (fill !== 0) {
    buffer.fill(fill, 0, buffer.length, encoding);
  }
  return buffer;
};
var bufferPool = new Buffer(DEFAULT_POOL_SIZE);
var bufferPoolIndex = 0;
Buffer.alloc = function (size, fill, encoding) {
  if (fill === void 0) {
    fill = 0;
  }
  if (encoding === void 0) {
    encoding = "utf8";
  }
  if (typeof size !== "number") {
    throw new TypeError("size argument must be a number");
  }
  if (size === 0) {
    return new Buffer(0);
  }
  if (size >= Buffer.poolSize / 2) {
    return fillBufferIfNotZero(new Buffer(size), fill, encoding);
  }
  if (bufferPoolIndex + size > Buffer.poolSize) {
    // We have no way of knowing when previous buffers are GC'd so we can re-use a pool, oh well
    bufferPool = new Buffer(Buffer.poolSize);
    bufferPoolIndex = 0;
  }
  var newBuff = bufferPool.subarray(bufferPoolIndex, bufferPoolIndex + size);
  bufferPoolIndex += size;
  if (bufferPoolIndex % 4 !== 0) {
    // Keep the byte offsets a multiple of 4 so Buffer.prototype.equals is faster
    bufferPoolIndex += 4 - bufferPoolIndex % 4;
  }
  return fillBufferIfNotZero(newBuff, fill, encoding);
};
Buffer.allocUnsafe = Buffer.alloc; // Nothing unsafe about it since Buffers are always pre-zeroed on the browser
Buffer.allocUnsafeSlow = function (size) {
  if (typeof size !== "number") {
    throw new TypeError("size argument must be a number");
  }
  return new Buffer(size);
};
/**
 * @param {string} str
 * @private
 */
var calculateUTF8LengthFromUTF16String = function calculateUTF8LengthFromUTF16String(str) {
  var result = 0;
  for (var _i23 = 0; _i23 < str.length; _i23 += 1) {
    var codePoint = str.codePointAt(_i23);
    if (codePoint <= 0x7f) {
      result += 1;
      continue;
    }
    if (codePoint <= 0x7ff) {
      result += 2;
      continue;
    }
    if (codePoint <= 0xffff) {
      result += 3;
      continue;
    }
    // This character now bigger than 16 bits, so we should skip one string position
    _i23 += 1;
    /* Fun fact: In the original 1993 UTF8 spec, it could go up to 6 bytes!
       But since unicode codepoints were limited to 21 bits in 2003, the largest we should ever see is 4. */
    result += 4;
  }
  return result;
};
/**
 * @param {string} str
 * @private
 */
var calculateDecodedBase64Length = function calculateDecodedBase64Length(str) {
  var result = str.length;
  while (result > 1 && str[result - 1] === "=") {
    result -= 1;
  }
  return Math.floor(result * 0.75);
};
Buffer.byteLength = function (thing, encoding) {
  if (encoding === void 0) {
    encoding = "utf8";
  }
  if (typeof thing === "string") {
    switch (encoding) {
      case "utf8":
      case "utf-8":
        return calculateUTF8LengthFromUTF16String(thing);
      case "latin1":
      case "binary":
      case "ascii":
        return thing.length;
      case "utf16le":
      case "utf-16le":
      case "ucs2":
        return thing.length * 2;
      case "base64":
        return calculateDecodedBase64Length(thing);
      case "hex":
        {
          return thing.length / 2;
        }
      default:
        throw new Error("Unknown encoding: " + encoding);
    }
  } else {
    return thing.length;
  }
};
Buffer.compare = function (buf1, buf2) {
  if (!(buf1 instanceof Uint8Array)) {
    throw new TypeError("buf1 must be a Buffer or Uint8Array");
  }
  if (Buffer.isBuffer(buf1)) {
    return buf1.compare(buf2);
  }
  return Buffer.prototype.compare.call(buf1, buf2);
};
Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new TypeError("list argument must be an Array");
  }
  if (totalLength === undefined) {
    totalLength = 0;
    for (var _i24 = 0; _i24 < list.length; _i24 += 1) {
      totalLength += list[_i24].length;
    }
  }
  var resultOffset = 0;
  var resultBuffer = Buffer.alloc(totalLength);
  for (var _i25 = 0; _i25 < list.length; _i25 += 1) {
    var buff = list[_i25];
    if (!(buff instanceof Uint8Array)) {
      throw new TypeError("\"list[" + _i25 + "]\" must be an instance of Buffer or Uint8Array");
    }
    resultBuffer.set(buff, resultOffset);
    resultOffset += buff.length;
  }
  return resultBuffer;
};
var invalidThingMessage = "The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object";
Buffer.from = function (arrayOrBufferOrString, byteOffsetOrEncoding, lengthOrEncoding) {
  var _this3 = this;
  if (typeof arrayOrBufferOrString === "object") {
    if (
    // Apparently anything "array-like" can be used, this is my attempt to define what that means
    typeof arrayOrBufferOrString.length === "number" && typeof arrayOrBufferOrString[Symbol.iterator] === "function") {
      return new Buffer(arrayOrBufferOrString);
    }
    if (arrayOrBufferOrString instanceof ArrayBuffer) {
      return new Buffer(arrayOrBufferOrString, byteOffsetOrEncoding, lengthOrEncoding);
    }
    if (arrayOrBufferOrString.type !== "Buffer" || !Array.isArray(arrayOrBufferOrString.data)) {
      throw new TypeError(invalidThingMessage);
    }
    return new Buffer(arrayOrBufferOrString.data);
  } else if (typeof arrayOrBufferOrString === "string") {
    if (typeof byteOffsetOrEncoding !== "string") {
      byteOffsetOrEncoding = "utf8";
    }
    switch (byteOffsetOrEncoding.toLowerCase()) {
      case "utf8":
      case "utf-8":
        return new Buffer(encoder.encode(arrayOrBufferOrString));
      case "utf16le":
      case "utf-16le":
      case "ucs2":
        return new Buffer(new Uint16Array([].concat(arrayOrBufferOrString).map(function (v) {
          _newArrowCheck(this, _this3);
          return v.charCodeAt(0);
        }.bind(this))).buffer);
      case "latin1":
      case "binary":
      case "ascii":
        return new Buffer([].concat(arrayOrBufferOrString).map(function (v) {
          _newArrowCheck(this, _this3);
          return v.charCodeAt(0);
        }.bind(this)));
      case "base64":
        return new Buffer([].concat(atob(arrayOrBufferOrString)).map(function (v) {
          _newArrowCheck(this, _this3);
          return v.charCodeAt(0);
        }.bind(this)));
      case "hex":
        {
          var newBuffer = new Buffer(arrayOrBufferOrString.length / 2);
          for (var _i26 = 0; _i26 < arrayOrBufferOrString.length; _i26 += 2) {
            newBuffer[_i26 / 2] = parseInt(arrayOrBufferOrString.substring(_i26, _i26 + 2), 16);
          }
          return newBuffer;
        }
      default:
        throw new Error("Unknown encoding: " + byteOffsetOrEncoding);
    }
  }
  throw new TypeError(invalidThingMessage);
};
Buffer.isBuffer = function (obj) {
  return obj instanceof Buffer;
};
Buffer.isEncoding = function (encoding) {
  if (typeof encoding !== "string") {
    return false;
  }
  return validEncodings.has(encoding.toLowerCase());
};
Buffer.poolSize = DEFAULT_POOL_SIZE;
module.exports = Buffer;
/* istanbul ignore next */
if (globalThis.Buffer === undefined) {
  globalThis.Buffer = Buffer;
}

//     Int64.js
//
//     Copyright (c) 2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/**
 * Support for handling 64-bit int numbers in Javascript (node.js)
 *
 * JS Numbers are IEEE-754 binary double-precision floats, which limits the
 * range of values that can be represented with integer precision to:
 *
 * 2^^53 <= N <= 2^53
 *
 * Int64 objects wrap a node Buffer that holds the 8-bytes of int64 data.  These
 * objects operate directly on the buffer which means that if they are created
 * using an existing buffer then setting the value will modify the Buffer, and
 * vice-versa.
 *
 * Internal Representation
 *
 * The internal buffer format is Big Endian.  I.e. the most-significant byte is
 * at buffer[0], the least-significant at buffer[7].  For the purposes of
 * converting to/from JS native numbers, the value is assumed to be a signed
 * integer stored in 2's complement form.
 *
 * For details about IEEE-754 see:
 * http://en.wikipedia.org/wiki/Double_precision_floating-point_format
 */

// Useful masks and values for bit twiddling
var MASK31 = 0x7fffffff,
  VAL31 = 0x80000000;
var MASK32 = 0xffffffff,
  VAL32 = 0x100000000;

// Map for converting hex octets to strings
var _HEX = [];
for (var i = 0; i < 256; i++) {
  _HEX[i] = (i > 0xF ? '' : '0') + i.toString(16);
}

//
// Int64
//

/**
 * Constructor accepts any of the following argument types:
 *
 * new Int64(buffer[, offset=0]) - Existing Buffer with byte offset
 * new Int64(Uint8Array[, offset=0]) - Existing Uint8Array with a byte offset
 * new Int64(string)             - Hex string (throws if n is outside int64 range)
 * new Int64(number)             - Number (throws if n is outside int64 range)
 * new Int64(hi, lo)             - Raw bits as two 32-bit values
 */
var Int64 = module.exports = function (a1, a2) {
  if (a1 instanceof Buffer) {
    this.buffer = a1;
    this.offset = a2 || 0;
  } else if (Object.prototype.toString.call(a1) == '[object Uint8Array]') {
    // Under Browserify, Buffers can extend Uint8Arrays rather than an
    // instance of Buffer. We could assume the passed in Uint8Array is actually
    // a buffer but that won't handle the case where a raw Uint8Array is passed
    // in. We construct a new Buffer just in case.
    this.buffer = new Buffer(a1);
    this.offset = a2 || 0;
  } else {
    this.buffer = this.buffer || new Buffer(8);
    this.offset = 0;
    this.setValue.apply(this, arguments);
  }
};

// Max integer value that JS can accurately represent
Int64.MAX_INT = Math.pow(2, 53);

// Min integer value that JS can accurately represent
Int64.MIN_INT = -Math.pow(2, 53);
Int64.prototype = {
  constructor: Int64,
  /**
   * Do in-place 2's compliment.  See
   * http://en.wikipedia.org/wiki/Two's_complement
   */
  _2scomp: function _2scomp() {
    var b = this.buffer,
      o = this.offset,
      carry = 1;
    for (var i = o + 7; i >= o; i--) {
      var v = (b[i] ^ 0xff) + carry;
      b[i] = v & 0xff;
      carry = v >> 8;
    }
  },
  /**
   * Set the value. Takes any of the following arguments:
   *
   * setValue(string) - A hexidecimal string
   * setValue(number) - Number (throws if n is outside int64 range)
   * setValue(hi, lo) - Raw bits as two 32-bit values
   */
  setValue: function setValue(hi, lo) {
    var negate = false;
    if (arguments.length == 1) {
      if (typeof hi == 'number') {
        // Simplify bitfield retrieval by using abs() value.  We restore sign
        // later
        negate = hi < 0;
        hi = Math.abs(hi);
        lo = hi % VAL32;
        hi = hi / VAL32;
        if (hi > VAL32) throw new RangeError(hi + ' is outside Int64 range');
        hi = hi | 0;
      } else if (typeof hi == 'string') {
        hi = (hi + '').replace(/^0x/, '');
        lo = hi.substr(-8);
        hi = hi.length > 8 ? hi.substr(0, hi.length - 8) : '';
        hi = parseInt(hi, 16);
        lo = parseInt(lo, 16);
      } else {
        throw new Error(hi + ' must be a Number or String');
      }
    }

    // Technically we should throw if hi or lo is outside int32 range here, but
    // it's not worth the effort. Anything past the 32'nd bit is ignored.

    // Copy bytes to buffer
    var b = this.buffer,
      o = this.offset;
    for (var i = 7; i >= 0; i--) {
      b[o + i] = lo & 0xff;
      lo = i == 4 ? hi : lo >>> 8;
    }

    // Restore sign of passed argument
    if (negate) this._2scomp();
  },
  /**
   * Convert to a native JS number.
   *
   * WARNING: Do not expect this value to be accurate to integer precision for
   * large (positive or negative) numbers!
   *
   * @param allowImprecise If true, no check is performed to verify the
   * returned value is accurate to integer precision.  If false, imprecise
   * numbers (very large positive or negative numbers) will be forced to +/-
   * Infinity.
   */
  toNumber: function toNumber(allowImprecise) {
    var b = this.buffer,
      o = this.offset;

    // Running sum of octets, doing a 2's complement
    var negate = b[o] & 0x80,
      x = 0,
      carry = 1;
    for (var i = 7, m = 1; i >= 0; i--, m *= 256) {
      var v = b[o + i];

      // 2's complement for negative numbers
      if (negate) {
        v = (v ^ 0xff) + carry;
        carry = v >> 8;
        v = v & 0xff;
      }
      x += v * m;
    }

    // Return Infinity if we've lost integer precision
    if (!allowImprecise && x >= Int64.MAX_INT) {
      return negate ? -Infinity : Infinity;
    }
    return negate ? -x : x;
  },
  /**
   * Convert to a JS Number. Returns +/-Infinity for values that can't be
   * represented to integer precision.
   */
  valueOf: function valueOf() {
    return this.toNumber(false);
  },
  /**
   * Return string value
   *
   * @param radix Just like Number#toString()'s radix
   */
  toString: function toString(radix) {
    return this.valueOf().toString(radix || 10);
  },
  /**
   * Return a string showing the buffer octets, with MSB on the left.
   *
   * @param sep separator string. default is '' (empty string)
   */
  toOctetString: function toOctetString(sep) {
    var out = new Array(8);
    var b = this.buffer,
      o = this.offset;
    for (var i = 0; i < 8; i++) {
      out[i] = _HEX[b[o + i]];
    }
    return out.join(sep || '');
  },
  /**
   * Returns the int64's 8 bytes in a buffer.
   *
   * @param {bool} [rawBuffer=false]  If no offset and this is true, return the internal buffer.  Should only be used if
   *                                  you're discarding the Int64 afterwards, as it breaks encapsulation.
   */
  toBuffer: function toBuffer(rawBuffer) {
    if (rawBuffer && this.offset === 0) return this.buffer;
    var out = new Buffer(8);
    this.buffer.copy(out, 0, this.offset, this.offset + 8);
    return out;
  },
  /**
   * Copy 8 bytes of int64 into target buffer at target offset.
   *
   * @param {Buffer} targetBuffer       Buffer to copy into.
   * @param {number} [targetOffset=0]   Offset into target buffer.
   */
  copy: function copy(targetBuffer, targetOffset) {
    this.buffer.copy(targetBuffer, targetOffset || 0, this.offset, this.offset + 8);
  },
  /**
   * Returns a number indicating whether this comes before or after or is the
   * same as the other in sort order.
   *
   * @param {Int64} other  Other Int64 to compare.
   */
  compare: function compare(other) {
    // If sign bits differ ...
    if ((this.buffer[this.offset] & 0x80) != (other.buffer[other.offset] & 0x80)) {
      return other.buffer[other.offset] - this.buffer[this.offset];
    }

    // otherwise, compare bytes lexicographically
    for (var i = 0; i < 8; i++) {
      if (this.buffer[this.offset + i] !== other.buffer[other.offset + i]) {
        return this.buffer[this.offset + i] - other.buffer[other.offset + i];
      }
    }
    return 0;
  },
  /**
   * Returns a boolean indicating if this integer is equal to other.
   *
   * @param {Int64} other  Other Int64 to compare.
   */
  equals: function equals(other) {
    return this.compare(other) === 0;
  },
  /**
   * Pretty output in console.log
   */
  inspect: function inspect() {
    return '[Int64 value:' + this + ' octets:' + this.toOctetString(' ') + ']';
  }
};
var inherits;
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  inherits = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  inherits = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function TempCtor() {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}

/* global WeakMap */

var privateMap = new WeakMap();

// For making private properties.
function internal(obj) {
  if (!privateMap.has(obj)) {
    privateMap.set(obj, {});
  }
  return privateMap.get(obj);
}

// Excluding callbacks from internal(_callbacks) for speed perfomance.
var _callbacks = {};

/** Class EventEmitter for event-driven architecture. */
var EE = /*#__PURE__*/function () {
  /**
   * Constructor.
   *
   * @constructor
   * @param {number|null} maxListeners.
   * @param {object} localConsole.
   *
   * Set private initial parameters:
   *   _events, _callbacks, _maxListeners, _console.
   *
   * @return {this}
   */
  function EventEmitter(maxListeners, localConsole) {
    if (maxListeners === void 0) {
      maxListeners = null;
    }
    if (localConsole === void 0) {
      localConsole = console;
    }
    var self = internal(this);
    self._events = new Set();
    self._console = localConsole;
    self._maxListeners = maxListeners === null ? null : parseInt(maxListeners, 10);
    return this;
  }

  /**
   * Add callback to the event.
   *
   * @param {string} eventName.
   * @param {function} callback
   * @param {object|null} context - In than context will be called callback.
   * @param {number} weight - Using for sorting callbacks calls.
   *
   * @return {this}
   */
  var _proto2 = EventEmitter.prototype;
  _proto2._addCallback = function _addCallback(eventName, callback, context, weight) {
    var _this4 = this;
    this._getCallbacks(eventName).push({
      callback: callback,
      context: context,
      weight: weight
    });

    // @todo instead of sorting insert to right place in Array.
    // @link http://rjzaworski.com/2013/03/composition-in-javascript

    // Sort the array of callbacks in
    // the order of their call by "weight".
    this._getCallbacks(eventName).sort(function (a, b) {
      _newArrowCheck(this, _this4);
      return b.weight - a.weight;
    }.bind(this));
    return this;
  }

  /**
   * Get all callback for the event.
   *
   * @param {string} eventName
   *
   * @return {object|undefined}
   */;
  _proto2._getCallbacks = function _getCallbacks(eventName) {
    return _callbacks[eventName];
  }

  /**
   * Get callback's index for the event.
   *
   * @param {string} eventName
   * @param {callback} callback
   *
   * @return {number|null}
   */;
  _proto2._getCallbackIndex = function _getCallbackIndex(eventName, callback) {
    var _this5 = this;
    return this._has(eventName) ? this._getCallbacks(eventName).findIndex(function (element) {
      _newArrowCheck(this, _this5);
      return element.callback === callback;
    }.bind(this)) : -1;
  }

  /**
   * Check if we achive maximum of listeners for the event.
   *
   * @param {string} eventName
   *
   * @return {bool}
   */;
  _proto2._achieveMaxListener = function _achieveMaxListener(eventName) {
    return internal(this)._maxListeners !== null && internal(this)._maxListeners <= this.listenersNumber(eventName);
  }

  /**
   * Check if callback is already exists for the event.
   *
   * @param {string} eventName
   * @param {function} callback
   * @param {object|null} context - In than context will be called callback.
   *
   * @return {bool}
   */;
  _proto2._callbackIsExists = function _callbackIsExists(eventName, callback, context) {
    var callbackInd = this._getCallbackIndex(eventName, callback);
    var activeCallback = callbackInd !== -1 ? this._getCallbacks(eventName)[callbackInd] : void 0;
    return callbackInd !== -1 && activeCallback && activeCallback.context === context;
  }

  /**
   * Check is the event was already added.
   *
   * @param {string} eventName
   *
   * @return {bool}
   */;
  _proto2._has = function _has(eventName) {
    return internal(this)._events.has(eventName);
  }

  /**
   * Add the listener.
   *
   * @param {string} eventName
   * @param {function} callback
   * @param {object|null} context - In than context will be called callback.
   * @param {number} weight - Using for sorting callbacks calls.
   *
   * @return {this}
   */;
  _proto2.on = function on(eventName, callback, context, weight) {
    if (context === void 0) {
      context = null;
    }
    if (weight === void 0) {
      weight = 1;
    }
    /* eslint no-unused-vars: 0 */
    var self = internal(this);
    if (typeof callback !== 'function') {
      throw new TypeError(callback + " is not a function");
    }

    // If event wasn't added before - just add it
    // and define callbacks as an empty object.
    if (!this._has(eventName)) {
      self._events.add(eventName);
      _callbacks[eventName] = [];
    } else {
      // Check if we reached maximum number of listeners.
      if (this._achieveMaxListener(eventName)) {
        self._console.warn("Max listeners (" + self._maxListeners + ")" + (" for event \"" + eventName + "\" is reached!"));
      }

      // Check if the same callback has already added.
      if (this._callbackIsExists.apply(this, arguments)) {
        self._console.warn("Event \"" + eventName + "\"" + (" already has the callback " + callback + "."));
      }
    }
    this._addCallback.apply(this, arguments);
    return this;
  }

  /**
   * Add the listener which will be executed only once.
   *
   * @param {string} eventName
   * @param {function} callback
   * @param {object|null} context - In than context will be called callback.
   * @param {number} weight - Using for sorting callbacks calls.
   *
   * @return {this}
   */;
  _proto2.once = function once(eventName, callback, context, weight) {
    var _this6 = this;
    if (context === void 0) {
      context = null;
    }
    if (weight === void 0) {
      weight = 1;
    }
    var onceCallback = function onceCallback() {
      _this6.off(eventName, onceCallback);
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return callback.call(context, args);
    };
    return this.on(eventName, onceCallback, context, weight);
  }

  /**
   * Remove an event at all or just remove selected callback from the event.
   *
   * @param {string} eventName
   * @param {function} callback
   *
   * @return {this}
   */;
  _proto2.off = function off(eventName, callback) {
    if (callback === void 0) {
      callback = null;
    }
    var self = internal(this);
    var callbackInd;
    if (this._has(eventName)) {
      if (callback === null) {
        // Remove the event.
        self._events["delete"](eventName);
        // Remove all listeners.
        _callbacks[eventName] = null;
      } else {
        callbackInd = this._getCallbackIndex(eventName, callback);
        if (callbackInd !== -1) {
          this._getCallbacks(eventName).splice(callbackInd, 1);
          // Remove all equal callbacks.
          this.off.apply(this, arguments);
        }
      }
    }
    return this;
  }

  /**
   * Trigger the event.
   *
   * @param {string} eventName
   * @param {...args} args - All arguments which should be passed into callbacks.
   *
   * @return {this}
   */;
  _proto2.emit = function emit(eventName /* , ...args*/) {
    /*
      if (this._has(eventName)) {
        this._getCallbacks(eventName)
          .forEach(element =>
            element.callback.call(element.context, args)
          );
      }
    */

    // It works ~3 times faster.
    var custom = _callbacks[eventName];
    // Number of callbacks.
    var i = custom ? custom.length : 0;
    var len = arguments.length;
    var args;
    var current;
    if (i > 0 && len > 1) {
      args = new Array(len - 1);
      while (len--) {
        if (len === 1) {
          // We do not need first argument.
          break;
        }
        args[len] = arguments[len];
      }
    }
    while (i--) {
      current = custom[i];
      if (arguments.length > 1) {
        current.callback.call(current.context, args);
      } else {
        current.callback.call(current.context);
      }
    }

    // Just clean it.
    args = null;
    return this;
  }

  /**
   * Clear all events and callback links.
   *
   * @return {this}
   */;
  _proto2.clear = function clear() {
    internal(this)._events.clear();
    _callbacks = {};
    return this;
  }

  /**
   * Returns number of listeners for the event.
   *
   * @param {string} eventName
   *
   * @return {number|null} - Number of listeners for event
   *                         or null if event isn't exists.
   */;
  _proto2.listenersNumber = function listenersNumber(eventName) {
    return this._has(eventName) ? _callbacks[eventName].length : null;
  };
  return EventEmitter;
}();

/* Copyright 2015-present Facebook, Inc.
 * Licensed under the Apache License, Version 2.0 */
var BSER = function () {
  var exports = {};
  // BSER uses the local endianness to reduce byte swapping overheads
  // (the protocol is expressly local IPC only).  We need to tell node
  // to use the native endianness when reading various native values.
  var isBigEndian = 'BE' == 'BE';

  // Find the next power-of-2 >= size
  function nextPow2(size) {
    return Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));
  }

  // Expandable buffer that we can provide a size hint for
  function Accumulator(initsize) {
    this.buf = Buffer.alloc(nextPow2(initsize || 8192));
    this.readOffset = 0;
    this.writeOffset = 0;
  }

  // For testing
  exports.Accumulator = Accumulator;

  // How much we can write into this buffer without allocating
  Accumulator.prototype.writeAvail = function () {
    return this.buf.length - this.writeOffset;
  };

  // How much we can read
  Accumulator.prototype.readAvail = function () {
    return this.writeOffset - this.readOffset;
  };

  // Ensure that we have enough space for size bytes
  Accumulator.prototype.reserve = function (size) {
    if (size < this.writeAvail()) {
      return;
    }

    // If we can make room by shunting down, do so
    if (this.readOffset > 0) {
      this.buf.copy(this.buf, 0, this.readOffset, this.writeOffset);
      this.writeOffset -= this.readOffset;
      this.readOffset = 0;
    }

    // If we made enough room, no need to allocate more
    if (size < this.writeAvail()) {
      return;
    }

    // Allocate a replacement and copy it in
    var buf = Buffer.alloc(nextPow2(this.buf.length + size - this.writeAvail()));
    this.buf.copy(buf);
    this.buf = buf;
  };

  // Append buffer or string.  Will resize as needed
  Accumulator.prototype.append = function (buf) {
    if (Buffer.isBuffer(buf)) {
      this.reserve(buf.length);
      buf.copy(this.buf, this.writeOffset, 0, buf.length);
      this.writeOffset += buf.length;
    } else {
      var size = Buffer.byteLength(buf);
      this.reserve(size);
      this.buf.write(buf, this.writeOffset);
      this.writeOffset += size;
    }
  };
  Accumulator.prototype.assertReadableSize = function (size) {
    if (this.readAvail() < size) {
      throw new Error("wanted to read " + size + " bytes but only have " + this.readAvail());
    }
  };
  Accumulator.prototype.peekString = function (size) {
    this.assertReadableSize(size);
    return this.buf.toString('utf-8', this.readOffset, this.readOffset + size);
  };
  Accumulator.prototype.readString = function (size) {
    var str = this.peekString(size);
    this.readOffset += size;
    return str;
  };
  Accumulator.prototype.peekInt = function (size) {
    this.assertReadableSize(size);
    switch (size) {
      case 1:
        return this.buf.readInt8(this.readOffset, size);
      case 2:
        return isBigEndian ? this.buf.readInt16BE(this.readOffset, size) : this.buf.readInt16LE(this.readOffset, size);
      case 4:
        return isBigEndian ? this.buf.readInt32BE(this.readOffset, size) : this.buf.readInt32LE(this.readOffset, size);
      case 8:
        var big = this.buf.slice(this.readOffset, this.readOffset + 8);
        if (isBigEndian) {
          // On a big endian system we can simply pass the buffer directly
          return new Int64(big);
        }
        // Otherwise we need to byteswap
        return new Int64(byteswap64(big));
      default:
        throw new Error("invalid integer size " + size);
    }
  };
  Accumulator.prototype.readInt = function (bytes) {
    var ival = this.peekInt(bytes);
    if (ival instanceof Int64 && isFinite(ival.valueOf())) {
      ival = ival.valueOf();
    }
    this.readOffset += bytes;
    return ival;
  };
  Accumulator.prototype.peekDouble = function () {
    this.assertReadableSize(8);
    return isBigEndian ? this.buf.readDoubleBE(this.readOffset) : this.buf.readDoubleLE(this.readOffset);
  };
  Accumulator.prototype.readDouble = function () {
    var dval = this.peekDouble();
    this.readOffset += 8;
    return dval;
  };
  Accumulator.prototype.readAdvance = function (size) {
    if (size > 0) {
      this.assertReadableSize(size);
    } else if (size < 0 && this.readOffset + size < 0) {
      throw new Error("advance with negative offset " + size + " would seek off the start of the buffer");
    }
    this.readOffset += size;
  };
  Accumulator.prototype.writeByte = function (value) {
    this.reserve(1);
    this.buf.writeInt8(value, this.writeOffset);
    ++this.writeOffset;
  };
  Accumulator.prototype.writeInt = function (value, size) {
    this.reserve(size);
    switch (size) {
      case 1:
        this.buf.writeInt8(value, this.writeOffset);
        break;
      case 2:
        if (isBigEndian) {
          this.buf.writeInt16BE(value, this.writeOffset);
        } else {
          this.buf.writeInt16LE(value, this.writeOffset);
        }
        break;
      case 4:
        if (isBigEndian) {
          this.buf.writeInt32BE(value, this.writeOffset);
        } else {
          this.buf.writeInt32LE(value, this.writeOffset);
        }
        break;
      default:
        throw new Error("unsupported integer size " + size);
    }
    this.writeOffset += size;
  };
  Accumulator.prototype.writeDouble = function (value) {
    this.reserve(8);
    if (isBigEndian) {
      this.buf.writeDoubleBE(value, this.writeOffset);
    } else {
      this.buf.writeDoubleLE(value, this.writeOffset);
    }
    this.writeOffset += 8;
  };
  var BSER_ARRAY = 0x00;
  var BSER_OBJECT = 0x01;
  var BSER_STRING = 0x02;
  var BSER_INT8 = 0x03;
  var BSER_INT16 = 0x04;
  var BSER_INT32 = 0x05;
  var BSER_INT64 = 0x06;
  var BSER_REAL = 0x07;
  var BSER_TRUE = 0x08;
  var BSER_FALSE = 0x09;
  var BSER_NULL = 0x0a;
  var BSER_TEMPLATE = 0x0b;
  var BSER_SKIP = 0x0c;
  var ST_NEED_PDU = 0; // Need to read and decode PDU length
  var ST_FILL_PDU = 1; // Know the length, need to read whole content

  var MAX_INT8 = 127;
  var MAX_INT16 = 32767;
  var MAX_INT32 = 2147483647;
  function BunserBuf() {
    EE.call(this);
    this.buf = new Accumulator();
    this.state = ST_NEED_PDU;
  }
  inherits(BunserBuf, EE);
  exports.BunserBuf = BunserBuf;
  BunserBuf.prototype.append = function (buf, synchronous) {
    if (synchronous) {
      this.buf.append(buf);
      return this.process(synchronous);
    }
    try {
      this.buf.append(buf);
    } catch (err) {
      this.emit('error', err);
      return;
    }
    // Arrange to decode later.  This allows the consuming
    // application to make progress with other work in the
    // case that we have a lot of subscription updates coming
    // in from a large tree.
    this.processLater();
  };
  BunserBuf.prototype.processLater = function () {
    var self = this;
    process.nextTick(function () {
      try {
        self.process(false);
      } catch (err) {
        self.emit('error', err);
      }
    });
  };

  // Do something with the buffer to advance our state.
  // If we're running synchronously we'll return either
  // the value we've decoded or undefined if we don't
  // yet have enought data.
  // If we're running asynchronously, we'll emit the value
  // when it becomes ready and schedule another invocation
  // of process on the next tick if we still have data we
  // can process.
  BunserBuf.prototype.process = function (synchronous) {
    if (this.state == ST_NEED_PDU) {
      if (this.buf.readAvail() < 2) {
        return;
      }
      // Validate BSER header
      this.expectCode(0);
      this.expectCode(1);
      this.pduLen = this.decodeInt(true /* relaxed */);
      if (this.pduLen === false) {
        // Need more data, walk backwards
        this.buf.readAdvance(-2);
        return;
      }
      // Ensure that we have a big enough buffer to read the rest of the PDU
      this.buf.reserve(this.pduLen);
      this.state = ST_FILL_PDU;
    }
    if (this.state == ST_FILL_PDU) {
      if (this.buf.readAvail() < this.pduLen) {
        // Need more data
        return;
      }

      // We have enough to decode it
      var val = this.decodeAny();
      if (synchronous) {
        return val;
      }
      this.emit('value', val);
      this.state = ST_NEED_PDU;
    }
    if (!synchronous && this.buf.readAvail() > 0) {
      this.processLater();
    }
  };
  BunserBuf.prototype.raise = function (reason) {
    throw new Error(reason + ", in Buffer of length " + this.buf.buf.length + " (" + this.buf.readAvail() + " readable) at offset " + this.buf.readOffset + " buffer: " + JSON.stringify(this.buf.buf.slice(this.buf.readOffset, this.buf.readOffset + 32).toJSON()));
  };
  BunserBuf.prototype.expectCode = function (expected) {
    var code = this.buf.readInt(1);
    if (code != expected) {
      this.raise("expected bser opcode " + expected + " but got " + code);
    }
  };
  BunserBuf.prototype.decodeAny = function () {
    var code = this.buf.peekInt(1);
    switch (code) {
      case BSER_INT8:
      case BSER_INT16:
      case BSER_INT32:
      case BSER_INT64:
        return this.decodeInt();
      case BSER_REAL:
        this.buf.readAdvance(1);
        return this.buf.readDouble();
      case BSER_TRUE:
        this.buf.readAdvance(1);
        return true;
      case BSER_FALSE:
        this.buf.readAdvance(1);
        return false;
      case BSER_NULL:
        this.buf.readAdvance(1);
        return null;
      case BSER_STRING:
        return this.decodeString();
      case BSER_ARRAY:
        return this.decodeArray();
      case BSER_OBJECT:
        return this.decodeObject();
      case BSER_TEMPLATE:
        return this.decodeTemplate();
      default:
        this.raise("unhandled bser opcode " + code);
    }
  };
  BunserBuf.prototype.decodeArray = function () {
    this.expectCode(BSER_ARRAY);
    var nitems = this.decodeInt();
    var arr = [];
    for (var i = 0; i < nitems; ++i) {
      arr.push(this.decodeAny());
    }
    return arr;
  };
  BunserBuf.prototype.decodeObject = function () {
    this.expectCode(BSER_OBJECT);
    var nitems = this.decodeInt();
    var res = {};
    for (var i = 0; i < nitems; ++i) {
      var key = this.decodeString();
      var val = this.decodeAny();
      res[key] = val;
    }
    return res;
  };
  BunserBuf.prototype.decodeTemplate = function () {
    this.expectCode(BSER_TEMPLATE);
    var keys = this.decodeArray();
    var nitems = this.decodeInt();
    var arr = [];
    for (var i = 0; i < nitems; ++i) {
      var obj = {};
      for (var keyidx = 0; keyidx < keys.length; ++keyidx) {
        if (this.buf.peekInt(1) == BSER_SKIP) {
          this.buf.readAdvance(1);
          continue;
        }
        var val = this.decodeAny();
        obj[keys[keyidx]] = val;
      }
      arr.push(obj);
    }
    return arr;
  };
  BunserBuf.prototype.decodeString = function () {
    this.expectCode(BSER_STRING);
    var len = this.decodeInt();
    return this.buf.readString(len);
  };

  // This is unusual compared to the other decode functions in that
  // we may not have enough data available to satisfy the read, and
  // we don't want to throw.  This is only true when we're reading
  // the PDU length from the PDU header; we'll set relaxSizeAsserts
  // in that case.
  BunserBuf.prototype.decodeInt = function (relaxSizeAsserts) {
    if (relaxSizeAsserts && this.buf.readAvail() < 1) {
      return false;
    } else {
      this.buf.assertReadableSize(1);
    }
    var code = this.buf.peekInt(1);
    var size = 0;
    switch (code) {
      case BSER_INT8:
        size = 1;
        break;
      case BSER_INT16:
        size = 2;
        break;
      case BSER_INT32:
        size = 4;
        break;
      case BSER_INT64:
        size = 8;
        break;
      default:
        this.raise("invalid bser int encoding " + code);
    }
    if (relaxSizeAsserts && this.buf.readAvail() < 1 + size) {
      return false;
    }
    this.buf.readAdvance(1);
    return this.buf.readInt(size);
  };

  // synchronously BSER decode a string and return the value
  function loadFromBuffer(input) {
    var buf = new BunserBuf();
    var result = buf.append(input, true);
    if (buf.buf.readAvail()) {
      throw Error('excess data found after input buffer, use BunserBuf instead');
    }
    if (typeof result === 'undefined') {
      throw Error('no bser found in string and no error raised!?');
    }
    return result;
  }
  exports.unpack = loadFromBuffer;

  // Byteswap an arbitrary buffer, flipping from one endian
  // to the other, returning a new buffer with the resultant data
  function byteswap64(buf) {
    var swap = Buffer.alloc(buf.length);
    for (var i = 0; i < buf.length; i++) {
      swap[i] = buf[buf.length - 1 - i];
    }
    return swap;
  }
  function dump_int64(buf, val) {
    // Get the raw bytes.  The Int64 buffer is big endian
    var be = val.toBuffer();
    if (isBigEndian) {
      // We're a big endian system, so the buffer is exactly how we
      // want it to be
      buf.writeByte(BSER_INT64);
      buf.append(be);
      return;
    }
    // We need to byte swap to get the correct representation
    var le = byteswap64(be);
    buf.writeByte(BSER_INT64);
    buf.append(le);
  }
  function dump_int(buf, val) {
    var abs = Math.abs(val);
    if (abs <= MAX_INT8) {
      buf.writeByte(BSER_INT8);
      buf.writeInt(val, 1);
    } else if (abs <= MAX_INT16) {
      buf.writeByte(BSER_INT16);
      buf.writeInt(val, 2);
    } else if (abs <= MAX_INT32) {
      buf.writeByte(BSER_INT32);
      buf.writeInt(val, 4);
    } else {
      dump_int64(buf, new Int64(val));
    }
  }
  function dump_any(buf, val) {
    switch (typeof val) {
      case 'number':
        // check if it is an integer or a float
        if (isFinite(val) && Math.floor(val) === val) {
          dump_int(buf, val);
        } else {
          buf.writeByte(BSER_REAL);
          buf.writeDouble(val);
        }
        return;
      case 'string':
        buf.writeByte(BSER_STRING);
        dump_int(buf, Buffer.byteLength(val));
        buf.append(val);
        return;
      case 'boolean':
        buf.writeByte(val ? BSER_TRUE : BSER_FALSE);
        return;
      case 'object':
        if (val === null) {
          buf.writeByte(BSER_NULL);
          return;
        }
        if (val instanceof Int64) {
          dump_int64(buf, val);
          return;
        }
        if (Array.isArray(val)) {
          buf.writeByte(BSER_ARRAY);
          dump_int(buf, val.length);
          for (var i = 0; i < val.length; ++i) {
            dump_any(buf, val[i]);
          }
          return;
        }
        buf.writeByte(BSER_OBJECT);
        var keys = Object.keys(val);

        // First pass to compute number of defined keys
        var num_keys = keys.length;
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var v = val[key];
          if (typeof v == 'undefined') {
            num_keys--;
          }
        }
        dump_int(buf, num_keys);
        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var v = val[key];
          if (typeof v == 'undefined') {
            // Don't include it
            continue;
          }
          dump_any(buf, key);
          try {
            dump_any(buf, v);
          } catch (e) {
            throw new Error(e.message + ' (while serializing object property with name `' + key + "')");
          }
        }
        return;
      default:
        throw new Error('cannot serialize type ' + typeof val + ' to BSER');
    }
  }

  // BSER encode value and return a buffer of the contents
  function dumpToBuffer(val) {
    var buf = new Accumulator();
    // Build out the header
    buf.writeByte(0);
    buf.writeByte(1);
    // Reserve room for an int32 to hold our PDU length
    buf.writeByte(BSER_INT32);
    buf.writeInt(0, 4); // We'll come back and fill this in at the end

    dump_any(buf, val);

    // Compute PDU length
    var off = buf.writeOffset;
    var len = off - 7 /* the header length */;
    buf.writeOffset = 3; // The length value to fill in
    buf.writeInt(len, 4); // write the length in the space we reserved
    buf.writeOffset = off;
    return buf.buf.slice(0, off);
  }
  exports.pack = dumpToBuffer;
  return exports;
}();

/*
 * The MIT License (MIT)
 * Copyright © 2017 Nicolas Froidure (https://github.com/nfroidure/utf-8)
 * Copyright © 2022 Affolter Matias
*/

var UTF8 = function UTF8() {
  if (!(this instanceof UTF8)) {
    return new UTF8();
  }
  this.BMC_LENGTH_ = UTF8.config.BMC_LENGTH;
  this.BMC_CODE_ = UTF8.config.BMC_CODE;
  this.FIRST_BYTE_MASK_ = UTF8.config.FIRST_BYTE_MASK;
  this.INTEGRITY_BYTE_MASK_ = UTF8.config.INTEGRITY_BYTE_MASK;
  this.READING_BYTE_MASK_ = UTF8.config.READING_BYTE_MASK;
  this.char_code_ = 0;
  this.char_length_ = 0;
};
UTF8.prototype.imul = Math.imul;
UTF8.config = {};
UTF8.config.BMC_LENGTH = Uint8Array.of(0, 127, 192, 224, 240);
UTF8.config.BMC_CODE = Uint32Array.of(0, 128, 2048, 65536, 2097152);
UTF8.config.FIRST_BYTE_MASK = Uint8Array.of(0, 1, 3, 7, 15);
UTF8.config.INTEGRITY_BYTE_MASK = Uint8Array.of(0, 64, 32, 16, 8);
UTF8.config.READING_BYTE_MASK = Uint8Array.of(0, 63, 31, 15, 7);
Object.defineProperty(UTF8.prototype, 'char_code', {
  get: function get() {
    return this.char_code_ & 0xFFFF;
  },
  set: function get(n) {
    this.char_code_ = n & 0xFFFF;
  }
});
Object.defineProperty(UTF8.prototype, 'char_length', {
  get: function get() {
    return this.char_length_ & 0xFFFFFFFF;
  },
  set: function get(n) {
    this.char_length_ = n & 0xFFFFFFFF;
  }
});
Object.defineProperty(UTF8.prototype, 'BMC_LENGTH_E', {
  get: function get() {
    return function (i) {
      return this.BMC_LENGTH_[i | 0] & 0xFF;
    };
  }
});
Object.defineProperty(UTF8.prototype, 'BMC_CODE_E', {
  get: function get() {
    return function (i) {
      return this.BMC_CODE_[i | 0] & 0xFFFFFFFF;
    };
  }
});
Object.defineProperty(UTF8.prototype, 'FIRST_BYTE_MASK_E', {
  get: function get() {
    return function (i) {
      return this.FIRST_BYTE_MASK_[i | 0] & 0xF;
    };
  }
});
Object.defineProperty(UTF8.prototype, 'INTEGRITY_BYTE_MASK_E', {
  get: function get() {
    return function (i) {
      return this.INTEGRITY_BYTE_MASK_[i | 0] & 0xFF;
    };
  }
});
Object.defineProperty(UTF8.prototype, 'READING_BYTE_MASK_E', {
  get: function get() {
    return function (i) {
      return this.READING_BYTE_MASK_[i | 0] & 0xFF;
    };
  }
});
UTF8.prototype._getCharLength = function (_byte2) {
  if (this.BMC_LENGTH_E(4) == (_byte2 & this.BMC_LENGTH_E(4))) {
    return 4;
  } else if (this.BMC_LENGTH_E(3) == (_byte2 & this.BMC_LENGTH_E(3))) {
    return 3;
  } else if (this.BMC_LENGTH_E(2) == (_byte2 & this.BMC_LENGTH_E(2))) {
    return 2;
  } else if (_byte2 == (_byte2 & this.BMC_LENGTH_E(1))) {
    return 1;
  } else {
    return 0;
  }
};
UTF8.prototype._getBytesForCharCode = function (cc) {
  if (cc < this.BMC_CODE_E(1)) {
    return 1;
  } else if (cc < this.BMC_CODE_E(2)) {
    return 2;
  } else if (cc < this.BMC_CODE_E(3)) {
    return 3;
  } else if (cc < this.BMC_CODE_E(4)) {
    return 4;
  } else {
    throw new Error('CharCode ' + cc + ' cannot be encoded with UTF8.');
  }
};
UTF8.prototype._setBytesFromCharCode = function (charCode, bytes, byteOffset, neededBytes) {
  this.char_code = charCode | 0;
  bytes = bytes || [];
  byteOffset = byteOffset | 0;
  neededBytes = neededBytes | 0;
  neededBytes = (neededBytes | 0) == 0 ? this._getBytesForCharCode(this.char_code) : neededBytes | 0;
  // Setting the charCode as it to bytes if the byte length is 1
  if (1 == (neededBytes | 0)) {
    bytes[byteOffset | 0] = this.char_code | 0;
  } else {
    // Computing the first byte
    neededBytes = neededBytes - 1 | 0;
    bytes[byteOffset | 0] = (this.FIRST_BYTE_MASK_E(neededBytes) << 8 - neededBytes) + (this.char_code >>> neededBytes * 6) | 0;
    byteOffset = byteOffset + 1 | 0;
    // Computing next bytes
    for (; (neededBytes | 0) > 0;) {
      neededBytes = neededBytes - 1 | 0;
      bytes[byteOffset | 0] = this.char_code >>> neededBytes * 6 & 0x3f | 0x80 | 0;
      byteOffset = byteOffset + 1 | 0;
    }
  }
};
UTF8.prototype.toUint8Array = function (string, bytes, byteOffset, byteLength, strict) {
  string = string || '';
  bytes = bytes || [];
  byteOffset = byteOffset | 0;
  byteLength = 'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
  for (var i = 0, j = string.length | 0; (i | 0) < (j | 0); i = i + 1 | 0) {
    var neededBytes = this._getBytesForCharCode(string[i].codePointAt(0));
    if (strict && (byteOffset + neededBytes | 0) > (byteLength | 0)) {
      throw new Error('Not enought bytes to encode the char "' + string[i | 0] + '" at the offset "' + byteOffset + '".');
    } else {
      this._setBytesFromCharCode(string[i | 0].codePointAt(0), bytes, byteOffset | 0, neededBytes | 0, strict);
      byteOffset = byteOffset + neededBytes | 0;
    }
  }
  return bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
};
UTF8.prototype._getCharCode = function (bytes, byteOffset, charLength) {
  this.char_code = 0;
  byteOffset = byteOffset | 0;
  // Retrieve charLength if not given
  this.char_length = (charLength | 0) == 0 ? this._getCharLength(bytes[byteOffset]) : charLength | 0;

  // validate that the array has at least one byte in it
  if (bytes.length - byteOffset <= 0) {
    throw new Error('No more characters remaining in array.');
  }
  if ((this.char_length | 0) == 0) {
    throw new Error(bytes[byteOffset].toString(2) + ' is not a significative' + ' byte (offset:' + byteOffset + ').');
  }
  // Return byte value if charlength is 1
  if (1 == (this.char_length | 0)) {
    return bytes[byteOffset | 0] | 0;
  }
  // validate that the array has enough bytes to make up this character
  if ((bytes.length - byteOffset | 0) < (this.char_length | 0)) {
    throw new Error('Expected at least ' + this.char_length + ' bytes remaining in array.');
  }
  // Test UTF8 integrity
  if (bytes[byteOffset] & this.INTEGRITY_BYTE_MASK_E(this.char_length)) {
    throw Error('Index ' + byteOffset + ': A ' + this.char_length + ' bytes' + ' encoded char' + ' cannot encode the ' + (this.char_length + 1) + 'th rank bit to 1.');
  }
  // Reading the first byte
  this.char_length = this.char_length - 1 | 0;
  this.char_code = this.char_code + ((bytes[byteOffset | 0] & this.READING_BYTE_MASK_E(this.char_length)) << this.char_length * 6) | 0;
  // Reading the next bytes
  while (this.char_length) {
    if (0x80 !== (bytes[byteOffset + 1] & 0x80) || 0x40 === (bytes[byteOffset + 1] & 0x40)) {
      throw Error('Index ' + (byteOffset + 1) + ': Next bytes of encoded char' + ' must begin with a "10" bit sequence.');
    }
    byteOffset = byteOffset + 1 | 0;
    this.char_length = this.char_length - 1 | 0;
    this.char_code = this.char_code + ((bytes[byteOffset | 0] & 0x3f) << this.char_length * 6) | 0;
  }
  return this.char_code | 0;
};
UTF8.prototype.fromUint8Array = function (bytes, byteOffset, byteLength, strict) {
  this.char_length = 0;
  var chars = "";
  byteOffset = byteOffset | 0;
  byteLength = 'number' === typeof byteLength ? byteLength : bytes.byteLength || bytes.length | 0;
  for (; (byteOffset | 0) < (byteLength | 0); (byteOffset = byteOffset + 1 | 0) >>> 0) {
    this.char_length = this._getCharLength(bytes[byteOffset]);
    if (strict && (byteOffset + this.char_length | 0) > (byteLength | 0)) {
      throw Error('Index ' + byteOffset + ': Found a ' + this.char_length + ' bytes encoded char declaration but only ' + (byteLength - byteOffset) + ' bytes are available.');
    } else {
      chars = chars.concat(String.fromCodePoint(this._getCharCode(bytes, byteOffset | 0, this.char_length | 0, strict)));
    }
    byteOffset = byteOffset + this.char_length - 1 | 0;
  }
  return chars;
};
UTF8.prototype.isNotUTF8 = function (bytes, byteOffset, byteLength) {
  try {
    this.fromUint8Array(bytes, byteOffset, byteLength, true);
  } catch (e) {
    return true;
  }
  return false;
};

/*
* The MIT License (MIT)
*
* Copyright (c) 2023 Affolter Matias
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

var UraniumJS = function UraniumJS(data, base) {
  if (!(this instanceof UraniumJS)) {
    return new UraniumJS(data);
  }
  base = base || "UNKNOWN";
  base = base.toUpperCase();
  if (base != "BASE64") {
    if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
      this.storage_input_ = data;
    } else if (typeof data == "string") {
      this.storage_input_ = UraniumJS.UTF8.toUint8Array(data);
    } else if (typeof data.buffer != "undefined" || data instanceof ArrayBuffer) {
      this.storage_input_ = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer);
    } else if (data instanceof Array) {
      this.storage_input_ = Uint8Array.from(data);
    } else if (typeof data === "object") {
      this.storage_input_ = UraniumJS.BSER.pack(data);
    } else {
      throw new TypeError("attempted to parse failed");
    }
  } else {
    this.storage_input_ = UraniumJS.BASE64.toUint8Array(data);
  }
  this.storage_input_length_ = data.length | 0;
  this.TILD_CHAR_CODE_ = UraniumJS.config.TILD_CHAR_CODE;
  this.BACKSLASH_CHAR_ = UraniumJS.config.BACKSLASH_CHAR;
  this.SLASH_CHAR_ = UraniumJS.config.SLASH_CHAR;
  this.CHUNCK_LENGTH_ = UraniumJS.config.CHUNCK_LENGTH;
  this.ENCODE_MAPPING_ = UraniumJS.config.ENCODE_MAPPING;
  this.DECODE_MAPPING_ = UraniumJS.config.DECODE_MAPPING;
  return this;
};
UraniumJS.BSER = BSER;
UraniumJS.UTF8 = new UTF8();
UraniumJS.config = {};
UraniumJS.config.TILD_CHAR_CODE = 126;
UraniumJS.config.BACKSLASH_CHAR = String.fromCharCode(92);
UraniumJS.config.SLASH_CHAR = String.fromCharCode(47);
UraniumJS.config.CHUNCK_LENGTH = 256;
UraniumJS.config.ENCODE_MAPPING = Uint8Array.of(33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
UraniumJS.config.DECODE_MAPPING = Uint8Array.of(255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255);
Object.defineProperty(UraniumJS.prototype, 'getCharCodeAt', {
  get: function get() {
    return function (i) {
      i = i | 0;
      return this.storage_input_[i | 0];
    };
  }
});
Object.defineProperty(UraniumJS.prototype, 'getDecodedCharCodeAt', {
  get: function get() {
    return function (i) {
      i = i | 0;
      return this.DECODE_MAPPING_[this.storage_input_[i | 0]];
    };
  }
});
Object.defineProperty(UraniumJS.prototype, 'decodeChar', {
  get: function get() {
    return function (i) {
      i = i | 0;
      return this.DECODE_MAPPING_[i | 0];
    };
  }
});
Object.defineProperty(UraniumJS.prototype, 'encodeChar', {
  get: function get() {
    return function (i) {
      i = i | 0;
      return this.ENCODE_MAPPING_[i | 0];
    };
  }
});
Object.defineProperty(UraniumJS.prototype, 'inputLength', {
  get: function get() {
    return this.storage_input_length_ | 0;
  }
});
Object.defineProperty(UraniumJS.prototype, 'BACKSLASH_CHAR', {
  get: function get() {
    return this.BACKSLASH_CHAR_;
  }
});
Object.defineProperty(UraniumJS.prototype, 'SLASH_CHAR', {
  get: function get() {
    return this.SLASH_CHAR_;
  }
});
Object.defineProperty(UraniumJS.prototype, 'CHUNCK_LENGTH', {
  get: function get() {
    return this.CHUNCK_LENGTH_;
  }
});
Object.defineProperty(UraniumJS.prototype, 'TILD_CHAR_CODE', {
  get: function get() {
    return this.TILD_CHAR_CODE_;
  }
});
UraniumJS.utils = {};
UraniumJS.utils.onlyCharPrintable = function (string) {
  // remove non-printable and other non-valid JSON chars
  return string.replace(/[\u0000-\u0019]+/g, "");
};
UraniumJS.utils.onlyCharParsable = function (string) {
  // This function is required because JSON is weird with some char
  string = string.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
  return string;
};
UraniumJS.utils.MAGIC_WORD = "UraniumJS! ";
UraniumJS.utils.parse = function (string) {
  return JSON.parse(UraniumJS.utils.onlyCharParsable(string));
};
UraniumJS.utils.stringify = function (string) {
  return UraniumJS.utils.onlyCharPrintable(JSON.stringify(string));
};
UraniumJS.utils.escape = function (string) {
  string = string.replaceAll(UraniumJS.config.BACKSLASH_CHAR, " ");
  string = string.replaceAll(UraniumJS.config.SLASH_CHAR, "~");
  string = string.replaceAll("$", "¡");
  return UraniumJS.utils.MAGIC_WORD + string.replaceAll("'", "§");
};
UraniumJS.utils.unescape = function (string) {
  string = string.replaceAll(UraniumJS.utils.MAGIC_WORD, "");
  string = string.replaceAll("§", "'");
  string = string.replaceAll("¡", "$");
  string = string.replaceAll("~", UraniumJS.config.SLASH_CHAR);
  return string.replaceAll(" ", UraniumJS.config.BACKSLASH_CHAR);
};
UraniumJS.prototype.encode = function (desired_output) {
  desired_output = "" + desired_output;
  var i = 0,
    j = 0; // i for raw, j for encoded
  var size = (this.inputLength * 8 | 0) % 13 | 0; // for the malloc
  var workspace = 0; // bits holding bin
  var wssize = 0; // number of good bits in workspace
  var tmp = 0;
  var c = 0;
  if ((this.inputLength | 0) == 0) {
    switch (desired_output.replaceAll("-", "").toUpperCase()) {
      case "UINT8ARRAY":
        return Uint8Array.of(this.TILD_CHAR_CODE);
      case "BASE64":
        return UraniumJS.BASE64.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
      default:
        // BASE92
        return UraniumJS.UTF8.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
    }
  }

  // precalculate how much space we need to malloc
  if ((size | 0) == 0) {
    size = 2 * (this.inputLength * 8 / 13 | 0) | 0;
  } else if ((size | 0) < 7) {
    size = 2 * (this.inputLength * 8 / 13 | 0) + 1 | 0;
  } else {
    size = 2 * (this.inputLength * 8 / 13 | 0) + 2 | 0;
  }

  // do the malloc
  var results = new Uint8Array(size | 0);
  for (; (i | 0) < (this.inputLength | 0); i = (i + 1 | 0) >>> 0) {
    workspace = workspace << 8 | this.getCharCodeAt(i | 0);
    wssize = wssize + 8 | 0;
    if ((wssize | 0) >= 13) {
      tmp = workspace >> (wssize - 13 | 0) & 8191;
      c = this.encodeChar(tmp / 91 | 0) & 0xFF;
      if ((c | 0) == 0) {
        // do something, illegal character
        return null;
      }
      results[j | 0] = c & 0xFF;
      j = (j + 1 | 0) >>> 0;
      c = this.encodeChar(tmp % 91 | 0) & 0xFF;
      if ((c | 0) == 0) {
        // do something, illegal character;
        return null;
      }
      results[j | 0] = c & 0xFF;
      j = (j + 1 | 0) >>> 0;
      wssize = wssize - 13 | 0;
    }
  }
  // encode a last byte
  if (0 < (wssize | 0) && (wssize | 0) < 7) {
    tmp = workspace << (6 - wssize | 0) & 63; // pad the right side
    c = this.encodeChar(tmp | 0) & 0xFF;
    if ((c | 0) == 0) {
      // do something, illegal character
      return null;
    }
    results[j | 0] = c & 0xFF;
  } else if (7 <= (wssize | 0)) {
    tmp = workspace << (13 - wssize | 0) & 8191; // pad the right side
    c = this.encodeChar(tmp / 91 | 0);
    if ((c | 0) == 0) {
      // do something, illegal character
      return null;
    }
    results[j | 0] = c & 0xFF;
    j = (j + 1 | 0) >>> 0;
    c = this.encodeChar(tmp % 91 | 0) & 0xFF;
    if ((c | 0) == 0) {
      // do something, illegal character
      return null;
    }
    results[j | 0] = c & 0xFF;
  }
  switch (desired_output.replaceAll("-", "").toUpperCase()) {
    case "UINT8ARRAY":
      return results.slice(0, results.length | 0);
    case "BASE64":
      return UraniumJS.BASE64.fromUint8Array(results.slice(0, results.length | 0));
    default:
      // BASE92
      return UraniumJS.UTF8.fromUint8Array(results.slice(0, results.length | 0));
  }
};
UraniumJS.prototype.decode = function (desired_output) {
  desired_output = "" + desired_output;
  var i = 0,
    j = 0,
    b1 = 0,
    b2 = 0;
  var workspace = 0;
  var wssize = 0;
  // calculate size
  var size = (this.inputLength / 2 * 13 + this.inputLength % 2 * 6) / 8 | 0;
  var res = new Uint8Array(size);

  // handle small cases first
  if ((this.getCharCodeAt(0) - this.TILD_CHAR_CODE | 0) == 0 || (this.inputLength | 0) == 0) {
    switch (desired_output.replaceAll("-", "").toUpperCase()) {
      case "UTF8":
        // BASE92
        return UraniumJS.UTF8.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
      case "BASE64":
        return UraniumJS.BASE64.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
      default:
        return Uint8Array.of(this.TILD_CHAR_CODE);
    }
  }

  // this case does not fit the specs
  if ((this.inputLength | 0) < 2) {
    switch (desired_output.replaceAll("-", "").toUpperCase()) {
      case "UTF8":
        // BASE92
        return UraniumJS.UTF8.fromUint8Array(Uint8Array.of());
      case "BASE64":
        return UraniumJS.BASE64.fromUint8Array(Uint8Array.of());
      default:
        return Uint8Array.of();
    }
  }

  // handle pairs of chars
  workspace = 0;
  wssize = 0;
  j = 0;
  for (i = 0; (i + 1 | 0) < (this.inputLength | 0); i = (i + 2 | 0) >>> 0) {
    b1 = this.getDecodedCharCodeAt(i | 0);
    b2 = this.getDecodedCharCodeAt(i + 1 | 0);
    workspace = workspace << 13 | (b1 * 91 + b2 | 0);
    wssize = wssize + 13 | 0;
    while ((wssize | 0) >= 8) {
      res[j | 0] = workspace >> wssize - 8 & 0xFF;
      j = j + 1 | 0;
      wssize = wssize - 8 | 0;
    }
  }
  // handle single char
  if ((this.inputLength % 2 | 0) == 1) {
    workspace = workspace << 6 | this.getDecodedCharCodeAt(this.inputLength - 1 | 0);
    wssize = wssize + 6 | 0;
    while ((wssize | 0) >= 8) {
      res[j | 0] = workspace >> wssize - 8 & 0xFF;
      j = j + 1 | 0;
      wssize = wssize - 8 | 0;
    }
  }
  switch (desired_output.replaceAll("-", "").toUpperCase()) {
    case "UTF8":
      return UraniumJS.UTF8.fromUint8Array(res.slice(0, res.length | 0));
    case "JS":
      return UraniumJS.BSER.pack(res.slice(0, res.length | 0));
    case "BASE64":
      return UraniumJS.BASE64.fromUint8Array(res.slice(0, res.length | 0));
    default:
      // UINT8ARRAY
      return res.slice(0, res.length | 0);
  }
};
var BASE64 = function BASE64() {
  if (!(this instanceof BASE64)) {
    return new BASE64();
  }
  this.CHUNCK_LENGTH_ = BASE64.config.CHUNCK_LENGTH;
  this.BASE64ABCCC_ = BASE64.config.BASE64ABCCC;
  this.B64C_ = BASE64.config.B64C;
  this.B64EC_ = BASE64.config.B64EC;
  this.B64CL_ = BASE64.config.B64CL;
};
Object.defineProperty(BASE64.prototype, 'CHUNCK_LENGTH', {
  get: function get() {
    return this.CHUNCK_LENGTH_ | 0;
  }
});
Object.defineProperty(BASE64.prototype, 'BASE64ABCCC_E', {
  get: function get() {
    return function (i) {
      return this.BASE64ABCCC_[i | 0] & 0xFF;
    };
  }
});
Object.defineProperty(BASE64.prototype, 'B64C_E', {
  get: function get() {
    return function (i) {
      return this.B64C_[i | 0] & 0xFF;
    };
  }
});
Object.defineProperty(BASE64.prototype, 'B64EC', {
  get: function get() {
    return this.B64EC_ | 0;
  }
});
Object.defineProperty(BASE64.prototype, 'B64CL', {
  get: function get() {
    return this.B64CL_ | 0;
  }
});
BASE64.config = {};
BASE64.config.BASE64ABCCC = Uint8Array.of(65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47);
BASE64.config.CHUNCK_LENGTH = 256;
BASE64.config.B64EC = 255;
BASE64.config.B64C = Uint8Array.of(255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51);
BASE64.config.B64CL = 123;
BASE64.prototype.fromUint8Array = function (bytes) {
  "use strict";

  var i = 2,
    j = 0;
  var l = bytes.length | 0;
  var k = l % 3 | 0;
  var n = Math.floor(l / 3) * 4 + (k && k + 1) | 0;
  var N = Math.ceil(l / 3) * 4 | 0;
  var result = new Uint8Array(N | 0);
  for (i = 2, j = 0; (i | 0) < (l | 0); i = (i + 3 | 0) >>> 0, j = (j + 4 | 0) >>> 0) {
    result.set(Uint8Array.of(this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF, this.BASE64ABCCC_E((bytes[i - 2 | 0] & 0x03) << 4 | bytes[i - 1 | 0] >> 4) & 0xFF, this.BASE64ABCCC_E((bytes[i - 1 | 0] & 0x0F) << 2 | bytes[i] >> 6) & 0xFF, this.BASE64ABCCC_E(bytes[i | 0] & 0x3F) & 0xFF), j | 0);
  }
  if ((i | 0) == (l + 1 | 0)) {
    // 1 octet yet to write
    result[j | 0] = this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF;
    result[j + 1 | 0] = this.BASE64ABCCC_E((bytes[i - 2 | 0] & 0x03) << 4) & 0xFF;
    result[j + 2 | 0] = "=".charCodeAt(0) & 0xFF;
    result[j + 3 | 0] = "=".charCodeAt(0) & 0xFF;
    j = (j + 4 | 0) >>> 0;
  }
  if ((i | 0) == (l | 0)) {
    result[j | 0] = this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF;
    result[j + 1 | 0] = this.BASE64ABCCC_E((bytes[i - 2 | 0] & 0x03) << 4 | bytes[i - 1 | 0] >> 4) & 0xFF;
    result[j + 2 | 0] = this.BASE64ABCCC_E((bytes[i - 1 | 0] & 0x0F) << 2) & 0xFF;
    result[j + 3 | 0] = "=".charCodeAt(0) & 0xFF;
  }
  var s = "";
  var rl = result.length | 0;
  for (i = 0; (i | 0) < (rl | 0); i = (i + this.CHUNCK_LENGTH | 0) >>> 0) {
    s = s.concat(String.fromCharCode.apply(null, result.subarray(i | 0, Math.min(i + this.CHUNCK_LENGTH | 0, rl | 0))));
  }
  return s;
};
BASE64._charCodeAt = function (s) {
  return s.charCodeAt(0) & 0xFF;
};
BASE64.prototype._getBase64CodesBufferResults = function (buffer) {
  return Uint8Array.of(buffer >> 16 & 0xFF, buffer >> 8 & 0xFF, buffer & 0xFF);
};
BASE64.prototype._getBase64CodesBufferResultsBy4 = function (buffer_1, buffer_2, buffer_3, buffer_4) {
  return Uint8Array.of(buffer_1 >> 16 & 0xFF, buffer_1 >> 8 & 0xFF, buffer_1 & 0xFF, buffer_2 >> 16 & 0xFF, buffer_2 >> 8 & 0xFF, buffer_2 & 0xFF, buffer_3 >> 16 & 0xFF, buffer_3 >> 8 & 0xFF, buffer_3 & 0xFF, buffer_4 >> 16 & 0xFF, buffer_4 >> 8 & 0xFF, buffer_4 & 0xFF);
};
BASE64.prototype._getBase64Code = function (char_code) {
  char_code = (char_code | 0) & 0xFF;
  if ((char_code | 0) >>> 0 >= (this.B64CL | 0) >>> 0) {
    throw new Error("Unable to parse base64 string.");
  }
  var code = (this.B64C_E(char_code | 0) | 0) >>> 0;
  if ((code | 0) >>> 0 == (this.B64EC | 0) >>> 0) {
    throw new Error("Unable to parse base64 string.");
  }
  return (code | 0) & 0xFF;
};
BASE64.prototype._getBase64CodesBuffer = function (str_char_codes) {
  return (this._getBase64Code(str_char_codes[0]) << 18 | this._getBase64Code(str_char_codes[1]) << 12 | this._getBase64Code(str_char_codes[2]) << 6 | this._getBase64Code(str_char_codes[3]) | 0) >>> 0;
};
BASE64.prototype.toUint8Array = function (str) {
  if ((str.length % 4 | 0) > 0) {
    throw new Error("Unable to parse base64 string.");
  }
  var index = str.indexOf("=") | 0;
  if ((index | 0) > -1 && (index | 0) < (str.length - 2 | 0)) {
    throw new Error("Unable to parse base64 string.");
  }
  var str_char_code = Uint8ClampedArray.from(str.split("").map(function (s) {
    return BASE64._charCodeAt(s);
  }));
  var missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
    n = str.length | 0,
    result = new Uint8ClampedArray(3 * (n / 4) | 0);
  var str_char_code_splitted = new Uint8ClampedArray(16);
  var i = 0,
    j = 0;
  for (; (i + 16 | 0) < (n | 0); i = (i + 16 | 0) >>> 0, j = (j + 12 | 0) >>> 0) {
    // Single Operation Multiple Data (SIMD) up to 3x faster

    str_char_code_splitted.set(str_char_code.subarray(i | 0, i + 16 | 0));
    result.set(this._getBase64CodesBufferResultsBy4(this._getBase64CodesBuffer(str_char_code_splitted.subarray(0, 4)), this._getBase64CodesBuffer(str_char_code_splitted.subarray(4, 8)), this._getBase64CodesBuffer(str_char_code_splitted.subarray(8, 12)), this._getBase64CodesBuffer(str_char_code_splitted.subarray(12, 16))), j | 0);
  }
  for (; (i | 0) < (n | 0); i = (i + 4 | 0) >>> 0, j = (j + 3 | 0) >>> 0) {
    // Single Operation Single Data (normal)
    result.set(this._getBase64CodesBufferResults(this._getBase64CodesBuffer(str_char_code.subarray(i | 0, i + 4 | 0))), j | 0);
  }
  return result.slice(0, result.length - missingOctets | 0);
};
UraniumJS.BASE64 = new BASE64();

/*
  GNU GENERAL PUBLIC LICENSE
  Version 2, June 1991

 Copyright (C) 1989, 1991 Free Software Foundation, Inc.,
 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.
 */

var RangeCoder //no dependencies
  , Stream //no dependencies
  , BitStream //depands on [Stream]
  , Util //depands on [Stream]
  , LogDistanceModel //depands on [Util(Stream)]
  , Huffman //depands on [Util(Stream),BitStream(Stream)]
  , NoModel //depands on [Util(Stream),BitStream(Stream)]
  , FenwickModel //depands on [RangeCoder, Stream, Util(Stream)]
  , Context1Model //depands on [Util(Stream),BitStream(Stream),Huffman(Util(Stream),BitStream(Stream))]
  , LzjbR //depands on [RangeCoder, Stream, Util(Stream), LogDistanceModel(Util(Stream)), NoModel(Util(Stream),BitStream(Stream)), FenwickModel(RangeCoder, Stream, Util(Stream)), Context1Model(Util(Stream),BitStream(Stream),Huffman(Util(Stream),BitStream(Stream)))
  , Lzp3;
RangeCoder = function () {
  /* Range Coder.  Inspired by rangecod.c from rngcod13.zip from
   *    http://www.compressconsult.com/rangecoder/
   * This JavaScript version is:
   *    Copyright (c) 2013 C. Scott Ananian.
   */
  // Uses 32-bit integer math.  Hopefully the JavaScript runtime figures
  // that out. ;)
  // see https://github.com/kripken/emscripten/wiki/LLVM-Types-in-JavaScript
  // for some hints on doing 32-bit unsigned match in JavaScript.
  // One key is the use of ">>>0" to change a signed result to unsigned.
  var IMUL = Math.imul;
  var CODE_BITS = 32;
  var Top_value = Math.pow(2, CODE_BITS - 1);
  var SHIFT_BITS = CODE_BITS - 9;
  var EXTRA_BITS = (CODE_BITS - 2) % 8 + 1;
  var Bottom_value = Top_value >>> 8;
  var MAX_INT = Math.pow(2, CODE_BITS) - 1;

  /* it is highly recommended that the total frequency count is less  */
  /* than 1 << 19 to minimize rounding effects.                       */
  /* the total frequency count MUST be less than 1<<23                */

  var RangeCoder = function RangeCoder(stream) {
    this.low = 0; /* low end of interval */
    this.range = Top_value; /* length of interval */
    this.buffer = 0; /* buffer for input/output */
    this.help = 0; /* bytes_to_follow / intermediate value */
    this.bytecount = 0; /* counter for output bytes */
    this.stream = stream;
  };

  /* Do the normalization before we need a defined state, instead of
   * after messing it up.  This simplifies starting and ending. */
  var enc_normalize = function enc_normalize(rc, outputStream) {
    while (rc.range <= Bottom_value) {
      /* do we need renormalization? */
      if (rc.low < 0xFF << SHIFT_BITS) {
        //no carry possible, so output
        outputStream.writeByte(rc.buffer);
        for (; rc.help; rc.help--) outputStream.writeByte(0xFF);
        rc.buffer = rc.low >>> SHIFT_BITS & 0xFF;
      } else if (rc.low & Top_value) {
        /* carry now, no future carry */
        outputStream.writeByte(rc.buffer + 1);
        for (; rc.help; rc.help--) outputStream.writeByte(0x00);
        rc.buffer = rc.low >>> SHIFT_BITS & 0xFF;
      } else {
        rc.help++;
        if (rc.help > MAX_INT) throw new Error("Too many bytes outstanding, " + "file too large!");
      }
      rc.range = rc.range << 8 >>> 0; /*ensure result remains positive*/
      rc.low = (rc.low << 8 & Top_value - 1) >>> 0; /* unsigned */
      rc.bytecount++;
    }
  };

  /* Start the encoder                                         */
  /* c is written as the first byte in the datastream.
   * one could do w/o, but then you have an additional if per output byte */
  RangeCoder.prototype.encodeStart = function (c, initlength) {
    this.low = 0;
    this.range = Top_value;
    this.buffer = c;
    this.help = 0;
    this.bytecount = initlength;
  };

  /* Encode a symbol using frequencies                         */
  /* rc is the range coder to be used                          */
  /* sy_f is the interval length (frequency of the symbol)     */
  /* lt_f is the lower end (frequency sum of < symbols)        */
  /* tot_f is the total interval length (total frequency sum)  */
  /* or (faster): tot_f = (code_value)1<<shift                             */
  RangeCoder.prototype.encodeFreq = function (sy_f, lt_f, tot_f) {
    enc_normalize(this, this.stream);
    var r = this.range / tot_f >>> 0; // note coercion to integer
    var tmp = IMUL(r, lt_f);
    this.low += tmp;
    if (lt_f + sy_f < tot_f) {
      this.range = IMUL(r, sy_f);
    } else {
      this.range -= tmp;
    }
  };
  RangeCoder.prototype.encodeShift = function (sy_f, lt_f, shift) {
    enc_normalize(this, this.stream);
    var r = this.range >>> shift;
    var tmp = IMUL(r, lt_f);
    this.low += tmp;
    if (lt_f + sy_f >>> shift) {
      this.range -= tmp;
    } else {
      this.range = IMUL(r, sy_f);
    }
  };
  /* Encode a bit w/o modelling. */
  RangeCoder.prototype.encodeBit = function (b) {
    this.encodeShift(1, b ? 1 : 0, 1);
  };
  /* Encode a byte w/o modelling. */
  RangeCoder.prototype.encodeByte = function (b) {
    this.encodeShift(1, b, 8);
  };
  /* Encode a short w/o modelling. */
  RangeCoder.prototype.encodeShort = function (s) {
    this.encodeShift(1, s, 16);
  };

  /* Finish encoding                                           */
  /* returns number of bytes written                           */
  RangeCoder.prototype.encodeFinish = function () {
    var outputStream = this.stream;
    enc_normalize(this, outputStream);
    this.bytecount += 5;
    var tmp = this.low >>> SHIFT_BITS;
    if ((this.low & Bottom_value - 1) >= (this.bytecount & 0xFFFFFF) >>> 1) {
      tmp++;
    }
    if (tmp > 0xFF) {
      /* we have a carry */
      outputStream.writeByte(this.buffer + 1);
      for (; this.help; this.help--) outputStream.writeByte(0x00);
    } else {
      /* no carry */
      outputStream.writeByte(this.buffer);
      for (; this.help; this.help--) outputStream.writeByte(0xFF);
    }
    outputStream.writeByte(tmp & 0xFF);
    // XXX: i'm pretty sure these could be three arbitrary bytes
    //      they are consumed by the decoder at the end
    outputStream.writeByte(this.bytecount >>> 16 & 0xFF);
    outputStream.writeByte(this.bytecount >>> 8 & 0xFF);
    outputStream.writeByte(this.bytecount & 0xFF);
    return this.bytecount;
  };

  /* Start the decoder; you need to provide the *second* byte from the
   * datastream. (The first byte was provided to startEncoding and is
   * ignored by the decoder.)
   */
  RangeCoder.prototype.decodeStart = function (skipInitialRead) {
    var c = skipInitialRead ? 0 : this.stream.readByte();
    if (typeof c !== 'number' || c < 0) {
      return c; // EOF
    }

    this.buffer = this.stream.readByte();
    this.low = this.buffer >>> 8 - EXTRA_BITS;
    this.range = 1 << EXTRA_BITS;
    return c;
  };
  var dec_normalize = function dec_normalize(rc, inputStream) {
    while (rc.range <= Bottom_value) {
      rc.low = rc.low << 8 | rc.buffer << EXTRA_BITS & 0xFF;
      /* rc.low could be negative here; don't fix it quite yet */
      rc.buffer = inputStream.readByte();
      rc.low |= rc.buffer >>> 8 - EXTRA_BITS;
      rc.low = rc.low >>> 0; /* fix it now */
      rc.range = rc.range << 8 >>> 0; /* ensure stays positive */
    }
  };

  /* Calculate cumulative frequency for next symbol. Does NO update!*/
  /* rc is the range coder to be used                          */
  /* tot_f is the total frequency                              */
  /* or: totf is (code_value)1<<shift                                      */
  /* returns the <= cumulative frequency                         */
  RangeCoder.prototype.decodeCulFreq = function (tot_f) {
    dec_normalize(this, this.stream);
    this.help = this.range / tot_f >>> 0; // note coercion to integer
    var tmp = this.low / this.help >>> 0; // again
    return tmp >= tot_f ? tot_f - 1 : tmp;
  };
  RangeCoder.prototype.decodeCulShift = function (shift) {
    dec_normalize(this, this.stream);
    this.help = this.range >>> shift;
    var tmp = this.low / this.help >>> 0; // coercion to unsigned
    // shift is less than 31, so shift below will remain positive
    return tmp >>> shift ? (1 << shift) - 1 : tmp;
  };

  /* Update decoding state                                     */
  /* rc is the range coder to be used                          */
  /* sy_f is the interval length (frequency of the symbol)     */
  /* lt_f is the lower end (frequency sum of < symbols)        */
  /* tot_f is the total interval length (total frequency sum)  */
  RangeCoder.prototype.decodeUpdate = function (sy_f, lt_f, tot_f) {
    var tmp = this.help * lt_f; // should not overflow!
    this.low -= tmp;
    if (lt_f + sy_f < tot_f) {
      this.range = this.help * sy_f;
    } else {
      this.range -= tmp;
    }
  };

  /* Decode a bit w/o modelling. */
  RangeCoder.prototype.decodeBit = function () {
    var tmp = this.decodeCulShift(1);
    this.decodeUpdate(1, tmp, 1 << 1);
    return tmp;
  };
  /* decode a byte w/o modelling */
  RangeCoder.prototype.decodeByte = function () {
    var tmp = this.decodeCulShift(8);
    this.decodeUpdate(1, tmp, 1 << 8);
    return tmp;
  };
  /* decode a short w/o modelling */
  RangeCoder.prototype.decodeShort = function () {
    var tmp = this.decodeCulShift(16);
    this.decodeUpdate(1, tmp, 1 << 16);
    return tmp;
  };

  /* Finish decoding */
  RangeCoder.prototype.decodeFinish = function () {
    /* normalize to use up all bytes */
    dec_normalize(this, this.stream);
  };

  /** Utility functions */

  // bitstream interface
  RangeCoder.prototype.writeBit = RangeCoder.prototype.encodeBit;
  RangeCoder.prototype.readBit = RangeCoder.prototype.decodeBit;

  // stream interface
  RangeCoder.prototype.writeByte = RangeCoder.prototype.encodeByte;
  RangeCoder.prototype.readByte = RangeCoder.prototype.decodeByte;
  return RangeCoder;
}();
Stream = function () {
  /** Abstract Stream interface, for byte-oriented i/o. */
  var EOF = -1;
  var Stream = function Stream() {
    /* ABSTRACT */
  };
  // you must define one of read / readByte for a readable stream
  Stream.prototype.readByte = function () {
    var buf = [0];
    var len = this.read(buf, 0, 1);
    if (len === 0) {
      this._eof = true;
      return EOF;
    }
    return buf[0];
  };
  Stream.prototype.read = function (buf, bufOffset, length) {
    var ch,
      bytesRead = 0;
    while (bytesRead < length) {
      ch = this.readByte();
      if (ch === EOF) {
        this._eof = true;
        break;
      }
      buf[bufOffset + bytesRead++] = ch;
    }
    return bytesRead;
  };
  Stream.prototype.eof = function () {
    return !!this._eof;
  }; // reasonable default implementation of 'eof'
  Stream.prototype.seek = function (pos) {
    // not all readable streams are seekable
    throw new Error('Stream is not seekable.');
  };
  Stream.prototype.tell = function () {
    throw new Error('Stream is not seekable.');
  };
  Stream.prototype.writeByte = function (_byte) {
    // you must define one of write / writeByte for a writable stream
    var buf = [_byte];
    this.write(buf, 0, 1);
  };
  Stream.prototype.write = function (buf, bufOffset, length) {
    var i;
    for (i = 0; i < length; i = i + 1 | 0) {
      this.writeByte(buf[bufOffset + i]);
    }
    return length;
  };
  Stream.prototype.flush = function () {}; //flush will happily do nothing if you don't override it.
  Stream.EOF = EOF; //export EOF as a constant.

  return Stream;
}();
BitStream = function () {
  /** Big-Endian Bit Stream, implemented on top of a (normal byte) stream. */
  var BitStream = function BitStream(stream) {
    (function () {
      var bufferByte = 0x100; // private var for readers
      this.readBit = function () {
        if ((bufferByte & 0xFF) === 0) {
          var ch = stream.readByte();
          if (ch === Stream.EOF) {
            this._eof = true;
            return ch; /* !!! */
          }

          bufferByte = ch << 1 | 1;
        }
        var bit = bufferByte & 0x100 ? 1 : 0;
        bufferByte <<= 1;
        return bit;
      };
      // implement byte stream interface as well.
      this.readByte = function () {
        if ((bufferByte & 0xFF) === 0) {
          return stream.readByte();
        }
        return this.readBits(8);
      };
      this.seek = function (pos) {
        stream.seek(pos);
        bufferByte = 0x100;
      };
    }).call(this);
    (function () {
      var bufferByte = 1; // private var for writers
      this.writeBit = function (b) {
        bufferByte <<= 1;
        if (b) {
          bufferByte |= 1;
        }
        if (bufferByte & 0x100) {
          stream.writeByte(bufferByte & 0xFF);
          bufferByte = 1;
        }
      };
      // implement byte stream interface as well
      this.writeByte = function (_byte) {
        if (bufferByte === 1) {
          stream.writeByte(_byte);
        } else {
          stream.writeBits(8, _byte);
        }
      };
      this.flush = function () {
        while (bufferByte !== 1) {
          this.writeBit(0);
        }
        if (stream.flush) {
          stream.flush();
        }
      };
    }).call(this);
  };
  // inherit read/write methods from Stream.
  BitStream.EOF = Stream.EOF;
  BitStream.prototype = Object.create(Stream.prototype);
  // bit chunk read/write
  BitStream.prototype.readBits = function (n) {
    var i,
      r = 0,
      b;
    if (n > 31) {
      r = this.readBits(n - 16) * 0x10000; // fp multiply, not shift
      return r + this.readBits(16);
    }
    for (i = 0; i < n; i = i + 1 | 0) {
      r <<= 1; // this could make a negative value if n>31
      // bits read past EOF are all zeros!
      if (this.readBit() > 0) {
        r++;
      }
    }
    return r;
  };
  BitStream.prototype.writeBits = function (n, value) {
    if (n > 32) {
      var low = value & 0xFFFF;
      var high = (value - low) / 0x10000; // fp division, not shift
      this.writeBits(n - 16, high);
      this.writeBits(16, low);
      return;
    }
    var i;
    for (i = n - 1; i >= 0; i = i - 1 | 0) {
      this.writeBit(value >>> i & 1);
    }
  };
  return BitStream;
}();
Util = function () {
  var Util = Object.create(null);
  var EOF = Stream.EOF;

  /* Take a buffer, array, or stream, and return an input stream. */
  Util.coerceInputStream = function (input, forceRead) {
    if (!('readByte' in input)) {
      var buffer = input;
      input = new Stream();
      input.size = buffer.length;
      input.pos = 0;
      input.readByte = function () {
        if (this.pos >= this.size) {
          return EOF;
        }
        return buffer[this.pos++];
      };
      input.read = function (buf, bufOffset, length) {
        var bytesRead = 0;
        while (bytesRead < length && this.pos < buffer.length) {
          buf[bufOffset++] = buffer[this.pos++];
          bytesRead++;
        }
        return bytesRead;
      };
      input.seek = function (pos) {
        this.pos = pos;
      };
      input.tell = function () {
        return this.pos;
      };
      input.eof = function () {
        return this.pos >= buffer.length;
      };
    } else if (forceRead && !('read' in input)) {
      // wrap input if it doesn't implement read
      var s = input;
      input = new Stream();
      input.readByte = function () {
        var ch = s.readByte();
        if (ch === EOF) {
          this._eof = true;
        }
        return ch;
      };
      if ('size' in s) {
        input.size = s.size;
      }
      if ('seek' in s) {
        input.seek = function (pos) {
          s.seek(pos); // may throw if s doesn't implement seek
          this._eof = false;
        };
      }
      if ('tell' in s) {
        input.tell = s.tell.bind(s);
      }
    }
    return input;
  };
  var BufferStream = function BufferStream(buffer, resizeOk) {
    this.buffer = buffer;
    this.resizeOk = resizeOk;
    this.pos = 0;
  };
  BufferStream.prototype = Object.create(Stream.prototype);
  BufferStream.prototype.writeByte = function (_byte) {
    if (this.resizeOk && this.pos >= this.buffer.length) {
      var newBuffer = Util.makeU8Buffer(this.buffer.length * 2);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
    }
    this.buffer[this.pos++] = _byte;
  };
  BufferStream.prototype.getBuffer = function () {
    // trim buffer if needed
    if (this.pos !== this.buffer.length) {
      if (!this.resizeOk) throw new TypeError('outputsize does not match decoded input');
      var newBuffer = Util.makeU8Buffer(this.pos);
      newBuffer.set(this.buffer.subarray(0, this.pos));
      this.buffer = newBuffer;
    }
    return this.buffer;
  };

  /* Take a stream (or not) and an (optional) size, and return an
   * output stream.  Return an object with a 'retval' field equal to
   * the output stream (if that was given) or else a pointer at the
   * internal Uint8Array/buffer/array; and a 'stream' field equal to
   * an output stream to use.
   */
  Util.coerceOutputStream = function (output, size) {
    var r = {
      stream: output,
      retval: output
    };
    if (output) {
      if (typeof output === 'object' && 'writeByte' in output) {
        return r; /* leave output alone */
      } else if (typeof size === 'number') {
        r.stream = new BufferStream(Util.makeU8Buffer(size), false);
      } else {
        // output is a buffer
        r.stream = new BufferStream(output, false);
      }
    } else {
      r.stream = new BufferStream(Util.makeU8Buffer(16384), true);
    }
    Object.defineProperty(r, 'retval', {
      get: r.stream.getBuffer.bind(r.stream)
    });
    return r;
  };
  Util.compressFileHelper = function (magic, guts, suppressFinalByte) {
    return function (inStream, outStream, props) {
      inStream = Util.coerceInputStream(inStream);
      var o = Util.coerceOutputStream(outStream, outStream);
      outStream = o.stream;

      // write the magic number to identify this file type
      // (it better be ASCII, we're not doing utf-8 conversion)
      var i;
      for (i = 0; i < magic.length; i = i + 1 | 0) {
        outStream.writeByte(magic.charCodeAt(i));
      }

      // if we know the size, write it
      var fileSize;
      if ('size' in inStream && inStream.size >= 0) {
        fileSize = inStream.size;
      } else {
        fileSize = -1; // size unknown
      }

      if (suppressFinalByte) {
        var tmpOutput = Util.coerceOutputStream([]);
        Util.writeUnsignedNumber(tmpOutput.stream, fileSize + 1);
        tmpOutput = tmpOutput.retval;
        for (i = 0; i < tmpOutput.length - 1; i = i + 1 | 0) {
          outStream.writeByte(tmpOutput[i]);
        }
        suppressFinalByte = tmpOutput[tmpOutput.length - 1];
      } else {
        Util.writeUnsignedNumber(outStream, fileSize + 1);
      }

      // call the guts to do the real compression
      guts(inStream, outStream, fileSize, props, suppressFinalByte);
      return o.retval;
    };
  };
  Util.decompressFileHelper = function (magic, guts) {
    return function (inStream, outStream) {
      inStream = Util.coerceInputStream(inStream);

      // read the magic number to confirm this file type
      // (it better be ASCII, we're not doing utf-8 conversion)
      var i;
      for (i = 0; i < magic.length; i = i + 1 | 0) {
        if (magic.charCodeAt(i) !== inStream.readByte()) {
          throw new Error("Bad magic");
        }
      }

      // read the file size & create an appropriate output stream/buffer
      var fileSize = Util.readUnsignedNumber(inStream) - 1;
      var o = Util.coerceOutputStream(outStream, fileSize);
      outStream = o.stream;

      // call the guts to do the real decompression
      guts(inStream, outStream, fileSize);
      return o.retval;
    };
  };
  // a helper for simple self-test of model encode
  Util.compressWithModel = function (inStream, fileSize, model) {
    var inSize = 0;
    while (inSize !== fileSize) {
      var ch = inStream.readByte();
      if (ch === EOF) {
        model.encode(256); // end of stream;
        break;
      }
      model.encode(ch);
      inSize++;
    }
  };
  // a helper for simple self-test of model decode
  Util.decompressWithModel = function (outStream, fileSize, model) {
    var outSize = 0;
    while (outSize !== fileSize) {
      var ch = model.decode();
      if (ch === 256) {
        break; // end of stream;
      }

      outStream.writeByte(ch);
      outSize++;
    }
  };

  /** Write a number using a self-delimiting big-endian encoding. */
  Util.writeUnsignedNumber = function (output, n) {
    var bytes = [],
      i;
    do {
      bytes.push(n & 0x7F);
      // use division instead of shift to allow encoding numbers up to
      // 2^53
      n = Math.floor(n / 128);
    } while (n !== 0);
    bytes[0] |= 0x80; // mark end of encoding.
    for (i = bytes.length - 1; i >= 0; i = i - 1 | 0) {
      output.writeByte(bytes[i]); // write in big-endian order
    }

    return output;
  };

  /** Read a number using a self-delimiting big-endian encoding. */
  Util.readUnsignedNumber = function (input) {
    var n = 0,
      c;
    while (true) {
      c = input.readByte();
      if (c & 0x80) {
        n += c & 0x7F;
        break;
      }
      // using + and * instead of << allows decoding numbers up to 2^53
      n = (n + c) * 128;
    }
    return n;
  };

  // Compatibility thunks for Buffer/TypedArray constructors.

  var zerofill = function zerofill(a) {
    for (var i = 0, len = a.length; i < len; i = i + 1 | 0) {
      a[i] = 0;
    }
    return a;
  };
  var fallbackarray = function fallbackarray(size) {
    return zerofill(new Array(size));
  };

  // Node 0.11.6 - 0.11.10ish don't properly zero fill typed arrays.
  // See https://github.com/joyent/node/issues/6664
  // Try to detect and workaround the bug.
  var ensureZeroed = function id(a) {
    return a;
  };
  if (typeof process !== 'undefined' && Array.prototype.some.call(new Uint32Array(128), function (x) {
    return x !== 0;
  })) {
    //console.warn('Working around broken TypedArray');
    ensureZeroed = zerofill;
  }

  /** Portable 8-bit unsigned buffer. */
  Util.makeU8Buffer = typeof Uint8Array !== 'undefined' ? function (size) {
    // Uint8Array ought to be  automatically zero-filled
    return ensureZeroed(new Uint8Array(size));
  } : fallbackarray;

  /** Portable 16-bit unsigned buffer. */
  Util.makeU16Buffer = typeof Uint16Array !== 'undefined' ? function (size) {
    // Uint16Array ought to be  automatically zero-filled
    return ensureZeroed(new Uint16Array(size));
  } : fallbackarray;

  /** Portable 32-bit unsigned buffer. */
  Util.makeU32Buffer = typeof Uint32Array !== 'undefined' ? function (size) {
    // Uint32Array ought to be  automatically zero-filled
    return ensureZeroed(new Uint32Array(size));
  } : fallbackarray;

  /** Portable 32-bit signed buffer. */
  Util.makeS32Buffer = typeof Int32Array !== 'undefined' ? function (size) {
    // Int32Array ought to be  automatically zero-filled
    return ensureZeroed(new Int32Array(size));
  } : fallbackarray;
  Util.arraycopy = function (dst, src) {
    for (var i = 0, len = src.length; i < len; i = i + 1 | 0) {
      dst[i] = src[i];
    }
    return dst;
  };

  /** Highest bit set in a byte. */
  var bytemsb = Uint8Array.of(0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8 /* 256 */);

  /** Find last set (most significant bit).
   *  @return the last bit set in the argument.
   *          <code>fls(0)==0</code> and <code>fls(1)==1</code>. */
  var fls = Util.fls = function (v) {
    if (v > 0xFFFFFFFF) {
      // use floating-point mojo
      return 32 + fls(Math.floor(v / 0x100000000));
    }
    if ((v & 0xFFFF0000) !== 0) {
      if ((v & 0xFF000000) !== 0) {
        return 24 + bytemsb[v >>> 24 & 0xFF];
      } else {
        return 16 + bytemsb[v >>> 16];
      }
    } else if ((v & 0x0000FF00) !== 0) {
      return 8 + bytemsb[v >>> 8];
    } else {
      return bytemsb[v];
    }
  };
  /** Returns ceil(log2(n)) */
  Util.log2c = function (v) {
    return v === 0 ? -1 : fls(v - 1);
  };
  return Util; // ensure constants are recognized as such.
}();

LogDistanceModel = function () {
  /** Simple (log n)(n) distance model. */

  // lengthBitsModelFactory will be called with arguments 2, 4, 8, 16, etc
  // and must return an appropriate model or coder.
  var LogDistanceModel = function LogDistanceModel(size, extraStates, lgDistanceModelFactory, lengthBitsModelFactory) {
    var i;
    var bits = Util.fls(size - 1);
    this.extraStates = +extraStates || 0;
    this.lgDistanceModel = lgDistanceModelFactory(1 + bits + extraStates);
    // this.distanceModel[n] used for distances which are n-bits long,
    // but only n-1 bits are encoded: the top bit is known to be one.
    this.distanceModel = [];
    for (i = 2; i <= bits; i = i + 1 | 0) {
      var numBits = i - 1;
      this.distanceModel[i] = lengthBitsModelFactory(1 << numBits);
    }
  };
  /* you can give this model arguments between 0 and (size-1), or else
     a negative argument which is one of the 'extra states'. */
  LogDistanceModel.prototype.encode = function (distance) {
    if (distance < 2) {
      // small distance or an 'extra state'
      this.lgDistanceModel.encode(distance + this.extraStates);
      return;
    }
    var lgDistance = Util.fls(distance);
    this.lgDistanceModel.encode(lgDistance + this.extraStates);
    // now encode the rest of the bits.
    var rest = distance & (1 << lgDistance - 1) - 1;
    this.distanceModel[lgDistance].encode(rest);
  };
  LogDistanceModel.prototype.decode = function () {
    var lgDistance = this.lgDistanceModel.decode() - this.extraStates;
    if (lgDistance < 2) {
      return lgDistance; // this is a small distance or an 'extra state'
    }

    var rest = this.distanceModel[lgDistance].decode();
    return (1 << lgDistance - 1) + rest;
  };
  return LogDistanceModel;
}();
Huffman = function () {
  /* Adaptive Huffman code, using Vitter's algorithm ported from
   * vitter.c at http://code.google.com/p/compression-code/downloads/list
   * The original code was placed in the public domain, and so I
   * also place this JavaScript port in the public domain.
   *   -- C. Scott Ananian <cscott@cscott.net>, 2013
   * ps. some truly grotty C code in the originally, faithfully ported to
   *     evil comma-operator-using, assignment-in-if-condition JavaScript.
   */

  //  This code is adapted from Professor Vitter's
  //  article, Design and Analysis of Dynamic Huffman Codes,
  //  which appeared in JACM October 1987

  //  A design trade-off has been made to simplify the
  //  code:  a node's block is determined dynamically,
  //  and the implicit tree structure is maintained,
  //  e.g. explicit node numbers are also implicit.

  //  Dynamic Huffman table weight ranking
  //  is maintained per Professor Vitter's
  //  invariant (*) for algorithm FGK:

  //  leaves precede internal nodes of the
  //  same weight in a non-decreasing ranking
  //  of weights using implicit node numbers:

  //  1) leaves slide over internal nodes, internal nodes
  //  swap over groups of leaves, leaves are swapped
  //  into group leader position, but two internal
  //  nodes never change positions relative
  //  to one another.

  //  2) weights are incremented by 2:
  //  leaves always have even weight values;
  //  internal nodes always have odd values.

  //  3) even node numbers are always right children;
  //  odd numbers are left children in the tree.

  //  node 2 * HuffSize - 1 is always the tree root;
  //  node HuffEsc is the escape node;

  //  the tree is initialized by creating an
  //  escape node as the root.

  //  each new leaf symbol is paired with a new escape
  //  node into the previous escape node in the tree,
  //  until the last symbol which takes over the
  //  tree position of the escape node, and
  //  HuffEsc is left at zero.

  //  overall table size: 2 * HuffSize

  //  huff_init(alphabet_size, potential symbols used)
  //  huff_encode(next_symbol)
  //  next_symbol = huff_decode()

  //  huff_scale(by_bits) -- scale weights and re-balance tree

  var HTable = function HTable(up, down, symbol, weight) {
    this.up = up; // next node up the tree
    this.down = down; // pair of down nodes
    this.symbol = symbol; // node symbol value
    this.weight = weight; // node weight
  };

  HTable.prototype.clone = function () {
    return new HTable(this.up, this.down, this.symbol, this.weight);
  };
  HTable.prototype.set = function (htable) {
    this.up = htable.up;
    this.down = htable.down;
    this.symbol = htable.symbol;
    this.weight = htable.weight;
  };

  //  initialize an adaptive coder
  //  for alphabet size, and count
  //  of nodes to be used
  var Huffman = function Huffman(size, root, bitstream, max_weight) {
    var i;
    //  default: all alphabet symbols are used

    if (!root || root > size) root = size;

    //  create the initial escape node
    //  at the tree root

    if (root <<= 1) {
      root--;
    }

    // create root+1 htables (coding table)
    // XXX this could be views on a backing Uint32 array?
    this.table = [];
    for (i = 0; i <= root; i = i + 1 | 0) {
      this.table[i] = new HTable(0, 0, 0, 0);
    }

    // this.map => mapping for symbols to nodes
    this.map = [];
    // this.size => the alphabet size
    if (this.size = size) {
      for (i = 0; i < size; i = i + 1 | 0) {
        this.map[i] = 0;
      }
    }

    // this.esc  => the current tree height
    // this.root => the root of the tree
    this.esc = this.root = root;
    if (bitstream) {
      this.readBit = bitstream.readBit.bind(bitstream);
      this.writeBit = bitstream.writeBit.bind(bitstream);
    }
    this.max_weight = max_weight; // may be null or undefined
  };
  // factory interface
  Huffman.factory = function (bitstream, max_weight) {
    return function (size) {
      return new Huffman(size, size, bitstream, max_weight);
    };
  };

  // split escape node to incorporate new symbol

  Huffman.prototype.split = function (symbol) {
    var pair, node;

    //  is the tree already full???

    if (pair = this.esc) {
      this.esc--;
    } else {
      return 0;
    }

    //  if this is the last symbol, it moves into
    //  the escape node's old position, and
    //  this.esc is set to zero.

    //  otherwise, the escape node is promoted to
    //  parent a new escape node and the new symbol.

    if (node = this.esc) {
      this.table[pair].down = node;
      this.table[pair].weight = 1;
      this.table[node].up = pair;
      this.esc--;
    } else {
      pair = 0;
      node = 1;
    }

    //  initialize the new symbol node

    this.table[node].symbol = symbol;
    this.table[node].weight = 0;
    this.table[node].down = 0;
    this.map[symbol] = node;

    //  initialize a new escape node.

    this.table[this.esc].weight = 0;
    this.table[this.esc].down = 0;
    this.table[this.esc].up = pair;
    return node;
  };

  //  swap leaf to group leader position
  //  return symbol's new node

  Huffman.prototype.leader = function (node) {
    var weight = this.table[node].weight;
    var leader = node,
      prev,
      symbol;
    while (weight === this.table[leader + 1].weight) {
      leader++;
    }
    if (leader === node) {
      return node;
    }

    // swap the leaf nodes

    symbol = this.table[node].symbol;
    prev = this.table[leader].symbol;
    this.table[leader].symbol = symbol;
    this.table[node].symbol = prev;
    this.map[symbol] = leader;
    this.map[prev] = node;
    return leader;
  };

  //  slide internal node up over all leaves of equal weight;
  //  or exchange leaf with next smaller weight internal node

  //  return node's new position

  Huffman.prototype.slide = function (node) {
    var next = node;
    var swap;
    swap = this.table[next++].clone();

    // if we're sliding an internal node, find the
    // highest possible leaf to exchange with

    if (swap.weight & 1) {
      while (swap.weight > this.table[next + 1].weight) {
        next++;
      }
    }

    //  swap the two nodes

    this.table[node].set(this.table[next]);
    this.table[next].set(swap);
    this.table[next].up = this.table[node].up;
    this.table[node].up = swap.up;

    //  repair the symbol map and tree structure

    if (swap.weight & 1) {
      this.table[swap.down].up = next;
      this.table[swap.down - 1].up = next;
      this.map[this.table[node].symbol] = node;
    } else {
      this.table[this.table[node].down - 1].up = node;
      this.table[this.table[node].down].up = node;
      this.map[swap.symbol] = next;
    }
    return next;
  };

  //  increment symbol weight and re balance the tree.

  Huffman.prototype.increment = function (node) {
    var up;

    //  obviate swapping a parent with its child:
    //    increment the leaf and proceed
    //    directly to its parent.

    //  otherwise, promote leaf to group leader position in the tree

    if (this.table[node].up === node + 1) {
      this.table[node].weight += 2;
      node++;
    } else {
      node = this.leader(node);
    }

    //  increase the weight of each node and slide
    //  over any smaller weights ahead of it
    //  until reaching the root

    //  internal nodes work upwards from
    //  their initial positions; while
    //  symbol nodes slide over first,
    //  then work up from their final
    //  positions.

    while (this.table[node].weight += 2, up = this.table[node].up) {
      while (this.table[node].weight > this.table[node + 1].weight) {
        node = this.slide(node);
      }
      if (this.table[node].weight & 1) {
        node = up;
      } else {
        node = this.table[node].up;
      }
    }

    /* Re-scale if necessary. */
    if (this.max_weight) {
      if (this.table[this.root].weight >= this.max_weight) {
        this.scale(1);
      }
    }
  };

  //  scale all weights and re-balance the tree

  //  zero weight nodes are removed from the tree
  //  by sliding them out the left of the rank list

  Huffman.prototype.scale = function (bits) {
    var node = this.esc,
      weight,
      prev;

    //  work up the tree from the escape node
    //  scaling weights by the value of bits

    while (++node <= this.root) {
      //  recompute the weight of internal nodes;
      //  slide down and out any unused ones

      if (this.table[node].weight & 1) {
        if (weight = this.table[this.table[node].down].weight & ~1) {
          weight += this.table[this.table[node].down - 1].weight | 1;
        }

        //  remove zero weight leaves by incrementing HuffEsc
        //  and removing them from the symbol map.  take care
      } else if (!(weight = this.table[node].weight >> bits & ~1)) {
        if (this.map[this.table[node].symbol] = 0, this.esc++) {
          this.esc++;
        }
      }

      // slide the scaled node back down over any
      // previous nodes with larger weights

      this.table[node].weight = weight;
      prev = node;
      while (weight < this.table[--prev].weight) {
        this.slide(prev);
      }
    }

    // prepare a new escape node

    this.table[this.esc].down = 0;
  };

  //  send the bits for an escaped symbol

  Huffman.prototype.sendid = function (symbol) {
    var empty = 0,
      max;

    //  count the number of empty symbols
    //  before the symbol in the table

    while (symbol--) {
      if (!this.map[symbol]) {
        empty++;
      }
    }

    //  send LSB of this count first, using
    //  as many bits as are required for
    //  the maximum possible count

    if (max = this.size - Math.floor((this.root - this.esc) / 2) - 1) {
      do {
        this.writeBit(empty & 1);
        empty >>= 1;
      } while (max >>= 1);
    }
  };

  //  encode the next symbol

  Huffman.prototype.encode = function (symbol) {
    var emit = 1,
      bit;
    var up, idx, node;
    if (symbol < this.size) {
      node = this.map[symbol];
    } else {
      return;
    }

    //  for a new symbol, direct the receiver to the escape node
    //  but refuse input if table is already full.

    if (!(idx = node)) {
      if (!(idx = this.esc)) {
        return;
      }
    }

    //  accumulate the code bits by
    //  working up the tree from
    //  the node to the root

    while (up = this.table[idx].up) {
      emit <<= 1;
      emit |= idx & 1;
      idx = up;
    }

    //  send the code, root selector bit first

    while (bit = emit & 1, emit >>= 1) {
      this.writeBit(bit);
    }

    //  send identification and incorporate
    //  new symbols into the tree

    if (!node) {
      this.sendid(symbol);
      node = this.split(symbol);
    }

    //  adjust and re-balance the tree

    this.increment(node);
  };

  //  read the identification bits
  //  for an escaped symbol

  Huffman.prototype.readid = function () {
    var empty = 0,
      bit = 1,
      max,
      symbol;

    //  receive the symbol, LSB first, reading
    //  only the number of bits necessary to
    //  transmit the maximum possible symbol value

    if (max = this.size - Math.floor((this.root - this.esc) / 2) - 1) {
      do {
        empty |= this.readBit() ? bit : 0;
        bit <<= 1;
      } while (max >>= 1);
    }

    //  the count is of unmapped symbols
    //  in the table before the new one

    for (symbol = 0; symbol < this.size; symbol++) {
      if (!this.map[symbol]) {
        if (!empty--) {
          return symbol;
        }
      }
    }

    //  oops!  our count is too big, either due
    //  to a bit error, or a short node count
    //  given to huff_init.
    return 0;
  };

  //  decode the next symbol

  Huffman.prototype.decode = function () {
    var node = this.root;
    var symbol, down;

    //  work down the tree from the root
    //  until reaching either a leaf
    //  or the escape node.  A one
    //  bit means go left, a zero
    //  means go right.

    while (down = this.table[node].down) {
      if (this.readBit()) {
        node = down - 1; // the left child precedes the right child
      } else {
        node = down;
      }
    }

    //  sent to the escape node???
    //  refuse to add to a full tree

    if (node === this.esc) {
      if (this.esc) {
        symbol = this.readid();
        node = this.split(symbol);
      } else {
        return 0;
      }
    } else {
      symbol = this.table[node].symbol;
    }

    //  increment weights and re-balance
    //  the coding tree

    this.increment(node);
    return symbol;
  };

  // stand alone compressor, mostly for testing
  Huffman.MAGIC = 'huff';
  Huffman.compressFile = Util.compressFileHelper(Huffman.MAGIC, function (input, output, size, props) {
    var bitstream = new BitStream(output);
    var alphabetSize = 256;
    if (size < 0) {
      alphabetSize++;
    }
    var huff = new Huffman(257, alphabetSize, bitstream, 8191);
    Util.compressWithModel(input, size, huff);
    bitstream.flush();
  });

  // stand alone decompresser, again for testing
  Huffman.decompressFile = Util.decompressFileHelper(Huffman.MAGIC, function (input, output, size) {
    var bitstream = new BitStream(input);
    var alphabetSize = 256;
    if (size < 0) {
      alphabetSize++;
    }
    var huff = new Huffman(257, alphabetSize, bitstream, 8191);
    Util.decompressWithModel(output, size, huff);
  });
  return Huffman;
}();
NoModel = function () {
  /** Simple "lack of model" -- just encode the bits directly.
   *  Useful especially with sparse spaces or Huffman coders where there's
   *  no obvious prediction to be made that will pay for itself.
   */

  var NoModel = function NoModel(bitstream, size) {
    this.bitstream = bitstream;
    this.bits = Util.fls(size - 1);
  };
  NoModel.factory = function (bitstream) {
    return function (size) {
      return new NoModel(bitstream, size);
    };
  };
  NoModel.prototype.encode = function (symbol) {
    var i;
    for (i = this.bits - 1; i >= 0; i = i - 1 | 0) {
      var b = symbol >>> i & 1;
      this.bitstream.writeBit(b);
    }
  };
  NoModel.prototype.decode = function () {
    var i,
      r = 0;
    for (i = this.bits - 1; i >= 0; i = i - 1 | 0) {
      r <<= 1;
      if (this.bitstream.readBit()) r++;
    }
    return r;
  };

  /** Brain-dead self-test. */
  NoModel.MAGIC = 'nomo';
  NoModel.compressFile = Util.compressFileHelper(NoModel.MAGIC, function (inStream, outStream, fileSize, props) {
    var bitstream = new BitStream(outStream);
    var model = new NoModel(bitstream, fileSize < 0 ? 257 : 256);
    Util.compressWithModel(inStream, fileSize, model);
    bitstream.flush();
  });
  NoModel.decompressFile = Util.decompressFileHelper(NoModel.MAGIC, function (inStream, outStream, fileSize) {
    var bitstream = new BitStream(inStream);
    var model = new NoModel(bitstream, fileSize < 0 ? 257 : 256);
    Util.decompressWithModel(outStream, fileSize, model);
  });
  return NoModel;
}();
FenwickModel = function () {
  /** Range coding model based on Fenwick trees for O(ln N) query/update. */

  /** We store two probabilities in a U32, so max prob is going to be 0xFFFF */
  var DEFAULT_MAX_PROB = 0xFF00;
  var DEFAULT_INCREMENT = 0x0100;
  var ESC_MASK = 0x0000FFFF,
    ESC_SHIFT = 0;
  var SYM_MASK = 0xFFFF0000,
    SYM_SHIFT = 16;
  var SCALE_MASK = 0xFFFEFFFE;
  var FenwickModel = function FenwickModel(coder, size, max_prob, increment) {
    this.coder = coder;
    this.numSyms = size + 1; // save space for an escape symbol
    this.tree = Util.makeU32Buffer(this.numSyms * 2);
    this.increment = +increment || DEFAULT_INCREMENT;
    this.max_prob = +max_prob || DEFAULT_MAX_PROB;
    // sanity-check to prevent overflow.
    // record escape probability as 1.
    var i;
    for (i = 0; i < size; i = i + 1 | 0) {
      this.tree[this.numSyms + i] =
      // escape prob=1, sym prob = 0
      1 << ESC_SHIFT | 0 << SYM_SHIFT;
    }
    this.tree[this.numSyms + i] =
    // escape prob = 0, sym prob = 1
    0 << ESC_SHIFT | this.increment << SYM_SHIFT;
    this._sumTree();
    // probability sums are in this.tree[1].  this.tree[0] is unused.
  };

  FenwickModel.factory = function (coder, max_prob, increment) {
    return function (size) {
      return new FenwickModel(coder, size, max_prob, increment);
    };
  };
  FenwickModel.prototype.clone = function () {
    var newModel = new FenwickModel(this.coder, this.size, this.max_prob, this.increment);
    var i;
    for (i = 1; i < this.tree.length; i = i + 1 | 0) {
      newModel.tree[i] = this.tree[i] | 0;
    }
    return newModel;
  };
  FenwickModel.prototype.encode = function (symbol) {
    var i = this.numSyms + symbol;
    var sy_f = this.tree[i];
    var mask = SYM_MASK,
      shift = SYM_SHIFT;
    var update = this.increment << SYM_SHIFT;
    if ((sy_f & SYM_MASK) === 0) {
      // escape!
      this.encode(this.numSyms - 1);
      mask = ESC_MASK;
      update -= 1 << ESC_SHIFT; // not going to escape no mo'
      shift = ESC_SHIFT;
    } else if (symbol === this.numSyms - 1 && (this.tree[1] & ESC_MASK) >>> ESC_SHIFT === 1) {
      // this is the last escape, zero it out
      update = -this.tree[i];
    }
    // sum up the proper lt_f
    var lt_f = 0;
    while (i > 1) {
      var isRight = i & 1;
      var parent = i >>> 1;
      // if we're the right child, we need to
      // add the prob from the left child
      if (isRight) {
        lt_f += this.tree[2 * parent];
      }
      // update sums
      this.tree[i] += update; // increase sym / decrease esc
      i = parent;
    }
    var tot_f = this.tree[1];
    this.tree[1] += update; // update prob in root
    sy_f = (sy_f & mask) >>> shift;
    lt_f = (lt_f & mask) >>> shift;
    tot_f = (tot_f & mask) >>> shift;
    this.coder.encodeFreq(sy_f, lt_f, tot_f);
    // rescale?
    if ((this.tree[1] & SYM_MASK) >>> SYM_SHIFT >= this.max_prob) {
      this._rescale();
    }
  };
  FenwickModel.prototype._decode = function (isEscape) {
    var mask = SYM_MASK,
      shift = SYM_SHIFT;
    var update = this.increment << SYM_SHIFT;
    if (isEscape) {
      mask = ESC_MASK;
      update -= 1 << ESC_SHIFT;
      shift = ESC_SHIFT;
    }
    var tot_f = (this.tree[1] & mask) >>> shift;
    var prob = this.coder.decodeCulFreq(tot_f);
    // travel down the tree looking for this
    var i = 1,
      lt_f = 0;
    while (i < this.numSyms) {
      this.tree[i] += update;
      // look at probability in left child.
      var leftProb = (this.tree[i << 1] & mask) >>> shift;
      i *= 2;
      if (prob - lt_f >= leftProb) {
        lt_f += leftProb;
        i = i + 1 | 0; // take the right child.
      }
    }

    var symbol = i - this.numSyms;
    var sy_f = (this.tree[i] & mask) >>> shift;
    this.tree[i] += update;
    this.coder.decodeUpdate(sy_f, lt_f, tot_f);
    // was this the last escape?
    if (symbol === this.numSyms - 1 && (this.tree[1] & ESC_MASK) >>> ESC_SHIFT === 1) {
      update = -this.tree[i]; // zero it out
      while (i >= 1) {
        this.tree[i] += update;
        i = i >>> 1; // parent
      }
    }
    // rescale?
    if ((this.tree[1] & SYM_MASK) >>> SYM_SHIFT >= this.max_prob) {
      this._rescale();
    }
    return symbol;
  };
  FenwickModel.prototype.decode = function () {
    var symbol = this._decode(false); // not escape
    if (symbol === this.numSyms - 1) {
      // this was an escape!
      symbol = this._decode(true); // an escape!
    }

    return symbol;
  };
  FenwickModel.prototype._rescale = function () {
    var i,
      prob,
      noEscape = true;
    // scale symbols (possible causing them to escape)
    for (i = 0; i < this.numSyms - 1; i = i + 1 | 0) {
      prob = this.tree[this.numSyms + i];
      if ((prob & ESC_MASK) !== 0) {
        // this symbol escapes
        noEscape = false;
        continue;
      }
      prob = (prob & SCALE_MASK) >>> 1;
      if (prob === 0) {
        // this symbol newly escapes
        prob = 1 << ESC_SHIFT;
        noEscape = false;
      }
      this.tree[this.numSyms + i] = prob;
    }
    // scale the escape symbol
    prob = this.tree[this.numSyms + i];
    prob = (prob & SCALE_MASK) >>> 1;
    // prob should be zero if there are no escaping symbols, otherwise
    // it must be at least 1.
    if (noEscape) {
      prob = 0;
    } else if (prob === 0) {
      prob = 1 << SYM_SHIFT;
    }
    this.tree[this.numSyms + i] = prob;
    // sum it all up afresh
    this._sumTree();
  };
  FenwickModel.prototype._sumTree = function () {
    var i;
    // sum it all. (we know we won't overflow)
    for (i = this.numSyms - 1; i > 0; i = i - 1 | 0) {
      this.tree[i] = this.tree[i << 1] + this.tree[(i << 1) + 1];
    }
  };
  FenwickModel.MAGIC = 'fenw';
  /** Simple order-0 compressor, as self-test. */
  FenwickModel.compressFile = Util.compressFileHelper(FenwickModel.MAGIC, function (inStream, outStream, fileSize, props, finalByte) {
    var range = new RangeCoder(outStream);
    range.encodeStart(finalByte, 1);
    var model = new FenwickModel(range, fileSize < 0 ? 257 : 256);
    Util.compressWithModel(inStream, fileSize, model);
    range.encodeFinish();
  }, true);

  /** Simple order-0 decompresser, as self-test. */
  FenwickModel.decompressFile = Util.decompressFileHelper(FenwickModel.MAGIC, function (inStream, outStream, fileSize) {
    var range = new RangeCoder(inStream);
    range.decodeStart(true /*already read the final byte*/);
    var model = new FenwickModel(range, fileSize < 0 ? 257 : 256);
    Util.decompressWithModel(outStream, fileSize, model);
    range.decodeFinish();
  });
  return FenwickModel;
}();
Context1Model = function () {
  /** A simple context-1 model. */

  var Context1Model = function Context1Model(modelFactory, contextSize, alphabetSize) {
    var i;
    this.literalModel = [];
    // even if there's an EOF symbol, we don't need a context for it!
    for (i = 0; i < contextSize; i = i + 1 | 0) {
      this.literalModel[i] = modelFactory(alphabetSize);
    }
  };
  Context1Model.prototype.encode = function (ch, context) {
    this.literalModel[context].encode(ch);
  };
  Context1Model.prototype.decode = function (context) {
    return this.literalModel[context].decode();
  };

  /** Simple self-test. */
  Context1Model.MAGIC = 'ctx1';
  Context1Model.compressFile = Util.compressFileHelper(Context1Model.MAGIC, function (inStream, outStream, fileSize, props) {
    var bitstream = new BitStream(outStream);
    var alphabetSize = 256;
    if (fileSize < 0) {
      alphabetSize++;
    }
    var coder = Huffman.factory(bitstream, 8191);
    var model = new Context1Model(coder, 256, alphabetSize);
    var lastchar = 0x20;
    var modelp = {
      encode: function encode(symbol) {
        model.encode(symbol, lastchar);
        lastchar = symbol;
      }
    };
    Util.compressWithModel(inStream, fileSize, modelp);
    bitstream.flush();
  });
  Context1Model.decompressFile = Util.decompressFileHelper(Context1Model.MAGIC, function (inStream, outStream, fileSize) {
    var bitstream = new BitStream(inStream);
    var alphabetSize = 256;
    if (fileSize < 0) {
      alphabetSize++;
    }
    var coder = Huffman.factory(bitstream, 8191);
    var model = new Context1Model(coder, 256, alphabetSize);
    var lastchar = 0x20;
    var modelp = {
      decode: function decode() {
        var symbol = model.decode(lastchar);
        lastchar = symbol;
        return symbol;
      }
    };
    Util.decompressWithModel(outStream, fileSize, modelp);
  });
  return Context1Model;
}();
LzjbR = function () {
  /* Tweaked version of LZJB, using range coder. */

  var LzjbR = Object.create(null);
  LzjbR.MAGIC = 'lzjR';

  // Constants was used for compress/decompress function.
  var NBBY = 8,
    MATCH_BITS = 6,
    MATCH_MIN = 3,
    MATCH_MAX = (1 << MATCH_BITS) + (MATCH_MIN - 1),
    OFFSET_MASK = (1 << 16 - MATCH_BITS) - 1,
    LEMPEL_SIZE_BASE = 1024;
  var LENGTH_MODEL_CUTOFF = 32;

  /**
   * Compress using modified LZJB algorithm.  Instead of using the simple
   * 9-bit literal / 17-bit match format of the original, use a range
   * coder for the literal/match bit and for the offset and length.
   */
  LzjbR.compressFile = Util.compressFileHelper(LzjbR.MAGIC, function (inStream, outStream, fileSize, props, finalByte) {
    var sstart,
      dstart = [],
      slen,
      src = 0,
      dst = 0,
      cpy,
      copymap,
      mlen,
      offset,
      hash,
      hp,
      lempel,
      i,
      j;

    // in an improvement over the original C implementation of LZJB, we expand
    // the hash table to track a number of potential matches, not just the
    // most recent.  This doesn't require any changes to the decoder.
    var LEMPEL_SIZE = LEMPEL_SIZE_BASE;
    var EXPAND = 1; // default to original C impl
    if (typeof props === 'number') {
      LEMPEL_SIZE *= 2;
      props = Math.max(1, Math.min(9, props)) - 1;
      EXPAND = 1 << Math.floor(props / 2);
      if (props & 1) EXPAND = Math.round(EXPAND * 1.5);
      if (props >= 2 && props <= 4) EXPAND++;
    }
    var encoder = new RangeCoder(outStream);
    encoder.encodeStart(finalByte, 1);

    // use Uint16Array if available (zero-filled)
    lempel = Util.makeU16Buffer(LEMPEL_SIZE * EXPAND);
    var window = Util.makeU8Buffer(OFFSET_MASK + 1);
    var windowpos = 0;
    var winput = function winput(_byte) {
      window[windowpos++] = _byte;
      if (windowpos >= window.length) {
        windowpos = 0;
      }
      return _byte;
    };
    var unbuffer = [];
    var get = function get() {
      if (unbuffer.length) return unbuffer.pop();
      return inStream.readByte();
    };
    var unget = function unget(_byte) {
      unbuffer.push(_byte);
    };
    var matchpossibility = [];
    var MATCH = 256;
    var EOF_SYM = 257;
    var noModelFactory = NoModel.factory(encoder);
    var modelFactory = FenwickModel.factory(encoder, 0xFF00, 0x100);
    var literalModel = new Context1Model(modelFactory, 256, (fileSize < 0 ? EOF_SYM : MATCH) + 1);
    var sparseModelFactory = function sparseModelFactory(size) {
      if (size <= LENGTH_MODEL_CUTOFF) {
        return modelFactory(size);
      }
      return noModelFactory(size);
    };
    var lenModel = new LogDistanceModel(MATCH_MAX - MATCH_MIN + 1, 0, modelFactory, sparseModelFactory);
    var posModel = new LogDistanceModel(OFFSET_MASK + 1, 1, modelFactory, sparseModelFactory);
    var lastChar = 0x20,
      lastOffset = 0;
    while (true) {
      var initialPos = windowpos;
      var c1 = get();
      if (c1 === Stream.EOF) break;
      var c2 = get();
      if (c2 === Stream.EOF) {
        literalModel.encode(winput(c1), lastChar); // literal, not a match
        break;
      }
      var c3 = get();
      if (c3 === Stream.EOF) {
        literalModel.encode(winput(c1), lastChar); // literal, not a match
        unget(c2);
        lastChar = c1;
        continue;
      }
      hash = (c1 << 16) + (c2 << 8) + c3;
      hash ^= hash >> 9;
      hash += hash >> 5;
      hash ^= c1;
      hp = (hash & LEMPEL_SIZE - 1) * EXPAND;
      matchpossibility.length = 0;
      for (j = 0; j < EXPAND; j = j + 1 | 0) {
        offset = windowpos - lempel[hp + j] & OFFSET_MASK;
        cpy = window.length + windowpos - offset;
        var w1 = window[cpy & OFFSET_MASK];
        var w2 = window[cpy + 1 & OFFSET_MASK];
        var w3 = window[cpy + 2 & OFFSET_MASK];
        // if offset is small, we might not have copied the tentative
        // bytes into the window yet.  (Note that offset=0 really means
        // offset=(OFFSET_MASK+1).)
        if (offset == 1) {
          w2 = c1;
          w3 = c2;
        } else if (offset == 2) {
          w3 = c1;
        }
        if (c1 === w1 && c2 === w2 && c3 === w3) {
          matchpossibility.push(offset);
        }
      }
      // store this location in the hash, move the others over to make room
      // oldest match drops off
      for (j = EXPAND - 1; j > 0; j--) lempel[hp + j] = lempel[hp + j - 1];
      lempel[hp] = windowpos;
      // did we find any matches?
      if (matchpossibility.length === 0) {
        literalModel.encode(winput(c1), lastChar); // literal, not a match
        unget(c3);
        unget(c2);
        lastChar = c1;
      } else {
        literalModel.encode(MATCH, lastChar); // a match!
        // find the longest of the possible matches
        winput(c1);
        winput(c2);
        winput(c3);
        lastChar = c3;
        var c4 = get(),
          last = matchpossibility[0];
        var base = window.length + windowpos;
        for (mlen = MATCH_MIN; mlen < MATCH_MAX; mlen++, base++) {
          if (c4 === Stream.EOF) break;
          for (j = 0; j < matchpossibility.length;) {
            var w4 = window[base - matchpossibility[j] & OFFSET_MASK];
            if (c4 !== w4) {
              last = matchpossibility[j];
              matchpossibility.splice(j, 1);
            } else {
              j = j + 1 | 0;
            }
          }
          if (matchpossibility.length === 0) break; // no more matches
          winput(c4);
          lastChar = c4;
          c4 = get();
        }
        if (matchpossibility.length !== 0) {
          // maximum length match, rock on!
          last = matchpossibility[0];
        }
        unget(c4);

        // encode match length
        // XXX we could get a bit more compression if we allowed
        // the length to predict the offset (or vice-versa)
        lenModel.encode(mlen - MATCH_MIN);
        offset = initialPos - last & OFFSET_MASK;
        if (offset === lastOffset) {
          posModel.encode(-1); // common case!
        } else {
          posModel.encode(offset);
          lastOffset = offset;
        }
      }
    }
    if (fileSize < 0) {
      literalModel.encode(EOF_SYM, lastChar); // end of file (streaming)
    }

    encoder.encodeFinish();
  }, true);

  /**
   * Decompress using modified LZJB algorithm.
   */
  LzjbR.decompressFile = Util.decompressFileHelper(LzjbR.MAGIC, function (inStream, outStream, outSize) {
    var sstart,
      dstart = [],
      slen,
      src = 0,
      dst = 0,
      cpy,
      copymap,
      mlen,
      offset,
      i,
      c;
    var window = Util.makeU8Buffer(OFFSET_MASK + 1);
    var windowpos = 0;
    var decoder = new RangeCoder(inStream);
    decoder.decodeStart(true /* we already read the 'free' byte*/);

    var MATCH = 256;
    var EOF_SYM = 257;
    var noModelFactory = NoModel.factory(decoder);
    var modelFactory = FenwickModel.factory(decoder, 0xFF00, 0x100);
    var literalModel = new Context1Model(modelFactory, 256, (outSize < 0 ? EOF_SYM : MATCH) + 1);
    var sparseModelFactory = function sparseModelFactory(size) {
      if (size <= LENGTH_MODEL_CUTOFF) {
        return modelFactory(size);
      }
      return noModelFactory(size);
    };
    var lenModel = new LogDistanceModel(MATCH_MAX - MATCH_MIN + 1, 0, modelFactory, sparseModelFactory);
    var posModel = new LogDistanceModel(OFFSET_MASK + 1, 1, modelFactory, sparseModelFactory);
    var lastChar = 0x20,
      lastOffset = 0;
    while (outSize !== 0) {
      c = literalModel.decode(lastChar);
      if (c === EOF_SYM) {
        break;
      } else if (c === MATCH) {
        mlen = lenModel.decode() + MATCH_MIN;
        cpy = posModel.decode();
        if (cpy < 0) {
          cpy = lastOffset;
        } else {
          lastOffset = cpy;
        }
        if (outSize >= 0) outSize -= mlen;
        while (--mlen >= 0) {
          c = lastChar = window[windowpos++] = window[cpy++];
          outStream.writeByte(c);
          if (windowpos >= window.length) {
            windowpos = 0;
          }
          if (cpy >= window.length) {
            cpy = 0;
          }
        }
      } else {
        outStream.writeByte(c);
        window[windowpos++] = lastChar = c;
        if (windowpos >= window.length) {
          windowpos = 0;
        }
        if (outSize >= 0) outSize--;
      }
    }
    decoder.decodeFinish();
  });
  return LzjbR;
}();
Lzp3 = function () {
  /* Implementation of LZP3(ish), with an adaptive Huffman code or a range
   * coder (instead of LZP3's original static Huffman code).
   * See: http://www.cbloom.com/papers/lzp.pdf
   */

  var Lzp3 = Object.create(null);
  Lzp3.MAGIC = 'lzp3';

  // use Huffman coder (fast) or else use range coder (slow)
  var USE_HUFFMAN_CODE = false;
  // use deferred-sum model, which is supposed to be faster (but compresses worse)
  var USE_DEFSUM = false;
  // when to give up attempting to model the length
  var LENGTH_MODEL_CUTOFF = 256;
  var MODEL_MAX_PROB = 0xFF00;
  var MODEL_INCREMENT = 0x100;

  // Constants was used for compress/decompress function.
  var CTXT4_TABLE_SIZE = 1 << 16;
  var CTXT3_TABLE_SIZE = 1 << 12;
  var CTXT2_TABLE_SIZE = 1 << 16;
  var CONTEXT_LEN = 4;
  var LOG_WINDOW_SIZE = 20;
  var WINDOW_SIZE = 1 << LOG_WINDOW_SIZE;
  var MAX_MATCH_LEN = WINDOW_SIZE - 1;
  var MATCH_LEN_CONTEXTS = 16;
  var MAX32 = 0xFFFFFFFF;
  var MAX24 = 0x00FFFFFF;
  var MAX16 = 0x0000FFFF;
  var MAX8 = 0x000000FF;
  var Window = function Window(maxSize) {
    this.buffer = Util.makeU8Buffer(Math.min(maxSize + 4, WINDOW_SIZE));
    this.pos = 0;
    // context-4 hash table.
    this.ctxt4 = Util.makeU32Buffer(CTXT4_TABLE_SIZE);
    // context-3 hash table
    this.ctxt3 = Util.makeU32Buffer(CTXT3_TABLE_SIZE);
    // context-2 table (not really a hash any more)
    this.ctxt2 = Util.makeU32Buffer(CTXT2_TABLE_SIZE);
    // initial context
    this.put(0x63);
    this.put(0x53);
    this.put(0x61);
    this.put(0x20);
  };
  Window.prototype.put = function (_byte) {
    this.buffer[this.pos++] = _byte;
    if (this.pos >= WINDOW_SIZE) {
      this.pos = 0;
    }
    return _byte;
  };
  Window.prototype.get = function (pos) {
    return this.buffer[pos & WINDOW_SIZE - 1];
  };
  Window.prototype.context = function (pos, n) {
    var c = 0,
      i;
    pos = pos - n & WINDOW_SIZE - 1;
    for (i = 0; i < n; i = i + 1 | 0) {
      c = c << 8 | this.buffer[pos++];
      if (pos >= WINDOW_SIZE) {
        pos = 0;
      }
    }
    return c;
  };
  // if matchLen !== 0, update the index; otherwise get index value.
  Window.prototype.getIndex = function (s, matchLen) {
    var c = this.context(s, 4);
    // compute context hashes
    var h4 = (c >>> 15 ^ c) & CTXT4_TABLE_SIZE - 1;
    var h3 = (c >>> 11 ^ c) & CTXT3_TABLE_SIZE - 1;
    var h2 = c & MAX16;
    // check order-4 context
    var p = 0,
      checkc;
    // only do context confirmation if matchLen==0 (that is, if we're not just
    // doing an update)
    if (matchLen === 0) {
      p = this.ctxt4[h4];
      if (p !== 0 && c !== this.context(p - 1, 4)) {
        p = 0; // context confirmation failed
      }

      if (p === 0) {
        // check order-3 context
        p = this.ctxt3[h3];
        if (p !== 0 && (c & MAX24) !== this.context(p - 1, 3)) {
          p = 0; // context confirmation failed
        }

        if (p === 0) {
          // check order-2 context
          p = this.ctxt2[h2];
          if (p !== 0 && (c && MAX16) !== this.context(p - 1, 2)) {
            p = 0; // context confirmation failed
          }
        }
      }
    }
    // update context index
    if (matchLen) {
      matchLen--;
    }
    this.ctxt4[h4] = this.ctxt3[h3] = this.ctxt2[h2] = (s | matchLen << LOG_WINDOW_SIZE) + 1;
    // return lookup result.
    return p;
  };

  /**
   * Compress using modified LZP3 algorithm.  Instead of using static
   * Huffman coding, we use an adaptive Huffman code or range encoding.
   */
  Lzp3.compressFile = Util.compressFileHelper(Lzp3.MAGIC, function (inStream, outStream, fileSize, props) {
    // sliding window & hash table
    var window = new Window(fileSize >= 0 ? fileSize : WINDOW_SIZE);
    var coderFactory, sparseCoderFactory, flush;
    if (USE_HUFFMAN_CODE) {
      // Huffman contexts
      outStream.writeByte(0x80); // mark that this is Huffman coded.
      var bitstream = new BitStream(outStream);
      flush = bitstream.flush.bind(bitstream);
      coderFactory = Huffman.factory(bitstream, MAX16);
      sparseCoderFactory = NoModel.factory(bitstream);
    } else {
      // range encoder
      var range = new RangeCoder(outStream);
      range.encodeStart(0x00, 0); // 0x00 == range encoded

      coderFactory = FenwickModel.factory(range, MODEL_MAX_PROB, MODEL_INCREMENT);
      if (USE_DEFSUM) {
        coderFactory = DefSumModel.factory(range, false /* encoder */);
      }
      // switch sparseCoderFactory to a NoModel when size > cutoff
      var noCoderFactory = NoModel.factory(range);
      sparseCoderFactory = function sparseCoderFactory(size) {
        if (size > LENGTH_MODEL_CUTOFF) {
          return noCoderFactory(size);
        }
        return coderFactory(size);
      };
      flush = function flush() {
        range.encodeFinish();
      };
    }
    var huffLiteral = new Context1Model(coderFactory, 256, fileSize < 0 ? 257 : 256);
    var huffLen = [],
      i;
    for (i = 0; i < MATCH_LEN_CONTEXTS; i = i + 1 | 0) {
      huffLen[i] = new LogDistanceModel(MAX_MATCH_LEN + 1, 1, coderFactory, sparseCoderFactory);
    }
    var inSize = 0,
      s,
      matchContext = 0;
    while (inSize !== fileSize) {
      var ch = inStream.readByte();
      s = window.pos;
      var p = window.getIndex(s, 0);
      if (p !== 0) {
        // great, a match! how long is it?
        p--; // p=0 is used for 'not here'. p=1 really means WINDOW_SIZE
        var prevMatchLen = (p >>> LOG_WINDOW_SIZE) + 1;
        var matchLen = 0;
        while (window.get(p + matchLen) === ch && matchLen < MAX_MATCH_LEN) {
          matchLen++;
          window.put(ch);
          ch = inStream.readByte();
        }
        // code match length; match len = 0 means "literal"
        // use "extra state" -1 to mean "same as previous match length"
        if (prevMatchLen === matchLen) {
          huffLen[matchContext & MATCH_LEN_CONTEXTS - 1].encode(-1);
        } else {
          huffLen[matchContext & MATCH_LEN_CONTEXTS - 1].encode(matchLen);
        }
        // update hash with this match
        window.getIndex(s, matchLen);
        inSize += matchLen;
        matchContext <<= 1;
        if (matchLen > 0) {
          matchContext |= 1;
        }
        // XXX: LZMA uses a special "delta match" context here if matchLen==0
        // XXX: it also uses the offset as context for the length (or vice-versa)
      }
      // always encode a literal after a match
      var context1 = window.get(window.pos - 1);
      if (ch === Stream.EOF) {
        if (fileSize < 0) {
          huffLiteral.encode(256, context1);
        }
        break;
      }
      huffLiteral.encode(ch, context1);
      window.put(ch);
      inSize++;
    }
    if (flush) flush();
  });

  /**
   * Decompress using modified LZP3 algorithm.
   */
  Lzp3.decompressFile = Util.decompressFileHelper(Lzp3.MAGIC, function (inStream, outStream, fileSize) {
    var flags = inStream.readByte();
    var use_huffman_code = !!(flags & 0x80);

    // sliding window & hash table
    var window = new Window(fileSize >= 0 ? fileSize : WINDOW_SIZE);
    var coderFactory, sparseCoderFactory, finish;
    if (use_huffman_code) {
      // Huffman contexts
      var bitstream = new BitStream(inStream);
      coderFactory = Huffman.factory(bitstream, MAX16);
      sparseCoderFactory = NoModel.factory(bitstream);
    } else {
      // range encoder
      var range = new RangeCoder(inStream);
      range.decodeStart(true /* skip initial read */);
      coderFactory = FenwickModel.factory(range, MODEL_MAX_PROB, MODEL_INCREMENT);
      if (USE_DEFSUM) {
        coderFactory = DefSumModel.factory(range, true /* decoder */);
      }
      // switch sparseCoderFactory to a NoModel when size > cutoff
      var noCoderFactory = NoModel.factory(range);
      sparseCoderFactory = function sparseCoderFactory(size) {
        if (size > LENGTH_MODEL_CUTOFF) {
          return noCoderFactory(size);
        }
        return coderFactory(size);
      };
      finish = function finish() {
        range.decodeFinish();
      };
    }
    var huffLiteral = new Context1Model(coderFactory, 256, fileSize < 0 ? 257 : 256);
    var huffLen = [],
      i;
    for (i = 0; i < MATCH_LEN_CONTEXTS; i = i + 1 | 0) {
      huffLen[i] = new LogDistanceModel(MAX_MATCH_LEN + 1, 1, coderFactory, sparseCoderFactory);
    }
    var s,
      ch,
      outSize = 0,
      matchContext = 0;
    while (outSize !== fileSize) {
      s = window.pos;
      var p = window.getIndex(s, 0);
      if (p !== 0) {
        p--; // p=0 is used for 'not here'. p=1 really means WINDOW_SIZE
        var prevMatchLen = (p >>> LOG_WINDOW_SIZE) + 1;
        var matchLen = huffLen[matchContext & MATCH_LEN_CONTEXTS - 1].decode();
        if (matchLen < 0) {
          matchLen = prevMatchLen;
        }
        // copy characters!
        for (i = 0; i < matchLen; i = i + 1 | 0) {
          ch = window.get(p + i);
          outStream.writeByte(window.put(ch));
        }
        window.getIndex(s, matchLen);
        outSize += matchLen;
        matchContext <<= 1;
        if (matchLen > 0) matchContext |= 1;
      }
      // literal always follows match (or failed match)
      if (outSize === fileSize) {
        break; // EOF
      }

      var context1 = window.get(window.pos - 1);
      ch = huffLiteral.decode(context1);
      if (ch === 256) {
        break; // EOF
      }

      outStream.writeByte(window.put(ch));
      outSize++;
    }
    if (finish) finish();
  });
  return Lzp3;
}();
UraniumJS.enrichFunctionCalls = [Lzp3.compressFile, LzjbR.compressFile];
UraniumJS.withinEnrich = function (uint8array) {
  function regenerate(uint8array) {
    return typeof uint8array.slice != "undefined" ? uint8array.slice(0, uint8array.length) : Uint8Array.from(uint8array);
  }
  uint8array = regenerate(uint8array);
  Array.from(UraniumJS.enrichFunctionCalls).forEach(function (fun) {
    uint8array = regenerate(fun(uint8array));
  });
  return uint8array;
};
UraniumJS.depleteFunctionCalls = [Lzp3.decompressFile, LzjbR.decompressFile];
UraniumJS.withinDeplete = function (uint8array) {
  function regenerate(uint8array) {
    return typeof uint8array.slice != "undefined" ? uint8array.slice(0, uint8array.length) : Uint8Array.from(uint8array);
  }
  uint8array = regenerate(uint8array);
  Array.from(UraniumJS.depleteFunctionCalls).reverse().forEach(function (fun) {
    uint8array = regenerate(fun(uint8array));
  });
  return uint8array;
};
UraniumJS.enrichString = function (it, logs) {
  var initial_size = it.length;
  var s_parsing = Date.now();
  it = UraniumJS.utils.stringify(it);
  it = UraniumJS.UTF8.toUint8Array(it);
  var s_compressing = Date.now();
  it = UraniumJS.withinEnrich(it);
  var s_encoding = Date.now();
  it = new UraniumJS(it).encode();
  it = UraniumJS.utils.escape(it);
  var s_ended = Date.now();
  var final_size = it.length;
  if (logs) {
    console.log("Parsing: " + (s_parsing - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_encoding | 0) + "ms, \nEncoding: " + (s_encoding - s_ended) + "ms, \n\nTotal: " + (s_parsing - s_ended | 0) + "ms for " + (100 - final_size / initial_size * 100 | 0) + "% ENRICHMENT!");
  }
  return it;
};
UraniumJS.stringDeplete = function (it, logs) {
  var initial_size = it.length;
  var s_escaping = Date.now();
  it = UraniumJS.utils.unescape(it);
  it = new UraniumJS(it).decode();
  var s_compressing = Date.now();
  it = UraniumJS.withinDeplete(it);
  var s_parsing = Date.now();
  it = UraniumJS.UTF8.fromUint8Array(it);
  it = UraniumJS.utils.parse(it);
  var s_ended = Date.now();
  var final_size = it.length;
  if (logs) {
    console.log("Unescape: " + (s_escaping - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_parsing | 0) + "ms, \nParsing: " + (s_parsing - s_ended) + "ms, \n\nTotal: " + (s_escaping - s_ended | 0) + "ms for " + (final_size / initial_size * 100 | 0) + "% DEPLETION!");
  }
  return it;
};
UraniumJS.enrichObject = function (o, logs) {
  var initial_size = 1 / 0; //o.length;
  var s_parsing = Date.now();
  o = UraniumJS.BSER.pack(o);
  var s_compressing = Date.now();
  o = UraniumJS.withinEnrich(o);
  var s_encoding = Date.now();
  o = new UraniumJS(o).encode();
  o = UraniumJS.utils.escape(o);
  var s_ended = Date.now();
  var final_size = o.length;
  if (logs) {
    console.log("Parsing: " + (s_parsing - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_encoding | 0) + "ms, \nEncoding: " + (s_encoding - s_ended) + "ms, \n\nTotal: " + (s_parsing - s_ended | 0) + "ms for " + (100 - final_size / initial_size * 100 | 0) + "% ENRICHMENT!");
  }
  return o;
};
UraniumJS.objectDeplete = function (o, logs) {
  var initial_size = 1 / 0; //o.length;
  var s_escaping = Date.now();
  o = UraniumJS.utils.unescape(o);
  o = new UraniumJS(o).decode();
  var s_compressing = Date.now();
  o = UraniumJS.withinDeplete(o);
  var s_parsing = Date.now();
  o = UraniumJS.BSER.unpack(o);
  var s_ended = Date.now();
  var final_size = o.length;
  if (logs) {
    console.log("Unescape: " + (s_escaping - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_parsing | 0) + "ms, \nParsing: " + (s_parsing - s_ended) + "ms, \n\nTotal: " + (s_escaping - s_ended | 0) + "ms for " + (final_size / initial_size * 100 | 0) + "% DEPLETION!");
  }
  return o;
};
window.UraniumJS = UraniumJS;
module.exports = UraniumJS;
