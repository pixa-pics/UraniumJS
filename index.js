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

var UraniumJS = function(data){

    if (!(this instanceof UraniumJS)) {
        return new UraniumJS(data);
    }

    if(data instanceof Uint8Array || data instanceof Uint8ClampedArray) {

        this.storage_input_ =  data;
    }else if(typeof data == "string") {

        this.storage_input_ =  UraniumJS.UTF8.toByteArray(data);
    }else if("buffer" in data || data instanceof ArrayBuffer) {

        this.storage_input_ =  new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer);
    }else if(data instanceof Object){

        this.storage_input_ = Cbor(data).run();
    }

    this.storage_input_length_ = ( this.storage_input_.length | 0 ) >>> 0;

    this.TILD_CHAR_CODE_ = UraniumJS.config.TILD_CHAR_CODE;
    this.BACKSLASH_CHAR_ = UraniumJS.config.BACKSLASH_CHAR;
    this.SLASH_CHAR_ = UraniumJS.config.SLASH_CHAR;
    this.CHUNCK_LENGTH_ = UraniumJS.config.CHUNCK_LENGTH;
    this.ENCODE_MAPPING_ = UraniumJS.config.ENCODE_MAPPING;
    this.DECODE_MAPPING_ = UraniumJS.config.DECODE_MAPPING;

    return this;
};

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
        var x = 0;
        x |= b[n++] << 0;
        x |= b[n++] << 8;
        x |= b[n++] << 16;
        x |= b[n++] << 24;
        x |= b[n++] << 32;
        x |= b[n++] << 40;
        x |= b[n++] << 48;
        x |= b[n++] << 56;
        return x;
    }
    // Reads a 32-bit little-endian integer from an array.
    util.readU32 = function readU32(b, n) {
        var x = 0;
        x |= b[n++] << 0;
        x |= b[n++] << 8;
        x |= b[n++] << 16;
        x |= b[n++] << 24;
        return x;
    }
    // Writes a 32-bit little-endian integer from an array.
    util.writeU32 = function writeU32(b, n, x) {
        b[n++] = (x >> 0) & 0xff;
        b[n++] = (x >> 8) & 0xff;
        b[n++] = (x >> 16) & 0xff;
        b[n++] = (x >> 24) & 0xff;
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
            return [
                xxhapply(h[0], util.readU32(src, index + 0), prime2, 13, prime1),
                xxhapply(h[1], util.readU32(src, index + 4), prime2, 13, prime1),
                xxhapply(h[2], util.readU32(src, index + 8), prime2, 13, prime1),
                xxhapply(h[3], util.readU32(src, index + 12), prime2, 13, prime1)
            ];
        }

        function xxh32 (seed, src, index, len) {
            var h, l;
            l = len;
            if (len >= 16) {
                h = [
                    seed + prime1 + prime2,
                    seed + prime2,
                    seed,
                    seed - prime1
                ];

                while (len >= 16) {
                    h = xxh16(h, src, index);

                    index += 16;
                    len -= 16;
                }

                h = rotl32(h[0], 1) + rotl32(h[1], 7) + rotl32(h[2], 12) + rotl32(h[3], 18) + l;
            } else {
                h = (seed + prime5 + len) >>> 0;
            }

            while (len >= 4) {
                h = xxh4(h, src, index);

                index += 4;
                len -= 4;
            }

            while (len > 0) {
                h = xxh1(h, src, index);

                index++;
                len--;
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

    // Makes our hashtable. On older browsers, may return a plain array.
    function makeHashTable () {
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

    // Clear hashtable.
    function clearHashTable (table) {
        for (var i = 0; i < hashSize; i++) {
            hashTable[i] = 0;
        }
    }

    // Makes a byte buffer. On older browsers, may return a plain array.
    function makeBuffer (size) {
        try {
            return new Uint8Array(size);
        } catch (error) {
            var buf = new Array(size);

            for (var i = 0; i < size; i++) {
                buf[i] = 0;
            }

            return buf;
        }
    }

    function sliceArray (array, start, end) {
        if (typeof array.buffer !== undefined) {
            if (Uint8Array.prototype.slice) {
                return array.slice(start, end);
            } else {
                // Uint8Array#slice polyfill.
                var len = array.length;

                // Calculate start.
                start = start | 0;
                start = (start < 0) ? Math.max(len + start, 0) : Math.min(start, len);

                // Calculate end.
                end = (end === undefined) ? len : end | 0;
                end = (end < 0) ? Math.max(len + end, 0) : Math.min(end, len);

                // Copy into new array.
                var arraySlice = new Uint8Array(end - start);
                for (var i = start, n = 0; i < end;) {
                    arraySlice[n++] = array[i++];
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
    exports.compressBound = function compressBound (n) {
        return (n + (n / 255) + 16) | 0;
    };

    // Calculates an upper bound for lz4 decompression, by reading the data.
    exports.decompressBound = function decompressBound (src) {
        var sIndex = 0;

        // Read magic number
        if (util.readU32(src, sIndex) !== magicNum) {
            throw new Error('invalid magic number');
        }

        sIndex += 4;

        // Read descriptor
        var descriptor = src[sIndex++];

        // Check version
        if ((descriptor & fdVersionMask) !== fdVersion) {
            throw new Error('incompatible descriptor version ' + (descriptor & fdVersionMask));
        }

        // Read flags
        var useBlockSum = (descriptor & fdBlockChksum) !== 0;
        var useContentSize = (descriptor & fdContentSize) !== 0;

        // Read block size
        var bsIdx = (src[sIndex++] >> bsShift) & bsMask;

        if (bsMap[bsIdx] === undefined) {
            throw new Error('invalid block size ' + bsIdx);
        }

        var maxBlockSize = bsMap[bsIdx];

        // Get content size
        if (useContentSize) {
            return util.readU64(src, sIndex);
        }

        // Checksum
        sIndex++;

        // Read blocks.
        var maxSize = 0;
        while (true) {
            var blockSize = util.readU32(src, sIndex);
            sIndex += 4;

            if (blockSize & bsUncompressed) {
                blockSize &= ~bsUncompressed;
                maxSize += blockSize;
            } else if (blockSize > 0) {
                maxSize += maxBlockSize;
            }

            if (blockSize === 0) {
                return maxSize;
            }

            if (useBlockSum) {
                sIndex += 4;
            }

            sIndex += blockSize;
        }
    };

    // Creates a buffer of a given byte-size, falling back to plain arrays.
    exports.makeBuffer = makeBuffer;

    // Decompresses a block of Lz4.
    exports.decompressBlock = function decompressBlock (src, dst, sIndex, sLength, dIndex) {
        var mLength, mOffset, sEnd, n, i;
        var hasCopyWithin = dst.copyWithin !== undefined && dst.fill !== undefined;

        // Setup initial state.
        sEnd = sIndex + sLength;

        // Consume entire input block.
        while (sIndex < sEnd) {
            var token = src[sIndex++];

            // Copy literals.
            var literalCount = (token >> 4);
            if (literalCount > 0) {
                // Parse length.
                if (literalCount === 0xf) {
                    while (true) {
                        literalCount += src[sIndex];
                        if (src[sIndex++] !== 0xff) {
                            break;
                        }
                    }
                }

                // Copy literals
                for (n = sIndex + literalCount; sIndex < n;) {
                    dst[dIndex++] = src[sIndex++];
                }
            }

            if (sIndex >= sEnd) {
                break;
            }

            // Copy match.
            mLength = (token & 0xf);

            // Parse offset.
            mOffset = src[sIndex++] | (src[sIndex++] << 8);

            // Parse length.
            if (mLength === 0xf) {
                while (true) {
                    mLength += src[sIndex];
                    if (src[sIndex++] !== 0xff) {
                        break;
                    }
                }
            }

            mLength += minMatch;

            // Copy match
            // prefer to use typedarray.copyWithin for larger matches
            // NOTE: copyWithin doesn't work as required by LZ4 for overlapping sequences
            // e.g. mOffset=1, mLength=30 (repeach char 30 times)
            // we special case the repeat char w/ array.fill
            if (hasCopyWithin && mOffset === 1) {
                dst.fill(dst[dIndex - 1] | 0, dIndex, dIndex + mLength);
                dIndex += mLength;
            } else if (hasCopyWithin && mOffset > mLength && mLength > 31) {
                dst.copyWithin(dIndex, dIndex - mOffset, dIndex - mOffset + mLength);
                dIndex += mLength;
            } else {
                for (i = dIndex - mOffset, n = i + mLength; i < n;) {
                    dst[dIndex++] = dst[i++] | 0;
                }
            }
        }

        return dIndex;
    };

    // Compresses a block with Lz4.
    exports.compressBlock = function compressBlock (src, dst, sIndex, sLength, hashTable) {
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
                for (var i = 0; i < literalCount; i++) {
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
        if (mAnchor === 0) {
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
    exports.decompressFrame = function decompressFrame (src, dst) {
        var useBlockSum, useContentSum, useContentSize, descriptor;
        var sIndex = 0;
        var dIndex = 0;

        // Read magic number
        if (util.readU32(src, sIndex) !== magicNum) {
            throw new Error('invalid magic number');
        }

        sIndex += 4;

        // Read descriptor
        descriptor = src[sIndex++];

        // Check version
        if ((descriptor & fdVersionMask) !== fdVersion) {
            throw new Error('incompatible descriptor version');
        }

        // Read flags
        useBlockSum = (descriptor & fdBlockChksum) !== 0;
        useContentSum = (descriptor & fdContentChksum) !== 0;
        useContentSize = (descriptor & fdContentSize) !== 0;

        // Read block size
        var bsIdx = (src[sIndex++] >> bsShift) & bsMask;

        if (bsMap[bsIdx] === undefined) {
            throw new Error('invalid block size');
        }

        if (useContentSize) {
            // TODO: read content size
            sIndex += 8;
        }

        sIndex++;

        // Read blocks.
        while (true) {
            var compSize;

            compSize = util.readU32(src, sIndex);
            sIndex += 4;

            if (compSize === 0) {
                break;
            }

            if (useBlockSum) {
                // TODO: read block checksum
                sIndex += 4;
            }

            // Check if block is compressed
            if ((compSize & bsUncompressed) !== 0) {
                // Mask off the 'uncompressed' bit
                compSize &= ~bsUncompressed;

                // Copy uncompressed data into destination buffer.
                for (var j = 0; j < compSize; j++) {
                    dst[dIndex++] = src[sIndex++];
                }
            } else {
                // Decompress into blockBuf
                dIndex = exports.decompressBlock(src, dst, sIndex, compSize, dIndex);
                sIndex += compSize;
            }
        }

        if (useContentSum) {
            // TODO: read content checksum
            sIndex += 4;
        }

        return dIndex;
    };

    // Compresses data to an Lz4 frame.
    exports.compressFrame = function compressFrame (src, dst) {
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
        while (remaining > 0) {
            var compSize = 0;
            var blockSize = remaining > maxBlockSize ? maxBlockSize : remaining;

            compSize = exports.compressBlock(src, blockBuf, sIndex, blockSize, hashTable);

            if (compSize > blockSize || compSize === 0) {
                // Output uncompressed.
                util.writeU32(dst, dIndex, 0x80000000 | blockSize);
                dIndex += 4;

                for (var z = sIndex + blockSize; sIndex < z;) {
                    dst[dIndex++] = src[sIndex++];
                }

                remaining -= blockSize;
            } else {
                // Output compressed.
                util.writeU32(dst, dIndex, compSize);
                dIndex += 4;

                for (var j = 0; j < compSize;) {
                    dst[dIndex++] = blockBuf[j++];
                }

                sIndex += blockSize;
                remaining -= blockSize;
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
            maxSize = exports.decompressBound(src);
        }
        dst = exports.makeBuffer(maxSize);
        size = exports.decompressFrame(src, dst);

        if (size !== maxSize) {
            dst = sliceArray(dst, 0, size);
        }

        return dst;
    };

    // Compresses a buffer to an Lz4 frame. maxSize is optional; if not provided,
    // a buffer will be created based on the theoretical worst output size for a
    // given input size. The buffer returned will always be perfectly-sized.
    exports.compress = function compress (src, maxSize) {
        var dst, size;

        if (maxSize === undefined) {
            maxSize = exports.compressBound(src.length);
        }

        dst = exports.makeBuffer(maxSize);
        size = exports.compressFrame(src, dst);

        if (size !== maxSize) {
            dst = sliceArray(dst, 0, size);
        }

        return dst;
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

    desired_output = desired_output || "String";
    var string_output = Boolean(desired_output == "String");
    var i = 0, j = 0;    // i for raw, j for encoded
    var size = (this.inputLength * 8 | 0) % 13 | 0;       // for the malloc
    var workspace = 0; // bits holding bin
    var wssize = 0;   // number of good bits in workspace
    var tmp = 0;
    var c = 0;

    if ((this.inputLength|0) == 0) {
        return string_output ? "~": Uint8Array.of(this.TILD_CHAR_CODE);
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

    return string_output ? UraniumJS.UTF8.fromByteArray(results.subarray(0, results.length|0)) : results.slice(0, results.length|0);
};


UraniumJS.prototype.decode = function(desired_output) {

    desired_output = desired_output || "String";
    var string_output = Boolean(desired_output == "String");

    var i = 0, j = 0, b1 = 0, b2 = 0;
    var workspace = 0;
    var wssize = 0
    // calculate size
    var size = ((this.inputLength / 2 * 13) + (this.inputLength % 2 * 6)) / 8 | 0;
    var res = new Uint8Array(size);

    // handle small cases first
    if ((this.getCharCodeAt(0) - this.TILD_CHAR_CODE | 0) == 0 || (this.inputLength|0) == 0){
        return string_output ? "~": Uint8Array.of(this.TILD_CHAR_CODE);
    }

    // this case does not fit the specs
    if ((this.inputLength|0) < 2) {
        return string_output ? "": new Uint8Array(0);
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

    return string_output ? UraniumJS.UTF8.fromByteArray(res.subarray(0, res.length|0)): res.slice(0, res.length|0);
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
};

UTF8.prototype._BYTE_MASKS_CHAR_LENGTH = Uint8Array.of(0b0, 0b1111111, 0b11000000, 0b11100000, 0b11110000);
UTF8.prototype._BYTE_MASKS_CHAR_CODE = Uint32Array.of(0, 128, 2048, 65536, 2097152);

UTF8.prototype._getCharLength = function(byte) {

    if (this._BYTE_MASKS_CHAR_LENGTH[4] == (byte & this._BYTE_MASKS_CHAR_LENGTH[4])) {
        return 4;
    } else if (this._BYTE_MASKS_CHAR_LENGTH[3] == (byte & this._BYTE_MASKS_CHAR_LENGTH[3])) {
        return 3;
    } else if (this._BYTE_MASKS_CHAR_LENGTH[2] == (byte & this._BYTE_MASKS_CHAR_LENGTH[2])) {
        return 2;
    } else if (byte == (byte & this._BYTE_MASKS_CHAR_LENGTH[1])) {
        return 1;
    }else {
        return 0;
    }
};
UTF8.prototype._getBytesForCharCode = function (cc){

    if (cc < this._BYTE_MASKS_CHAR_CODE[1]) {
        return 1;
    } else if (cc < this._BYTE_MASKS_CHAR_CODE[2]) {
        return 2;
    } else if (cc < this._BYTE_MASKS_CHAR_CODE[3]) {
        return 3;
    } else if (cc < this._BYTE_MASKS_CHAR_CODE[4]) {
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

UTF8.prototype.toByteArray = function(string, bytes, byteOffset, byteLength, strict) {
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
UTF8.prototype.fromByteArray = function (bytes, byteOffset, byteLength, strict) {
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
        this.fromByteArray(bytes, byteOffset, byteLength, true);
    } catch (e) {
        return true;
    }
    return false;
}

UraniumJS.UTF8 = new UTF8();

UraniumJS.enrichString = function (it) {
    return UraniumJS.utils.escape(UraniumJS.UTF8.fromByteArray(new UraniumJS(UraniumJS.LZ4.compress(UraniumJS.UTF8.toByteArray(UraniumJS.utils.stringify(it)))).encode("ArrayBuffer")));
};
UraniumJS.stringDeplete = function (it) {
    return UraniumJS.utils.parse(UraniumJS.UTF8.fromByteArray(UraniumJS.LZ4.decompress(new UraniumJS(UraniumJS.utils.unescape(it)).decode("ArrayBuffer"))));
};

window.UraniumJS = UraniumJS;
export default UraniumJS;