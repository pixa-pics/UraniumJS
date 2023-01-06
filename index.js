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

var UraniumJS = function(data, base){

    if (!(this instanceof UraniumJS)) {
        return new UraniumJS(data);
    }

    base = base || "UNKNOWN";
    base = base.toUpperCase();

    if(base != "BASE64") {
        if(data instanceof Uint8Array || data instanceof Uint8ClampedArray) {

            this.storage_input_ =  data;
        }else if(typeof data == "string") {

            this.storage_input_ =  UraniumJS.UTF8.toUint8Array(data);
        }else if(typeof data.buffer != "undefined" || data instanceof ArrayBuffer) {

            this.storage_input_ =  new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer);
        }else {

            this.storage_input_ =  Uint8Array.from(data);
        }
    }else {

        this.storage_input_ =  UraniumJS.BASE64.toUint8Array(data);
    }

    this.storage_input_length_ = data.length | 0 ;

    this.TILD_CHAR_CODE_ = UraniumJS.config.TILD_CHAR_CODE;
    this.BACKSLASH_CHAR_ = UraniumJS.config.BACKSLASH_CHAR;
    this.SLASH_CHAR_ = UraniumJS.config.SLASH_CHAR;
    this.CHUNCK_LENGTH_ = UraniumJS.config.CHUNCK_LENGTH;
    this.ENCODE_MAPPING_ = UraniumJS.config.ENCODE_MAPPING;
    this.DECODE_MAPPING_ = UraniumJS.config.DECODE_MAPPING;

    return this;
};


/*
 * The MIT License (MIT)
 * Copyright © 2017 Nicolas Froidure (https://github.com/nfroidure/utf-8)
 * Copyright © 2022 Affolter Matias
*/

var UTF8 = function(){
    if (!(this instanceof UTF8)) {
        return new UTF8();
    }

    this.BMC_LENGTH_ = UTF8.config.BMC_LENGTH;
    this.BMC_CODE_ = UTF8.config.BMC_CODE;
};

UTF8.config = {};
UTF8.config.BMC_LENGTH = Uint8Array.of(0b0, 0b1111111, 0b11000000, 0b11100000, 0b11110000);
UTF8.config.BMC_CODE = Uint32Array.of(0, 128, 2048, 65536, 2097152);

Object.defineProperty(UTF8.prototype, 'BMC_LENGTH_E', {
    get: function() {
        return function (i){
            return this.BMC_LENGTH_[i|0] & 0xFF;
        };
    }
});
Object.defineProperty(UTF8.prototype, 'BMC_CODE_E', {
    get: function() {
        return function (i){
            return this.BMC_CODE_[i|0] & 0xFFFFFFFF;
        };
    }
});

UTF8.prototype._getCharLength = function(byte) {

    if (this.BMC_LENGTH_E(4) == (byte & this.BMC_LENGTH_E(4))) {
        return 4;
    } else if (this.BMC_LENGTH_E(3) == (byte & this.BMC_LENGTH_E(3))) {
        return 3;
    } else if (this.BMC_LENGTH_E(2) == (byte & this.BMC_LENGTH_E(2))) {
        return 2;
    } else if (byte == (byte & this.BMC_LENGTH_E(1))) {
        return 1;
    }else {
        return 0;
    }
};
UTF8.prototype._getBytesForCharCode = function (cc){

    if (cc < this.BMC_CODE_E(1)) {
        return 1;
    } else if (cc < this.BMC_CODE_E(2)) {
        return 2;
    } else if (cc < this.BMC_CODE_E(3)) {
        return 3;
    } else if (cc < this.BMC_CODE_E(4)) {
        return 4;
    }else {
        throw new Error('CharCode ' + cc + ' cannot be encoded with UTF8.');
    }
};

UTF8.prototype._setBytesFromCharCode = function (charCode, bytes, byteOffset, neededBytes) {
    charCode = charCode | 0;
    bytes = bytes || [];
    byteOffset = byteOffset | 0;
    neededBytes = neededBytes || this._getBytesForCharCode(charCode);
    // Setting the charCode as it to bytes if the byte length is 1
    if (1 == neededBytes) {
        bytes[byteOffset] = charCode;
    } else {
        // Computing the first byte
        bytes[byteOffset++] =
            (parseInt('1111'.slice(0, neededBytes), 2) << (8 - neededBytes)) +
            (charCode >>> (--neededBytes * 6));
        // Computing next bytes
        for (; neededBytes > 0; ) {
            bytes[byteOffset++] = ((charCode >>> (--neededBytes * 6)) & 0x3f) | 0x80;
        }
    }
    return bytes;
};

UTF8.prototype.toUint8Array = function(string, bytes, byteOffset, byteLength, strict) {
    string = string || '';
    bytes = bytes || [];
    byteOffset = byteOffset | 0;
    byteLength =
        'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
    for (var i = 0, j = string.length; i < j; i++) {
        var neededBytes = this._getBytesForCharCode(string[i].codePointAt(0));
        if (strict && byteOffset + neededBytes > byteLength) {
            throw new Error(
                'Not enought bytes to encode the char "' +
                string[i] +
                '" at the offset "' +
                byteOffset +
                '".'
            );
        }else {
            this._setBytesFromCharCode(
                string[i].codePointAt(0),
                bytes,
                byteOffset,
                neededBytes,
                strict
            );
            byteOffset += neededBytes;
        }
    }
    return bytes;
};
UTF8.prototype._getCharCode = function(bytes, byteOffset, charLength) {
    var charCode = 0,
        mask = '';
    byteOffset = byteOffset || 0;
    // validate that the array has at least one byte in it
    if (bytes.length - byteOffset <= 0) {
        throw new Error('No more characters remaining in array.');
    }
    // Retrieve charLength if not given
    charLength = charLength || this._getCharLength(bytes[byteOffset]);
    if (charLength == 0) {
        throw new Error(
            bytes[byteOffset].toString(2) +
            ' is not a significative' +
            ' byte (offset:' +
            byteOffset +
            ').'
        );
    }
    // Return byte value if charlength is 1
    if (1 === charLength) {
        return bytes[byteOffset];
    }
    // validate that the array has enough bytes to make up this character
    if (bytes.length - byteOffset < charLength) {
        throw new Error(
            'Expected at least ' + charLength + ' bytes remaining in array.'
        );
    }
    // Test UTF8 integrity
    mask = '00000000'.slice(0, charLength) + 1 + '00000000'.slice(charLength + 1);
    if (bytes[byteOffset] & parseInt(mask, 2)) {
        throw Error(
            'Index ' +
            byteOffset +
            ': A ' +
            charLength +
            ' bytes' +
            ' encoded char' +
            ' cannot encode the ' +
            (charLength + 1) +
            'th rank bit to 1.'
        );
    }
    // Reading the first byte
    mask = '0000'.slice(0, charLength + 1) + '11111111'.slice(charLength + 1);
    charCode += (bytes[byteOffset] & parseInt(mask, 2)) << (--charLength * 6);
    // Reading the next bytes
    while (charLength) {
        if (
            0x80 !== (bytes[byteOffset + 1] & 0x80) ||
            0x40 === (bytes[byteOffset + 1] & 0x40)
        ) {
            throw Error(
                'Index ' +
                (byteOffset + 1) +
                ': Next bytes of encoded char' +
                ' must begin with a "10" bit sequence.'
            );
        }
        charCode += (bytes[++byteOffset] & 0x3f) << (--charLength * 6);
    }
    return charCode;
};
UTF8.prototype.fromUint8Array = function (bytes, byteOffset, byteLength, strict) {
    var charLength,
        chars = [];
    byteOffset = byteOffset | 0;
    byteLength =
        'number' === typeof byteLength
            ? byteLength
            : bytes.byteLength || bytes.length;
    for (; byteOffset < byteLength; byteOffset++) {
        charLength = this._getCharLength(bytes[byteOffset]);
        if (byteOffset + charLength > byteLength) {
            if (strict) {
                throw Error(
                    'Index ' +
                    byteOffset +
                    ': Found a ' +
                    charLength +
                    ' bytes encoded char declaration but only ' +
                    (byteLength - byteOffset) +
                    ' bytes are available.'
                );
            }
        } else {
            chars.push(
                String.fromCodePoint(this._getCharCode(bytes, byteOffset, charLength, strict))
            );
        }
        byteOffset += charLength - 1;
    }
    return chars.join('');
};
UTF8.prototype.isNotUTF8 = function (bytes, byteOffset, byteLength) {
    try {
        this.fromUint8Array(bytes, byteOffset, byteLength, true);
    } catch (e) {
        return true;
    }
    return false;
}

UraniumJS.UTF8 = new UTF8();

/**
 $Id: Iuppiter.js 3026 2010-06-23 10:03:13Z Bear $

 Copyright (c) 2010 Nuwa Information Co., Ltd, and individual contributors.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 3. Neither the name of Nuwa Information nor the names of its contributors
 may be used to endorse or promote products derived from this software
 without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 $Author: Bear $ (Modified by Matias A.)
 */

UraniumJS.LZJB = (function () {

    // Constants was used for compress/decompress function.
    var
        NBBY = 8,
        MATCH_BITS = 6,
        MATCH_MIN = 3,
        MATCH_MAX = ((1 << MATCH_BITS) + (MATCH_MIN - 1)),
        OFFSET_MASK = ((1 << (16 - MATCH_BITS)) - 1),
        LEMPEL_SIZE = 256;


    /**
     * Convert string value to a byte array.
     *
     * @param {String} input The input string value.
     * @return {Array} A byte array from string value.
     */
    var toByteArray = function(input) {
        var b = [], i, unicode;
        for(i = 0; i < input.length; i++) {
            unicode = input.charCodeAt(i);
            // 0x00000000 - 0x0000007f -> 0xxxxxxx
            if (unicode <= 0x7f) {
                b.push(unicode);
                // 0x00000080 - 0x000007ff -> 110xxxxx 10xxxxxx
            } else if (unicode <= 0x7ff) {
                b.push((unicode >> 6) | 0xc0);
                b.push((unicode & 0x3F) | 0x80);
                // 0x00000800 - 0x0000ffff -> 1110xxxx 10xxxxxx 10xxxxxx
            } else if (unicode <= 0xffff) {
                b.push((unicode >> 12) | 0xe0);
                b.push(((unicode >> 6) & 0x3f) | 0x80);
                b.push((unicode & 0x3f) | 0x80);
                // 0x00010000 - 0x001fffff -> 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            } else {
                b.push((unicode >> 18) | 0xf0);
                b.push(((unicode >> 12) & 0x3f) | 0x80);
                b.push(((unicode >> 6) & 0x3f) | 0x80);
                b.push((unicode & 0x3f) | 0x80);
            }
        }

        return Uint8Array.from(b);
    }

    /**
     * Compress string or byte array using fast and efficient algorithm.
     *
     * Because of weak of javascript's natural, many compression algorithm
     * become useless in javascript implementation. The main problem is
     * performance, even the simple Huffman, LZ77/78 algorithm will take many
     * many time to operate. We use LZJB algorithm to do that, it suprisingly
     * fulfills our requirement to compress string fastly and efficiently.
     *
     * Our implementation is based on
     * http://src.opensolaris.org/source/raw/onnv/onnv-gate/
     * usr/src/uts/common/os/compress.c
     * It is licensed under CDDL.
     *
     * Please note it depends on toByteArray utility function.
     *
     * @param {String|Array} input The string or byte array that you want to
     *                             compress.
     * @return {Array} Compressed byte array.
     */
    var compress = function(input) {
        var sstart, dstart = [], slen,
            src = 0, dst = 0,
            cpy, copymap,
            copymask = 1 << (NBBY - 1),
            mlen, offset,
            hp,
            lempel = new Uint32Array(LEMPEL_SIZE).fill(3435973836), // Initialize lempel array.
            i, bytes;

        // Using byte array or not.
        if(typeof input.buffer != "undefined") {
            sstart = input;
            bytes = true;
        } else {
            sstart = toByteArray(input);
            bytes = false;
        }

        slen = sstart.length;

        while (src < slen) {
            if ((copymask <<= 1) == (1 << NBBY)) {
                if (dst >= slen - 1 - 2 * NBBY) {
                    mlen = slen;
                    for (src = 0, dst = 0; mlen; mlen--)
                        dstart[dst++] = sstart[src++];
                    return dstart;
                }
                copymask = 1;
                copymap = dst;
                dstart[dst++] = 0;
            }
            if (src > slen - MATCH_MAX) {
                dstart[dst++] = sstart[src++];
                continue;
            }
            hp = ((sstart[src] + 13) ^
                    (sstart[src + 1] - 13) ^
                    sstart[src + 2]) &
                (LEMPEL_SIZE - 1);
            offset = (src - lempel[hp]) & OFFSET_MASK;
            lempel[hp] = src;
            cpy = src - offset;
            if (cpy >= 0 && cpy != src &&
                sstart[src] == sstart[cpy] &&
                sstart[src + 1] == sstart[cpy + 1] &&
                sstart[src + 2] == sstart[cpy + 2]) {
                dstart[copymap] |= copymask;
                for (mlen = MATCH_MIN; mlen < MATCH_MAX; mlen++)
                    if (sstart[src + mlen] != sstart[cpy + mlen])
                        break;
                dstart[dst++] = ((mlen - MATCH_MIN) << (NBBY - MATCH_BITS)) |
                    (offset >> NBBY);
                dstart[dst++] = offset;
                src += mlen;
            } else {
                dstart[dst++] = sstart[src++];
            }
        }

        return Uint8Array.from(dstart);
    };

    /**
     * Decompress string or byte array using fast and efficient algorithm.
     *
     * Our implementation is based on
     * http://src.opensolaris.org/source/raw/onnv/onnv-gate/
     * usr/src/uts/common/os/compress.c
     * It is licensed under CDDL.
     *
     * Please note it depends on toByteArray utility function.
     *
     * @param {String|Array} input The string or byte array that you want to
     *                             compress.
     * @param {Boolean} _bytes Returns byte array if true otherwise string.
     * @return {String|Array} Decompressed string or byte array.
     */
    var decompress = function(input, _bytes) {
        var sstart, dstart = [], slen,
            src = 0, dst = 0,
            cpy, copymap,
            copymask = 1 << (NBBY - 1),
            mlen, offset,
            i, bytes, get;

        // Using byte array or not.
        if(typeof input.buffer != "undefined") {
            sstart = input;
            bytes = true;
        } else {
            sstart = toByteArray(input);
            bytes = false;
        }

        // Default output string result.
        if(typeof(_bytes) == 'undefined')
            bytes = false;
        else
            bytes = _bytes;

        slen = sstart.length;

        get = function() {
            if(bytes) {
                return Uint8Array.from(dstart);
            }
            else {
                // Decompressed string.
                for(i = 0; i < dst; i++)
                    dstart[i] = String.fromCharCode(dstart[i]);

                return dstart.join('')
            }
        };

        while (src < slen) {
            if ((copymask <<= 1) == (1 << NBBY)) {
                copymask = 1;
                copymap = sstart[src++];
            }
            if (copymap & copymask) {
                mlen = (sstart[src] >> (NBBY - MATCH_BITS)) + MATCH_MIN;
                offset = ((sstart[src] << NBBY) | sstart[src + 1]) & OFFSET_MASK;
                src += 2;
                if ((cpy = dst - offset) >= 0)
                    while (--mlen >= 0)
                        dstart[dst++] = dstart[cpy++];
                else
                    /*
                     * offset before start of destination buffer
                     * indicates corrupt source data
                     */
                    return get();
            } else {
                dstart[dst++] = sstart[src++];
            }
        }

        return get();
    };

    return {
        pack: compress,
        unpack: decompress
    }
})();

// LZ4 THANKS TO: https://github.com/Benzinga/lz4js
UraniumJS.LZ4 = (function () {

    var util = {};
    // Simple hash function, from: http://burtleburtle.net/bob/hash/integer.html.
    // Chosen because it doesn't use multiply and achieves full avalanche.
    util.hashU32 = function hashU32(a) {
        a = a | 0;
        a = a + 2127912214 + (a << 12) | 0;
        a = a ^ -949894596 ^ a >>> 19;
        a = a + 374761393 + (a << 5) | 0;
        a = a + -744332180 ^ a << 9;
        a = a + -42973499 + (a << 3) | 0;
        return a ^ -1252372727 ^ a >>> 16 | 0;
    }
    // Reads a 64-bit little-endian integer from an array.
    util.readU64 = function readU64(b, n) {
        n = (n|0)>>>0;
        var x = 0;
        x |= b[n|0] << 0;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 8;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 16;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 24;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 32;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 40;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 48;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 56;
        n = (n+1|0)>>>0;
        return x;
    }
    // Reads a 32-bit little-endian integer from an array.
    util.readU32 = function readU32(b, n) {
        n = (n|0)>>>0;
        var x = 0;
        x |= b[n|0] << 0;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 8;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 16;
        n = (n+1|0)>>>0;
        x |= b[n|0] << 24;
        n = (n+1|0)>>>0;
        return x;
    }
    // Writes a 32-bit little-endian integer from an array.
    util.writeU32 = function writeU32(b, n, x) {
        n = (n|0)>>>0;
        b[n|0] = (x >> 0) & 0xff;
        n = (n+1|0)>>>0;
        b[n|0] = (x >> 8) & 0xff;
        n = (n+1|0)>>>0;
        b[n|0] = (x >> 16) & 0xff;
        n = (n+1|0)>>>0;
        b[n|0] = (x >> 24) & 0xff;
        n = (n+1|0)>>>0;
    }
    // Multiplies two numbers using 32-bit integer multiplication.
    // Algorithm from Emscripten.
    util.imul = function imul(a, b) {
        var ah = a >>> 16;
        var al = a & 65535;
        var bh = b >>> 16;
        var bl = b & 65535;

        return al * bl + (ah * bl + al * bh << 16) | 0;
    };

    var xxhash = (function (){

        // xxhash32 primes
        var prime1 = 0x9e3779b1;
        var prime2 = 0x85ebca77;
        var prime3 = 0xc2b2ae3d;
        var prime4 = 0x27d4eb2f;
        var prime5 = 0x165667b1;

        // Utility functions/primitives
        function rotl32 (x, r) {
            x = x | 0;
            r = r | 0;

            return x >>> (32 - r | 0) | x << r | 0;
        }

        function rotmul32 (h, r, m) {
            h = h | 0;
            r = r | 0;
            m = m | 0;

            return util.imul((h >>> (32 - r | 0) | h << r), m) | 0;
        }

        function shiftxor32 (h, s) {
            h = h | 0;
            s = s | 0;

            return h >>> s ^ h | 0;
        }

        // Implementation
        function xxhapply (h, src, m0, s, m1) {
            return rotmul32(util.imul(src, m0) + h, s, m1);
        }

        function xxh1 (h, src, index) {
            return rotmul32((h + util.imul(src[index], prime5)), 11, prime1);
        }

        function xxh4 (h, src, index) {
            return xxhapply(h, util.readU32(src, index), prime3, 17, prime4);
        }

        function xxh16 (h, src, index) {
            return Uint32Array.of(
                xxhapply(h[0], util.readU32(src, index + 0), prime2, 13, prime1),
                xxhapply(h[1], util.readU32(src, index + 4), prime2, 13, prime1),
                xxhapply(h[2], util.readU32(src, index + 8), prime2, 13, prime1),
                xxhapply(h[3], util.readU32(src, index + 12), prime2, 13, prime1)
            );
        }

        function xxh32 (seed, src, index, len) {

            seed = seed | 0;
            index = (index | 0) >>> 0;
            len = len | 0;

            var h, l = len | 0;
            if ((len|0) >= 16) {
                h = Uint32Array.of(
                    seed + prime1 + prime2 | 0,
                    seed + prime2 | 0,
                    seed | 0,
                    seed - prime1 | 0
                );

                while ((len|0) >= 16) {
                    h = xxh16(h, src, index);

                    index = (index+16|0) >>> 0;
                    len = len-16|0;
                }

                h = rotl32(h[0], 1) + rotl32(h[1], 7) + rotl32(h[2], 12) + rotl32(h[3], 18) + l | 0;
            } else {
                h = (seed + prime5 + len | 0) >>> 0;
            }

            while ((len|0) >= 4) {
                h = xxh4(h, src, index);

                index = (index+4 | 0) >>> 0;
                len = len-4 | 0;
            }

            while ((len|0) > 0) {
                h = xxh1(h, src, index);

                index = (index+1|0) >>> 0;
                len = len-1|0;
            }

            h = shiftxor32(util.imul(shiftxor32(util.imul(shiftxor32(h, 15), prime2), 13), prime3), 16);

            return h >>> 0;
        }

        return {hash: xxh32};
    })();

    var exports = {hash: xxhash.hash};
    // Constants
    // --

    // Compression format parameters/constants.
    var minMatch = 4;
    var minLength = 13;
    var searchLimit = 5;
    var skipTrigger = 6;
    var hashSize = 1 << 16;

    // Token constants.
    var mlBits = 4;
    var mlMask = (1 << mlBits) - 1;
    var runBits = 4;
    var runMask = (1 << runBits) - 1;

    // Shared buffers
    var blockBuf = makeBuffer(5 << 20);
    var hashTable = makeHashTable();

    // Frame constants.
    var magicNum = 0x184D2204;

    // Frame descriptor flags.
    var fdContentChksum = 0x4;
    var fdContentSize = 0x8;
    var fdBlockChksum = 0x10;
    // var fdBlockIndep = 0x20;
    var fdVersion = 0x40;
    var fdVersionMask = 0xC0;

    // Block sizes.
    var bsUncompressed = 0x80000000;
    var bsDefault = 7;
    var bsShift = 4;
    var bsMask = 7;
    var bsMap = {
        4: 0x10000,
        5: 0x40000,
        6: 0x100000,
        7: 0x400000
    };

    // Utility functions/primitives
    // --

    function max_uint(a, b) {
        a = (a | 0) & 0xFFFFFFFF;
        b = (b | 0) & 0xFFFFFFFF;
        return a > b ? b : a;
    }
    function min_uint(a, b) {
        a = (a | 0) & 0xFFFFFFFF;
        b = (b | 0) & 0xFFFFFFFF;
        return a > b ? a : b;
    }
    // Makes our hashtable. On older browsers, may return a plain array.
    function makeHashTable () {
        try {
            return new Uint32Array(hashSize|0);
        } catch (error) {
            return new Array(hashSize|0).fill(0);
        }
    }

    // Clear hashtable.
    function clearHashTable (table) {
        try {
            return new Uint32Array(hashSize);
        } catch (error) {
            var hashTable = new Array(hashSize);

            for (var i = 0; i < hashSize; i++) {
                hashTable[i] = 0;
            }

            return hashTable;
        }
    }

    // Makes a byte buffer. On older browsers, may return a plain array.
    function makeBuffer (size) {

        size = size | 0;

        try {
            return new Uint8Array(size|0);
        } catch (error) {
            var buf = new Array(size|0);
            for (var i = 0; (i|0) < (size|0); i=(i+1|0)>>>0) {
                buf[i|0] = 0;
            }
            return buf;
        }
    }

    function sliceArray (array, start, end) {

        start = start | 0;
        end = end | 0;

        if (typeof array.buffer !== undefined) {
            if (Uint8Array.prototype.slice) {
                return array.slice(start|0, end|0);
            } else {
                // Uint8Array#slice polyfill.
                var len = array.length;

                // Calculate start.
                start = start | 0;
                start = (start < 0) ? max_uint(len + start, 0) : min_uint(start, len);

                // Calculate end.
                end = (end === undefined) ? len : end | 0;
                end = (end < 0) ? max_uint(len + end, 0) : min_uint(end, len) | 0;

                // Copy into new array.
                var arraySlice = new Uint8Array(end - start | 0);
                for (var i = start | 0, n = 0; (i|0) < (end|0);) {
                    arraySlice[n|0] = array[i|0];
                    n = (n+1|0)>>>0;
                    i = (i+1|0)>>>0;
                }

                return arraySlice;
            }
        } else {
            // Assume normal array.
            return array.slice(start, end);
        }
    }

    // Implementation
    // --

    // Calculates an upper bound for lz4 compression.
    exports._compressBound = function compressBound (n) {
        return (n + (n / 255) + 16) | 0;
    };

    // Calculates an upper bound for lz4 decompression, by reading the data.
    exports._decompressBound = function decompressBound (src) {
        var sIndex = 0;

        // Read magic number
        if (util.readU32(src, sIndex) !== magicNum) {
            throw new Error('invalid magic number');
        }

        sIndex = (sIndex+4|0)>>>0;

        // Read descriptor
        var descriptor = src[sIndex|0] | 0;
        sIndex = (sIndex+1|0)>>>0;

        // Check version
        if ((descriptor & fdVersionMask | 0) != (fdVersion | 0)) {
            throw new Error('incompatible descriptor version ' + (descriptor & fdVersionMask));
        }

        // Read flags
        var useBlockSum = (descriptor & fdBlockChksum | 0) != 0;
        var useContentSize = (descriptor & fdContentSize | 0) != 0;

        // Read block size
        var bsIdx = (src[sIndex|0] >> bsShift) & bsMask;
        sIndex = (sIndex+1|0)>>>0;

        if (bsMap[bsIdx] === undefined) {
            throw new Error('invalid block size ' + bsIdx);
        }

        var maxBlockSize = bsMap[bsIdx];

        // Get content size
        if (useContentSize) {
            return util.readU64(src, sIndex|0);
        }

        // Checksum
        sIndex = (sIndex+1|0)>>>0;

        // Read blocks.
        var maxSize = 0;
        while (true) {
            var blockSize = util.readU32(src, sIndex|0);
            sIndex = (sIndex+4|0)>>>0;

            if (blockSize & bsUncompressed) {
                blockSize &= ~bsUncompressed;
                maxSize = maxSize+blockSize|0;
            } else if ((blockSize|0) > 0) {
                maxSize = maxSize+maxBlockSize|0;
            }

            if ((blockSize|0) == 0) {
                return maxSize|0;
            }

            if (useBlockSum) {
                sIndex = (sIndex+4|0)>>>0;
            }

            sIndex = (sIndex+blockSize|0)>>>0;
        }
    };

    // Creates a buffer of a given byte-size, falling back to plain arrays.
    exports.makeBuffer = makeBuffer;

    // Decompresses a block of Lz4.
    exports._decompressBlock = function decompressBlock (src, dst, sIndex, sLength, dIndex) {

        sIndex = sIndex | 0;
        sLength = sLength | 0;
        dIndex = dIndex | 0;

        var mLength, mOffset, sEnd, n, i;
        var hasCopyWithin = dst.copyWithin !== undefined && dst.fill !== undefined;

        // Setup initial state.
        sEnd = sIndex + sLength | 0;

        // Consume entire input block.
        while ((sIndex|0) < (sEnd|0)) {
            var token = src[sIndex|0]|0;
            sIndex = sIndex + 1 | 0;

            // Copy literals.
            var literalCount = token >> 4;
            if ((literalCount|0) > 0) {
                // Parse length.
                if ((literalCount|0) == 0xf) {
                    while (true) {
                        literalCount = literalCount+src[sIndex|0]|0;
                        if ((src[sIndex|0]|0) != 0xff) {
                            sIndex = sIndex + 1 | 0;
                            break;
                        }
                    }
                }

                // Copy literals
                for (n = sIndex + literalCount | 0; (sIndex|0) < (n|0);) {
                    dst[dIndex|0] = (src[sIndex|0] | 0) >>> 0;
                    dIndex = dIndex + 1 | 0;
                    sIndex = sIndex + 1 | 0;
                }
            }

            if ((sIndex|0) >= (sEnd|0)) {
                break;
            }

            // Copy match.
            mLength = token & 0xf;

            // Parse offset.
            mOffset = src[sIndex|0] | (src[sIndex+1|0] << 8);
            sIndex = (sIndex+2|0)>>>0
            // Parse length.
            if ((mLength|0) == 0xf) {
                while (true) {
                    mLength = mLength+src[sIndex|0]|0;
                    if ((src[sIndex|0]|0) != 0xff) {
                        sIndex = (sIndex+1|0)>>>0
                        break;
                    }
                    sIndex = (sIndex+1|0)>>>0
                }
            }

            mLength = mLength+minMatch|0;

            // Copy match
            // prefer to use typedarray.copyWithin for larger matches
            // NOTE: copyWithin doesn't work as required by LZ4 for overlapping sequences
            // e.g. mOffset=1, mLength=30 (repeach char 30 times)
            // we special case the repeat char w/ array.fill
            if (hasCopyWithin && (mOffset|0) == 1) {
                dst.fill(dst[dIndex - 1 | 0] | 0, dIndex | 0, dIndex + mLength | 0);
                dIndex = dIndex+mLength | 0;
            } else if (hasCopyWithin && (mOffset|0) > (mLength|0) && (mLength|0) > 31) {
                dst.copyWithin(dIndex | 0, dIndex - mOffset | 0, dIndex - mOffset + mLength | 0);
                dIndex = dIndex+mLength | 0;
            } else {
                for (i = dIndex - mOffset | 0, n = i + mLength | 0; (i|0) < (n|0);) {
                    dst[dIndex| 0] = (dst[i| 0] | 0) >>> 0;
                    dIndex = (dIndex+1|0)>>>0
                    i = (i+1|0)>>>0
                }
            }
        }

        return (dIndex | 0) >>> 0;
    };

    // Compresses a block with Lz4.
    exports._compressBlock = function compressBlock (src, dst, sIndex, sLength, hashTable) {
        var mIndex, mAnchor, mLength, mOffset, mStep;
        var literalCount, dIndex, sEnd, n;

        // Setup initial state.
        dIndex = 0;
        sEnd = sLength + sIndex;
        mAnchor = sIndex;

        // Process only if block is large enough.
        if (sLength >= minLength) {
            var searchMatchCount = (1 << skipTrigger) + 3;

            // Consume until last n literals (Lz4 spec limitation.)
            while (sIndex + minMatch < sEnd - searchLimit) {
                var seq = util.readU32(src, sIndex);
                var hash = util.hashU32(seq) >>> 0;

                // Crush hash to 16 bits.
                hash = ((hash >> 16) ^ hash) >>> 0 & 0xffff;

                // Look for a match in the hashtable. NOTE: remove one; see below.
                mIndex = hashTable[hash] - 1;

                // Put pos in hash table. NOTE: add one so that zero = invalid.
                hashTable[hash] = sIndex + 1;

                // Determine if there is a match (within range.)
                if (mIndex < 0 || ((sIndex - mIndex) >>> 16) > 0 || util.readU32(src, mIndex) !== seq) {
                    mStep = searchMatchCount++ >> skipTrigger;
                    sIndex += mStep;
                    continue;
                }

                searchMatchCount = (1 << skipTrigger) + 3;

                // Calculate literal count and offset.
                literalCount = sIndex - mAnchor;
                mOffset = sIndex - mIndex;

                // We've already matched one word, so get that out of the way.
                sIndex += minMatch;
                mIndex += minMatch;

                // Determine match length.
                // N.B.: mLength does not include minMatch, Lz4 adds it back
                // in decoding.
                mLength = sIndex;
                while (sIndex < sEnd - searchLimit && src[sIndex] === src[mIndex]) {
                    sIndex++;
                    mIndex++;
                }
                mLength = sIndex - mLength;

                // Write token + literal count.
                var token = mLength < mlMask ? mLength : mlMask;
                if (literalCount >= runMask) {
                    dst[dIndex++] = (runMask << mlBits) + token;
                    for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
                        dst[dIndex++] = 0xff;
                    }
                    dst[dIndex++] = n;
                } else {
                    dst[dIndex++] = (literalCount << mlBits) + token;
                }

                // Write literals.
                for (var i = 0; (i|0) < (literalCount|0); i=i+1|0) {
                    dst[dIndex++] = src[mAnchor + i];
                }

                // Write offset.
                dst[dIndex++] = mOffset;
                dst[dIndex++] = (mOffset >> 8);

                // Write match length.
                if (mLength >= mlMask) {
                    for (n = mLength - mlMask; n >= 0xff; n -= 0xff) {
                        dst[dIndex++] = 0xff;
                    }
                    dst[dIndex++] = n;
                }

                // Move the anchor.
                mAnchor = sIndex;
            }
        }

        // Nothing was encoded.
        if ((mAnchor|0) == 0) {
            return 0;
        }

        // Write remaining literals.
        // Write literal token+count.
        literalCount = sEnd - mAnchor;
        if (literalCount >= runMask) {
            dst[dIndex++] = (runMask << mlBits);
            for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
                dst[dIndex++] = 0xff;
            }
            dst[dIndex++] = n;
        } else {
            dst[dIndex++] = (literalCount << mlBits);
        }

        // Write literals.
        sIndex = mAnchor;
        while (sIndex < sEnd) {
            dst[dIndex++] = src[sIndex++];
        }

        return dIndex;
    };

    // Decompresses a frame of Lz4 data.
    exports._decompressFrame = function decompressFrame (src, dst) {
        var useBlockSum, useContentSum, useContentSize, descriptor;
        var sIndex = 0;
        var dIndex = 0;

        // Read magic number
        if (util.readU32(src, sIndex) !== magicNum) {
            throw new Error('invalid magic number');
        }

        sIndex += 4;

        // Read descriptor
        descriptor = src[sIndex|0];
        sIndex = (sIndex+1|0)>>>0;
        // Check version
        if ((descriptor & fdVersionMask) !== fdVersion) {
            throw new Error('incompatible descriptor version');
        }

        // Read flags
        useBlockSum = (descriptor & fdBlockChksum) !== 0;
        useContentSum = (descriptor & fdContentChksum) !== 0;
        useContentSize = (descriptor & fdContentSize) !== 0;

        // Read block size
        var bsIdx = (src[sIndex|0] >> bsShift) & bsMask;
        sIndex = (sIndex+1|0)>>>0;

        if (bsMap[bsIdx] === undefined) {
            throw new Error('invalid block size');
        }

        if (useContentSize) {
            // TODO: read content size
            sIndex += 8;
        }

        sIndex = (sIndex+1|0)>>>0;

        // Read blocks.
        while (true) {
            var compSize;

            compSize = util.readU32(src, sIndex|0);
            sIndex = (sIndex+4|0)>>>0;

            if (compSize === 0) {
                break;
            }

            if (useBlockSum) {
                // TODO: read block checksum
                sIndex = (sIndex+4|0)>>>0;
            }

            // Check if block is compressed
            if ((compSize & bsUncompressed) !== 0) {
                // Mask off the 'uncompressed' bit
                compSize &= ~bsUncompressed;

                // Copy uncompressed data into destination buffer.
                for (var j = 0; j < compSize; j=(j+1|0)>>>0) {
                    dst[dIndex|0] = src[sIndex|0];
                    dIndex = (dIndex+1|0)>>>0;
                    sIndex = (sIndex+1|0)>>>0;
                }
            } else {
                // Decompress into blockBuf
                dIndex = exports._decompressBlock(src, dst, sIndex|0, compSize|0, dIndex|0);
                sIndex = (sIndex+compSize|0)>>>0;
            }
        }

        if (useContentSum) {
            // TODO: read content checksum
            sIndex = (sIndex+4|0)>>>0;
        }

        return (dIndex|0)>>>0;
    };

    // Compresses data to an Lz4 frame.
    exports._compressFrame = function compressFrame (src, dst) {
        var dIndex = 0;

        // Write magic number.
        util.writeU32(dst, dIndex, magicNum);
        dIndex += 4;

        // Descriptor flags.
        dst[dIndex++] = fdVersion;
        dst[dIndex++] = bsDefault << bsShift;

        // Descriptor checksum.
        dst[dIndex] = xxhash.hash(0, dst, 4, dIndex - 4) >> 8;
        dIndex++;

        // Write blocks.
        var maxBlockSize = bsMap[bsDefault];
        var remaining = src.length;
        var sIndex = 0;

        // Clear the hashtable.
        clearHashTable(hashTable);

        // Split input into blocks and write.
        while ((remaining|0) > 0) {
            var compSize = 0;
            var blockSize = remaining > maxBlockSize ? maxBlockSize : remaining;

            compSize = exports._compressBlock(src, blockBuf, sIndex, blockSize, hashTable);

            if ((compSize|0) > (blockSize|0) || compSize === 0) {
                // Output uncompressed.
                util.writeU32(dst, dIndex, 0x80000000 | blockSize);
                dIndex += 4;

                for (var z = sIndex + blockSize | 0; (sIndex|0) < (z|0);) {
                    dst[dIndex++] = src[sIndex++]|0;
                }

                remaining -= blockSize|0;
            } else {
                // Output compressed.
                util.writeU32(dst, dIndex, compSize);
                dIndex += 4|0;

                for (var j = 0; (j|0) < (compSize|0);) {
                    dst[dIndex++] = blockBuf[j++]|0;
                }

                sIndex += blockSize|0;
                remaining -= blockSize|0;
            }
        }

        // Write blank end block.
        util.writeU32(dst, dIndex, 0);
        dIndex += 4;

        return dIndex;
    };

    // Decompresses a buffer containing an Lz4 frame. maxSize is optional; if not
    // provided, a maximum size will be determined by examining the data. The
    // buffer returned will always be perfectly-sized.
    exports.decompress = function decompress (src, maxSize) {
        var dst, size;

        if (maxSize === undefined) {
            maxSize = exports._decompressBound(src);
        }
        dst = exports.makeBuffer(maxSize);
        size = exports._decompressFrame(src, dst);

        if (size !== maxSize) {
            dst = sliceArray(dst, 0, size);
        }

        return Uint8Array.from(dst);
    };

    // Compresses a buffer to an Lz4 frame. maxSize is optional; if not provided,
    // a buffer will be created based on the theoretical worst output size for a
    // given input size. The buffer returned will always be perfectly-sized.
    exports.compress = function compress (src, maxSize) {
        var dst, size;

        if (maxSize === undefined) {
            maxSize = exports._compressBound(src.length);
        }

        dst = exports.makeBuffer(maxSize);
        size = exports._compressFrame(src, dst);

        if (size !== maxSize) {
            dst = sliceArray(dst, 0, size);
        }

        return Uint8Array.from(dst);
    };

    return exports;
})();

UraniumJS.config = {};
UraniumJS.config.TILD_CHAR_CODE = 126;
UraniumJS.config.BACKSLASH_CHAR = String.fromCharCode(92);
UraniumJS.config.SLASH_CHAR = String.fromCharCode(47);
UraniumJS.config.CHUNCK_LENGTH = 256;
UraniumJS.config.ENCODE_MAPPING = Uint8Array.of(
    33, 35, 36, 37, 38, 39, 40, 41, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
    54, 55, 56, 57, 58, 59, 60, 61, 62, 63,
    64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
    74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
    84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
    94, 95, 97, 98, 99, 100, 101, 102, 103, 104,
    105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
    115, 116, 117, 118, 119, 120, 121, 122, 123, 124,
    125, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0
);
UraniumJS.config.DECODE_MAPPING = Uint8Array.of(
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 0, 255, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45,
    46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
    56, 57, 58, 59, 60, 61, 255, 62, 63, 64,
    65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
    75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
    85, 86, 87, 88, 89, 90, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255
);


Object.defineProperty(UraniumJS.prototype, 'getCharCodeAt', {
    get: function() { return function(i){i = i|0; return this.storage_input_[i|0]; }}
});
Object.defineProperty(UraniumJS.prototype, 'getDecodedCharCodeAt', {
    get: function() { return function(i){i = i|0; return this.DECODE_MAPPING_[this.storage_input_[i|0]]; }}
});

Object.defineProperty(UraniumJS.prototype, 'decodeChar', {
    get: function() { return function(i){i = i|0; return this.DECODE_MAPPING_[i|0];}}
});
Object.defineProperty(UraniumJS.prototype, 'encodeChar', {
    get: function() { return function(i){i = i|0; return this.ENCODE_MAPPING_[i|0];}}
});

Object.defineProperty(UraniumJS.prototype, 'inputLength', {
    get: function() { return this.storage_input_length_|0; }
});

Object.defineProperty(UraniumJS.prototype, 'BACKSLASH_CHAR', {
    get: function() { return this.BACKSLASH_CHAR_; }
});
Object.defineProperty(UraniumJS.prototype, 'SLASH_CHAR', {
    get: function() { return this.SLASH_CHAR_; }
});
Object.defineProperty(UraniumJS.prototype, 'CHUNCK_LENGTH', {
    get: function() { return this.CHUNCK_LENGTH_; }
});
Object.defineProperty(UraniumJS.prototype, 'TILD_CHAR_CODE', {
    get: function() { return this.TILD_CHAR_CODE_; }
});

UraniumJS.utils = {};
UraniumJS.utils.hash = UraniumJS.LZ4.hash;
UraniumJS.utils.onlyCharPrintable = function (string) {
    // remove non-printable and other non-valid JSON chars
    return string.replace(/[\u0000-\u0019]+/g,"");
}
UraniumJS.utils.onlyCharParsable = function (string) {
    // This function is required because JSON is weird with some char
    string = string.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    return string;
}
UraniumJS.utils.parse = function (string) {return JSON.parse(UraniumJS.utils.onlyCharParsable(string));}
UraniumJS.utils.stringify = function (string) {return UraniumJS.utils.onlyCharPrintable(JSON.stringify(string));}
UraniumJS.utils.escape = function (string) {

    string = string.replaceAll(UraniumJS.config.BACKSLASH_CHAR, " ");
    string = string.replaceAll(UraniumJS.config.SLASH_CHAR, "~");
    string = string.replaceAll("$", "¡");
    return string.replaceAll("'", "§");
}
UraniumJS.utils.unescape = function (string) {

    string = string.replaceAll("§", "'");
    string = string.replaceAll("¡", "$");
    string = string.replaceAll("~", UraniumJS.config.SLASH_CHAR);
    return string.replaceAll(" ", UraniumJS.config.BACKSLASH_CHAR);
}

UraniumJS.prototype.encode = function(desired_output) {

    desired_output = ""+desired_output;

    var i = 0, j = 0;    // i for raw, j for encoded
    var size = (this.inputLength * 8 | 0) % 13 | 0;       // for the malloc
    var workspace = 0; // bits holding bin
    var wssize = 0;   // number of good bits in workspace
    var tmp = 0;
    var c = 0;

    if ((this.inputLength|0) == 0) {
        switch (desired_output.replaceAll("-", "").toUpperCase()) {
            case "UINT8ARRAY":
                return Uint8Array.of(this.TILD_CHAR_CODE);
            case "BASE64":
                return UraniumJS.BASE64.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
            default: // BASE92
                return UraniumJS.UTF8.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
        }
    }

    // precalculate how much space we need to malloc
    if ((size|0) == 0) {
        size = 2 * ((this.inputLength * 8) / 13 | 0) | 0;
    } else if ((size|0) < 7) {
        size = 2 * ((this.inputLength * 8) / 13 | 0) + 1 | 0;
    } else {
        size = 2 * ((this.inputLength * 8) / 13 | 0) + 2 | 0;
    }

    // do the malloc
    var results = new Uint8Array(size|0);
    for (; (i|0) < (this.inputLength|0); i = (i+1|0)>>>0) {

        workspace = workspace << 8 | this.getCharCodeAt(i|0);
        wssize = wssize+8|0;

        if ((wssize|0) >= 13) {

            tmp = (workspace >> (wssize - 13 | 0)) & 8191;
            c = this.encodeChar(tmp / 91 | 0) & 0xFF;
            if ((c|0) == 0) {
                // do something, illegal character
                return null;
            }

            results[j|0] = c & 0xFF;
            j = (j+1|0) >>> 0;
            c = this.encodeChar(tmp % 91 | 0) & 0xFF;

            if ((c|0) == 0) {

                // do something, illegal character;
                return null;
            }

            results[j|0] = c & 0xFF;
            j = (j+1|0) >>> 0;
            wssize = wssize - 13 | 0;
        }
    }
    // encode a last byte
    if (0 < (wssize|0) && (wssize|0) < 7) {

        tmp = (workspace << (6 - wssize | 0)) & 63;  // pad the right side
        c = this.encodeChar(tmp|0) & 0xFF;

        if ((c|0) == 0) {

            // do something, illegal character
            return null;
        }
        results[j|0] = c & 0xFF;

    } else if (7 <= (wssize|0)) {

        tmp = (workspace << (13 - wssize | 0)) & 8191; // pad the right side
        c = this.encodeChar(tmp / 91 | 0);

        if ((c|0) == 0) {

            // do something, illegal character
            return null;
        }

        results[j|0] = c & 0xFF;
        j = (j+1|0) >>> 0;
        c = this.encodeChar(tmp % 91 | 0) & 0xFF;
        if ((c|0) == 0) {

            // do something, illegal character
            return null;
        }
        results[j|0] = c & 0xFF;
    }

    switch (desired_output.replaceAll("-", "").toUpperCase()) {
        case "UINT8ARRAY":
            return results.slice(0, results.length|0);
        case "BASE64":
            return UraniumJS.BASE64.fromUint8Array(results.slice(0, results.length|0));
        default: // BASE92
            return UraniumJS.UTF8.fromUint8Array(results.slice(0, results.length|0));
    }
};


UraniumJS.prototype.decode = function(desired_output) {

    desired_output = ""+desired_output;
    var i = 0, j = 0, b1 = 0, b2 = 0;
    var workspace = 0;
    var wssize = 0
    // calculate size
    var size = ((this.inputLength / 2 * 13) + (this.inputLength % 2 * 6)) / 8 | 0;
    var res = new Uint8Array(size);

    // handle small cases first
    if ((this.getCharCodeAt(0) - this.TILD_CHAR_CODE | 0) == 0 || (this.inputLength|0) == 0){
        switch (desired_output.replaceAll("-", "").toUpperCase()) {
            case "UTF8": // BASE92
                return UraniumJS.UTF8.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
            case "BASE64":
                return UraniumJS.BASE64.fromUint8Array(Uint8Array.of(this.TILD_CHAR_CODE));
            default:
                return Uint8Array.of(this.TILD_CHAR_CODE);
        }
    }

    // this case does not fit the specs
    if ((this.inputLength|0) < 2) {
        switch (desired_output.replaceAll("-", "").toUpperCase()) {
            case "UTF8": // BASE92
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
    for (i = 0; (i + 1 | 0) < (this.inputLength|0); i = (i+2|0)>>>0) {
        b1 = this.getDecodedCharCodeAt(i | 0);
        b2 = this.getDecodedCharCodeAt(i + 1 | 0);
        workspace = (workspace << 13) | (b1 * 91 + b2 | 0);
        wssize = wssize + 13 | 0;
        while ((wssize|0) >= 8)
        {
            res[j|0] = (workspace >> (wssize - 8)) & 0xFF;
            j = j+1|0;
            wssize = wssize - 8 | 0;
        }
    }
    // handle single char
    if ((this.inputLength % 2 | 0) == 1)  {
        workspace = (workspace << 6) | this.getDecodedCharCodeAt(this.inputLength - 1 | 0);
        wssize = wssize+6|0;
        while ((wssize|0) >= 8)
        {
            res[j|0] = (workspace >> (wssize - 8)) & 0xFF;
            j = j+1|0;
            wssize = wssize - 8 | 0;
        }
    }

    switch (desired_output.replaceAll("-", "").toUpperCase()) {
        case "UTF8":
            return UraniumJS.UTF8.fromUint8Array(res.slice(0, res.length|0));
        case "BASE64":
            return UraniumJS.BASE64.fromUint8Array(res.slice(0, res.length|0));
        default:  // UINT8ARRAY
            return res.slice(0, res.length|0);
    }
};

var BASE64 = function(){
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
    get: function() { return this.CHUNCK_LENGTH_ | 0; }
});
Object.defineProperty(BASE64.prototype, 'BASE64ABCCC_E', {
    get: function() {
        return function (i){
            return this.BASE64ABCCC_[i|0] & 0xFF;
        };
    }
});
Object.defineProperty(BASE64.prototype, 'B64C_E', {
    get: function() {
        return function (i){
            return this.B64C_[i|0] & 0xFF;
        };
    }
});
Object.defineProperty(BASE64.prototype, 'B64EC', {
    get: function() { return this.B64EC_ | 0; }
});
Object.defineProperty(BASE64.prototype, 'B64CL', {
    get: function() { return this.B64CL_ | 0; }
});


BASE64.config = {};
BASE64.config.BASE64ABCCC = Uint8Array.of(65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47);
BASE64.config.CHUNCK_LENGTH = 256;
BASE64.config.B64EC = 255;
BASE64.config.B64C = Uint8Array.of(255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51);
BASE64.config.B64CL = 123;

BASE64.prototype.fromUint8Array = function (bytes) {
    "use strict";
    var i = 2, j = 0;
    var l = bytes.length | 0;

    var k = l % 3 | 0;
    var n = Math.floor(l / 3) * 4 + (k && k + 1) | 0;
    var N = Math.ceil(l / 3) * 4 | 0;
    var result = new Uint8Array(N|0);

    for (i = 2, j = 0; (i|0) < (l|0); i = (i+3|0)>>>0, j = (j+4|0)>>>0) {
        result.set(Uint8Array.of(
            this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF,
            this.BASE64ABCCC_E(((bytes[i - 2 | 0] & 0x03) << 4) | (bytes[i - 1 | 0] >> 4)) & 0xFF,
            this.BASE64ABCCC_E(((bytes[i - 1 | 0] & 0x0F) << 2) | (bytes[i] >> 6)) & 0xFF,
            this.BASE64ABCCC_E(bytes[i|0] & 0x3F) & 0xFF
        ), j|0);
    }
    if ((i|0) == (l + 1 | 0)) { // 1 octet yet to write
        result[j|0] = this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF;
        result[j+1|0] = this.BASE64ABCCC_E((bytes[i - 2 | 0] & 0x03) << 4) & 0xFF;
        result[j+2|0] = "=".charCodeAt(0) & 0xFF;
        result[j+3|0] = "=".charCodeAt(0) & 0xFF;
        j = (j+4|0)>>>0;
    }
    if ((i|0) == (l|0)) {
        result[j|0] = this.BASE64ABCCC_E(bytes[i - 2 | 0] >> 2) & 0xFF;
        result[j+1|0] = this.BASE64ABCCC_E(((bytes[i - 2 | 0] & 0x03) << 4) | (bytes[i - 1 | 0] >> 4)) & 0xFF;
        result[j+2|0] = this.BASE64ABCCC_E((bytes[i - 1 | 0] & 0x0F) << 2) & 0xFF;
        result[j+3|0] = "=".charCodeAt(0) & 0xFF;
    }

    var s = "";
    var rl = result.length|0;
    for(i = 0; (i|0) < (rl|0); i = (i+this.CHUNCK_LENGTH|0)>>>0){
        s = s.concat(String.fromCharCode.apply(null, result.subarray(i|0, Math.min(i+this.CHUNCK_LENGTH|0, rl|0))));
    }

    return s;
}

BASE64.prototype._charCodeAt = function (s) {
    return s.charCodeAt(0) & 0xFF;
}
BASE64.prototype._getBase64CodesBufferResults = function (buffer) {
    return Uint8Array.of( (buffer >> 16) & 0xFF, (buffer >> 8) & 0xFF, buffer & 0xFF)
}
BASE64.prototype._getBase64CodesBufferResultsBy4 = function (buffer_1, buffer_2, buffer_3, buffer_4 ) {
    return Uint8Array.of(
        (buffer_1 >> 16) & 0xFF, (buffer_1 >> 8) & 0xFF, buffer_1 & 0xFF,
        (buffer_2 >> 16) & 0xFF, (buffer_2 >> 8) & 0xFF, buffer_2 & 0xFF,
        (buffer_3 >> 16) & 0xFF, (buffer_3 >> 8) & 0xFF, buffer_3 & 0xFF,
        (buffer_4 >> 16) & 0xFF, (buffer_4 >> 8) & 0xFF, buffer_4 & 0xFF
    );
}
BASE64.prototype._getBase64Code = function (char_code) {

    char_code = (char_code | 0) & 0xFF;
    if (((char_code|0)>>>0) >= ((this.B64CL|0)>>>0)) {throw new Error("Unable to parse base64 string.");}
    var code = (this.B64C_E(char_code|0) | 0) >>> 0;
    if (((code|0)>>>0) == ((this.B64EC|0)>>>0)) {throw new Error("Unable to parse base64 string.");}
    return (code | 0) & 0xFF;
}
BASE64.prototype._getBase64CodesBuffer = function (str_char_codes) {
    return (this._getBase64Code(str_char_codes[0]) << 18 | this._getBase64Code(str_char_codes[1]) << 12 | this._getBase64Code(str_char_codes[2]) << 6 | this._getBase64Code(str_char_codes[3]) | 0) >>> 0;
}

BASE64.prototype.toUint8Array = function (str) {

    if ((str.length % 4 | 0) > 0) {
        throw new Error("Unable to parse base64 string.");
    }
    var index = str.indexOf("=") | 0;
    if ((index|0) > -1 && (index|0) < (str.length - 2 | 0)) {
        throw new Error("Unable to parse base64 string.");
    }

    var str_char_code = Uint8ClampedArray.from(str.split("").map(function(s){ return this._charCodeAt(s)}));
    var missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
        n = str.length | 0,
        result = new Uint8ClampedArray(3 * (n / 4) | 0);

    var str_char_code_splitted = new Uint8ClampedArray(16);
    var i = 0, j = 0;
    for (;(i+16|0) < (n|0); i = (i+16|0)>>>0, j = (j+12|0)>>>0) { // Single Operation Multiple Data (SIMD) up to 3x faster

        str_char_code_splitted.set(str_char_code.subarray(i|0, i+16|0));
        result.set(
            this._getBase64CodesBufferResultsBy4(
                this._getBase64CodesBuffer(str_char_code_splitted.subarray(0, 4)),
                this._getBase64CodesBuffer(str_char_code_splitted.subarray(4, 8)),
                this._getBase64CodesBuffer(str_char_code_splitted.subarray(8, 12)),
                this._getBase64CodesBuffer(str_char_code_splitted.subarray(12, 16))
            ), j|0);
    }

    for (;(i|0) < (n|0); i = (i+4|0)>>>0, j = (j+3|0)>>>0) { // Single Operation Single Data (normal)
        result.set(this._getBase64CodesBufferResults(this._getBase64CodesBuffer(str_char_code.subarray(i|0, i+4|0))), j|0);
    }

    return result.slice(0, result.length - missingOctets | 0);
}

UraniumJS.BASE64 = new BASE64();

UraniumJS.enrichString = function (it) {

    it = UraniumJS.utils.stringify(it);
    it = UraniumJS.LZJB.pack(it);
    it = UraniumJS.LZ4.compress(it);
    it = new UraniumJS(it).encode();
    it = UraniumJS.utils.escape(it);
    return it;
};
UraniumJS.stringDeplete = function (it) {

    it = UraniumJS.utils.unescape(it);
    it  = new UraniumJS(it).decode();
    it = UraniumJS.LZ4.decompress(it);
    it = UraniumJS.LZJB.unpack(it, false);
    it = UraniumJS.utils.parse(it);
    return it;
};

window.UraniumJS = UraniumJS;

export default UraniumJS;
