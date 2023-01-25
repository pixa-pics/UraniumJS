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
    get: function get() { return this.char_code_ & 0xFFFF },
    set: function get(n) { this.char_code_ = n & 0xFFFF }
});
Object.defineProperty(UTF8.prototype, 'char_length', {
    get: function get() { return this.char_length_ & 0xFFFFFFFF },
    set: function get(n) { this.char_length_ = n & 0xFFFFFFFF }
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
    neededBytes = (neededBytes|0) == 0 ? this._getBytesForCharCode(this.char_code): neededBytes | 0;
    // Setting the charCode as it to bytes if the byte length is 1
    if (1 == (neededBytes|0)) {
        bytes[byteOffset|0] = this.char_code|0;
    } else {
        // Computing the first byte
        neededBytes = neededBytes-1|0;
        bytes[byteOffset|0] = (this.FIRST_BYTE_MASK_E(neededBytes) << 8 - neededBytes) + (this.char_code >>> neededBytes * 6) | 0;
        byteOffset = byteOffset+1|0;
        // Computing next bytes
        for (; (neededBytes|0) > 0;) {
            neededBytes = neededBytes-1|0;
            bytes[byteOffset| 0] = (this.char_code >>> neededBytes * 6 & 0x3f | 0x80) | 0;
            byteOffset = byteOffset+1|0;
        }
    }
};
UTF8.prototype.toUint8Array = function (string, bytes, byteOffset, byteLength, strict) {
    string = string || '';
    bytes = bytes || [];
    byteOffset = byteOffset | 0;
    byteLength = 'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
    for (var i = 0, j = string.length|0; (i|0) < (j|0); i=i+1|0) {
        var neededBytes = this._getBytesForCharCode(string[i].codePointAt(0));
        if (strict && (byteOffset + neededBytes|0) > (byteLength|0)) {
            throw new Error('Not enought bytes to encode the char "' + string[i|0] + '" at the offset "' + byteOffset + '".');
        } else {
            this._setBytesFromCharCode(string[i|0].codePointAt(0), bytes, byteOffset|0, neededBytes|0, strict);
            byteOffset = byteOffset+neededBytes|0;
        }
    }
    return bytes instanceof Uint8Array ? bytes: Uint8Array.from(bytes);
};
UTF8.prototype._getCharCode = function (bytes, byteOffset, charLength) {
    this.char_code = 0;
    byteOffset = byteOffset | 0;
    // Retrieve charLength if not given
    this.char_length = (charLength|0) == 0 ? this._getCharLength(bytes[byteOffset]): charLength | 0;

    // validate that the array has at least one byte in it
    if (bytes.length - byteOffset <= 0) {
        throw new Error('No more characters remaining in array.');
    }

    if ((this.char_length|0) == 0) {
        throw new Error(bytes[byteOffset].toString(2) + ' is not a significative' + ' byte (offset:' + byteOffset + ').');
    }
    // Return byte value if charlength is 1
    if (1 == (this.char_length|0)) {
        return bytes[byteOffset|0] | 0;
    }
    // validate that the array has enough bytes to make up this character
    if ((bytes.length - byteOffset | 0) < (this.char_length|0)) {
        throw new Error('Expected at least ' + this.char_length + ' bytes remaining in array.');
    }
    // Test UTF8 integrity
    if (bytes[byteOffset] & this.INTEGRITY_BYTE_MASK_E(this.char_length)) {
        throw Error('Index ' + byteOffset + ': A ' + this.char_length + ' bytes' + ' encoded char' + ' cannot encode the ' + (this.char_length + 1) + 'th rank bit to 1.');
    }
    // Reading the first byte
    this.char_length = this.char_length - 1 | 0;
    this.char_code = this.char_code + ((bytes[byteOffset|0] & this.READING_BYTE_MASK_E(this.char_length)) << this.char_length * 6) | 0;
    // Reading the next bytes
    while (this.char_length) {
        if (0x80 !== (bytes[byteOffset + 1] & 0x80) || 0x40 === (bytes[byteOffset + 1] & 0x40)) {
            throw Error('Index ' + (byteOffset + 1) + ': Next bytes of encoded char' + ' must begin with a "10" bit sequence.');
        }
        byteOffset = byteOffset + 1 | 0; this.char_length = this.char_length - 1 | 0;
        this.char_code = this.char_code + ((bytes[byteOffset|0] & 0x3f) << this.char_length * 6) | 0;
    }
    return this.char_code | 0;
};
UTF8.prototype.fromUint8Array = function (bytes, byteOffset, byteLength, strict) {
    this.char_length = 0; var chars = "";
    byteOffset = byteOffset | 0;
    byteLength = 'number' === typeof byteLength ? byteLength : bytes.byteLength || bytes.length | 0;
    for (; (byteOffset|0) < (byteLength|0); (byteOffset=byteOffset+1|0)>>>0) {
        this.char_length = this._getCharLength(bytes[byteOffset]);
        if (strict && (byteOffset + this.char_length|0) > (byteLength|0)) {

            throw Error('Index ' + byteOffset + ': Found a ' + this.char_length + ' bytes encoded char declaration but only ' + (byteLength - byteOffset) + ' bytes are available.');
        } else {
            chars = chars.concat(String.fromCodePoint(this._getCharCode(bytes, byteOffset|0, this.char_length|0, strict)));
        }
        byteOffset = byteOffset+this.char_length - 1|0;
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

// Optional exportation for node js

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
            this.storage_input_ = UraniumJS.UTFX.toUint8Array(data);
        } else if (typeof data.buffer != "undefined" || data instanceof ArrayBuffer) {
            this.storage_input_ = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer);
        } else if(data instanceof Array){
            this.storage_input_ = Uint8Array.from(data);
        }else if(typeof data === "object"){
            this.storage_input_ = UraniumJS.JSONX.stringify(data);
        }else {
            throw new TypeError(`attempted to parse failed`);
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

UraniumJS.JSONX = JSON;
UraniumJS.UTF8 = new UTF8();
UraniumJS.UTFX = UraniumJS.UTF8;
UraniumJS.config = {};
UraniumJS.config.TILD_CHAR_CODE = 126;
UraniumJS.config.BACKSLASH_CHAR = String.fromCharCode(92);
UraniumJS.config.SLASH_CHAR = String.fromCharCode(47);
UraniumJS.config.CHUNCK_LENGTH = 256;
UraniumJS.config.ENCODE_MAPPING = Uint8Array.of(33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
UraniumJS.config.DECODE_MAPPING = Uint8Array.of(255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 255, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255);

Object.defineProperty(UraniumJS.prototype, 'getCharCodeAt', {
    get: function get() {
        return function (i) {i = i | 0;return this.storage_input_[i | 0];};
    }
});
Object.defineProperty(UraniumJS.prototype, 'getDecodedCharCodeAt', {
    get: function get() {
        return function (i) {i = i | 0;return this.DECODE_MAPPING_[this.storage_input_[i | 0]];};
    }
});
Object.defineProperty(UraniumJS.prototype, 'decodeChar', {
    get: function get() {
        return function (i) {i = i | 0;return this.DECODE_MAPPING_[i | 0];};
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
    return UraniumJS.JSONX.parse(UraniumJS.utils.onlyCharParsable(string));
};
UraniumJS.utils.stringify = function (string) {
    return UraniumJS.utils.onlyCharPrintable(UraniumJS.JSONX.stringify(string));
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
                return UraniumJS.UTFX.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
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
            return UraniumJS.UTFX.fromUint8Array(results.slice(0, results.length | 0));
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
                return UraniumJS.UTFX.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
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
                return UraniumJS.UTFX.fromUint8Array(Uint8Array.of());
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
            return UraniumJS.UTFX.fromUint8Array(res.slice(0, res.length | 0));
        case "JS":
            return UraniumJS.JSONX.stringify(res.slice(0, res.length | 0));
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

UraniumJS.enrichFunctionCalls = [];

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

UraniumJS.depleteFunctionCalls = [];

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
    it = UraniumJS.UTFX.toUint8Array(it);
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
    it = UraniumJS.UTFX.fromUint8Array(it);
    it = UraniumJS.utils.parse(it);
    var s_ended = Date.now();
    var final_size = it.length;
    if (logs) {
        console.log("Unescape: " + (s_escaping - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_parsing | 0) + "ms, \nParsing: " + (s_parsing - s_ended) + "ms, \n\nTotal: " + (s_escaping - s_ended | 0) + "ms for " + (final_size / initial_size * 100 | 0) + "% DEPvarION!");
    }
    return it;
};

UraniumJS.enrichObject = function (o, logs) {
    o = UraniumJS.JSONX.stringify(o);
    return UraniumJS.enrichString(o, logs);
};
UraniumJS.objectDeplete = function (o, logs) {

    o = UraniumJS.stringDeplete(o, logs)
    return UraniumJS.JSONX.parse(o);
};

UraniumJS.enrichBuffer = function (it, base92, logs) {
    var initial_size = it.length || it.byteLength;
    var s_compressing = Date.now();
    it = UraniumJS.withinEnrich(it);
    var s_encoding = Date.now();
    if(base92) {
        it = new UraniumJS(it).encode();
        it = UraniumJS.utils.escape(it);
    }
    var s_ended = Date.now();
    var final_size = it.length;
    if (logs) {
        console.log("Compressing: " + (s_compressing - s_encoding | 0) + "ms, \nEncoding: " + (s_encoding - s_ended) + "ms, \n\nTotal: " + (s_compressing - s_ended | 0) + "ms for " + (100 - final_size / initial_size * 100 | 0) + "% ENRICHMENT!");
    }
    return it;
};
UraniumJS.bufferDeplete = function (it, base92, logs) {
    var initial_size = it.length || it.byteLength;
    var s_escaping = Date.now();
    if(base92) {
        it = UraniumJS.utils.unescape(it);
        it = new UraniumJS(it).decode();
    }
    var s_compressing = Date.now();
    it = UraniumJS.withinDeplete(it);
    var s_ended = Date.now();
    var final_size = it.length;
    if (logs) {
        console.log("Unescape: " + (s_escaping - s_compressing | 0) + "ms, \nCompressing: " + (s_compressing - s_ended | 0) + "ms \n\nTotal: " + (s_escaping - s_ended | 0) + "ms for " + (final_size / initial_size * 100 | 0) + "% DEPvarION!");
    }
    return it;
};

if(typeof module != "undefined") {
    module.exports = UraniumJS;
}else {
    window.UraniumJS = UraniumJS;
}
