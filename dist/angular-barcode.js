/**
 * angular barcode
 * @version v0.0.4 - 2016-02-11 * @link https://github.com/ryanmc2033/angular-barcode
 * @author Ryan McLaughlin <ryanmc@justechn.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
 angular.module('barcode', []).directive('barcode', [
    'BarcodeService',
    'Code39Service',
    'Code128BService',
    'Code128CService',
    'EanService',
    'Itf14NumberService',
    'ItfNumberService',
    'UpcService',
    function (barcodeService,
              code39Service,
              code128BService,
              code128CService,
              eanService,
              itf14NumberService,
              itfNumberService,
              upcService) {

        function link(scope, element, attrs) {
            var defaults = {
                width: 2,
                height: 100,
                quite: 10,
                displayValue: false,
                font: "monospace",
                textAlign: "center",
                fontSize: 12,
                backgroundColor: "",
                lineColor: "#000"
            };

            var options = [];
            //Merge the user options with the default
            options = barcodeService.merge(defaults, scope.options);

            var canvas = element.find('canvas')[0];

            if (attrs.render == "img") {
                canvas = document.createElement('canvas');
            }

            //Abort if the browser does not support HTML5canvas
            if (!canvas.getContext) {
                return null;
            }

            var encoder = '';
            switch (attrs.type) {
                case 'upc':
                    encoder = upcService;
                    break;
                case 'ean':
                    encoder = eanService;
                    break;
                case 'code39':
                    encoder = code39Service;
                    break;
                case 'code128b':
                    encoder = code128BService;
                    break;
                case 'code128c':
                    encoder = code128CService;
                    break;
                case 'itf':
                    encoder = itfNumberService;
                    break;
                case 'itf14':
                    encoder = itf14NumberService;
                    break;
            }

            if (encoder === '') {
                return;
            }

            //Encode the content
            var binary = encoder.encoded(attrs.string);

            if (!angular.isUndefined(binary)) {

                var _drawBarcodeText = function (text) {
                    var x, y;

                    y = options.height;

                    ctx.font = options.fontSize + "px " + options.font;
                    ctx.textBaseline = "bottom";
                    ctx.textBaseline = 'top';

                    if (options.textAlign == "left") {
                        x = options.quite;
                        ctx.textAlign = 'left';
                    }
                    else if (options.textAlign == "right") {
                        x = canvas.width - options.quite;
                        ctx.textAlign = 'right';
                    }
                    else { //All other center
                        x = canvas.width / 2;
                        ctx.textAlign = 'center';
                    }

                    ctx.fillText(text, x, y);
                };

                //Get the canvas context
                var ctx = canvas.getContext("2d");

                //Set the width and height of the barcode
                canvas.width = binary.length * options.width + 2 * options.quite;
                //Set extra height if the value is displayed under the barcode. Multiplication with 1.3 t0 ensure that some
                //characters are not cut in half
                canvas.height = options.height + (options.displayValue ? options.fontSize * 1.3 : 0);

                //Paint the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (options.backgroundColor) {
                    ctx.fillStyle = options.backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                //Creates the barcode out of the encoded binary
                ctx.fillStyle = options.lineColor;
                for (var i = 0; i < binary.length; i++) {
                    var x = i * options.width + options.quite;
                    if (binary[i] == "1") {
                        ctx.fillRect(x, 0, options.width, options.height);
                    }
                }

                if (options.displayValue) {
                    _drawBarcodeText(attrs.string);
                }

                if (attrs.render == "img") {
                    var uri = canvas.toDataURL('image/png');
                    var image = element.find('img')[0];
                    image.setAttribute("src", uri);
                }
            }
        }

        function watchStringAttr(scope, element, attrs) {
            attrs.$observe('string', function () {
                link(scope, element, attrs);
            });
        }

        function compile(element, attrs) {
            var template = "<canvas>";
            if (attrs.render == "img") {
                template = "<img>";
            }
            element.append(template);

            return {
                post: watchStringAttr
            };
        }

        return {
            restrict: 'E',
            scope: {
                options: '=options'
            },
            compile: compile
        };
    }
]);

angular.module("barcode").factory('BarcodeService', [
    function () {
        'use strict';

        var barcode = {};

        barcode.merge = function (m1, m2) {
            var newMerge = {};
            for (var j in m1) {
                newMerge[j] = m1[j];
            }
            for (var k in m2) {
                newMerge[k] = m2[k];
            }
            return newMerge;
        };
        return barcode;
    }
]);
angular.module("barcode").factory('Code128Service', [function () {
    'use strict';

    var barcode = {};

    //Data for each character, the last characters will not be encoded but are used for error correction
    var code128b = [
        [" ", "11011001100", 0],
        ["!", "11001101100", 1],
        ["\"", "11001100110", 2],
        ["#", "10010011000", 3],
        ["$", "10010001100", 4],
        ["%", "10001001100", 5],
        ["&", "10011001000", 6],
        ["'", "10011000100", 7],
        ["(", "10001100100", 8],
        [")", "11001001000", 9],
        ["*", "11001000100", 10],
        ["+", "11000100100", 11],
        [",", "10110011100", 12],
        ["-", "10011011100", 13],
        [".", "10011001110", 14],
        ["/", "10111001100", 15],
        ["0", "10011101100", 16],
        ["1", "10011100110", 17],
        ["2", "11001110010", 18],
        ["3", "11001011100", 19],
        ["4", "11001001110", 20],
        ["5", "11011100100", 21],
        ["6", "11001110100", 22],
        ["7", "11101101110", 23],
        ["8", "11101001100", 24],
        ["9", "11100101100", 25],
        [":", "11100100110", 26],
        [";", "11101100100", 27],
        ["<", "11100110100", 28],
        ["=", "11100110010", 29],
        [">", "11011011000", 30],
        ["?", "11011000110", 31],
        ["@", "11000110110", 32],
        ["A", "10100011000", 33],
        ["B", "10001011000", 34],
        ["C", "10001000110", 35],
        ["D", "10110001000", 36],
        ["E", "10001101000", 37],
        ["F", "10001100010", 38],
        ["G", "11010001000", 39],
        ["H", "11000101000", 40],
        ["I", "11000100010", 41],
        ["J", "10110111000", 42],
        ["K", "10110001110", 43],
        ["L", "10001101110", 44],
        ["M", "10111011000", 45],
        ["N", "10111000110", 46],
        ["O", "10001110110", 47],
        ["P", "11101110110", 48],
        ["Q", "11010001110", 49],
        ["R", "11000101110", 50],
        ["S", "11011101000", 51],
        ["T", "11011100010", 52],
        ["U", "11011101110", 53],
        ["V", "11101011000", 54],
        ["W", "11101000110", 55],
        ["X", "11100010110", 56],
        ["Y", "11101101000", 57],
        ["Z", "11101100010", 58],
        ["[", "11100011010", 59],
        ["\\", "11101111010", 60],
        ["]", "11001000010", 61],
        ["^", "11110001010", 62],
        ["_", "10100110000", 63],
        ["`", "10100001100", 64],
        ["a", "10010110000", 65],
        ["b", "10010000110", 66],
        ["c", "10000101100", 67],
        ["d", "10000100110", 68],
        ["e", "10110010000", 69],
        ["f", "10110000100", 70],
        ["g", "10011010000", 71],
        ["h", "10011000010", 72],
        ["i", "10000110100", 73],
        ["j", "10000110010", 74],
        ["k", "11000010010", 75],
        ["l", "11001010000", 76],
        ["m", "11110111010", 77],
        ["n", "11000010100", 78],
        ["o", "10001111010", 79],
        ["p", "10100111100", 80],
        ["q", "10010111100", 81],
        ["r", "10010011110", 82],
        ["s", "10111100100", 83],
        ["t", "10011110100", 84],
        ["u", "10011110010", 85],
        ["v", "11110100100", 86],
        ["w", "11110010100", 87],
        ["x", "11110010010", 88],
        ["y", "11011011110", 89],
        ["z", "11011110110", 90],
        ["{", "11110110110", 91],
        ["|", "10101111000", 92],
        ["}", "10100011110", 93],
        ["~", "10001011110", 94],
        [String.fromCharCode(127), "10111101000", 95],
        [String.fromCharCode(128), "10111100010", 96],
        [String.fromCharCode(129), "11110101000", 97],
        [String.fromCharCode(130), "11110100010", 98],
        [String.fromCharCode(131), "10111011110", 99],
        [String.fromCharCode(132), "10111101110", 100],
        [String.fromCharCode(133), "11101011110", 101],
        [String.fromCharCode(134), "11110101110", 102],
        //Start codes
        [String.fromCharCode(135), "11010000100", 103],
        [String.fromCharCode(136), "11010010000", 104],
        [String.fromCharCode(137), "11010011100", 105]];

    //The end bits
    var endBin = "1100011101011";

    //This regexp is used for validation
    var regexp = /^[!-~ ]+$/;

    //Use the regexp variable for validation
    barcode.valid = function (string) {
        if (string.search(regexp) == -1) {
            return false;
        }
        return true;
    };

    //The encoder function that return a complete binary string. Data need to be validated before sent to this function
    //This is general calculate function, which is called by code specific calculate functions
    barcode.calculateCode128 = function (string, encodeFn, startCode, checksumFn) {
        var result = "";

        //Add the start bits
        result += barcode.encodingById(startCode);

        //Add the encoded bits
        result += encodeFn(string);

        //Add the checksum
        result += barcode.encodingById(checksumFn(string, startCode));

        //Add the end bits
        result += endBin;

        return result;
    };

    //Get the encoded data by the id of the character
    barcode.encodingById = function (id) {
        for (var i = 0; i < code128b.length; i++) {
            if (code128b[i][2] == id) {
                return code128b[i][1];
            }
        }
        return "";
    };

    //Get the id (weight) of a character
    barcode.weightByCharacter = function (character) {
        for (var i = 0; i < code128b.length; i++) {
            if (code128b[i][0] == character) {
                return code128b[i][2];
            }
        }
        return 0;
    };

    //Get the encoded data of a character
    barcode.encodingByChar = function (character) {
        for (var i = 0; i < code128b.length; i++) {
            if (code128b[i][0] == character) {
                return code128b[i][1];
            }
        }
        return "";
    };

    return barcode;
}]);

angular.module("barcode").factory('Code128BService', ['Code128Service', function (Code128Service) {
    'use strict';

    var barcode = {};

    barcode.valid = function (string) {
        return Code128Service.valid(string);
    };

    //The public encoding function
    barcode.encoded = function (string) {
        if (barcode.valid(string)) {
            return Code128Service.calculateCode128(string, encodeB, 104, checksumB);
        }
        else {
            return "";
        }
    };

    //Encode the characters (128 B)
    function encodeB(string) {
        var result = "";
        for (var i = 0; i < string.length; i++) {
            result += Code128Service.encodingByChar(string[i]);
        }
        return result;
    }

    //Calculate the checksum (128 B)
    function checksumB(string, startCode) {
        var sum = 0;
        for (var i = 0; i < string.length; i++) {
            sum += Code128Service.weightByCharacter(string[i]) * (i + 1);
        }
        return (sum + startCode) % 103;
    }

    return barcode;
}]);

angular.module("barcode").factory('Code128CService', [
    'Code128Service',
    function (Code128Service) {
        'use strict';

        var barcode = {};

        barcode.valid = function (string) {
            return Code128Service.valid(string);
        };

        //The public encoding function
        barcode.encoded = function (string) {
            if (barcode.valid(string)) {
                string = string.replace(/ /g, "");
                return Code128Service.calculateCode128(string, encodeC, 105, checksumC);
            }
            else {
                return "";
            }
        };

        //Encode the characters (128 C)
        function encodeC(string) {
            var result = "";
            for (var i = 0; i < string.length; i += 2) {
                result += Code128Service.encodingById(parseInt(string.substr(i, 2)));
            }
            return result;
        }

        //Calculate the checksum (128 C)
        function checksumC(string, startCode) {
            var sum = 0;
            var w = 1;
            for (var i = 0; i < string.length; i += 2) {
                sum += parseInt(string.substr(i, 2)) * (w);
                w++;
            }
            return (sum + startCode) % 103;
        }

        return barcode;
    }
]);
angular.module("barcode").factory('Code39Service', [function () {
    'use strict';

    var barcode = {};

    var code39 = [
        [0, "0", "101000111011101"],
        [1, "1", "111010001010111"],
        [2, "2", "101110001010111"],
        [3, "3", "111011100010101"],
        [4, "4", "101000111010111"],
        [5, "5", "111010001110101"],
        [6, "6", "101110001110101"],
        [7, "7", "101000101110111"],
        [8, "8", "111010001011101"],
        [9, "9", "101110001011101"],
        [10, "A", "111010100010111"],
        [11, "B", "101110100010111"],
        [12, "C", "111011101000101"],
        [13, "D", "101011100010111"],
        [14, "E", "111010111000101"],
        [15, "F", "101110111000101"],
        [16, "G", "101010001110111"],
        [17, "H", "111010100011101"],
        [18, "I", "101110100011101"],
        [19, "J", "101011100011101"],
        [20, "K", "111010101000111"],
        [21, "L", "101110101000111"],
        [22, "M", "111011101010001"],
        [23, "N", "101011101000111"],
        [24, "O", "111010111010001"],
        [25, "P", "101110111010001"],
        [26, "Q", "101010111000111"],
        [27, "R", "111010101110001"],
        [28, "S", "101110101110001"],
        [29, "T", "101011101110001"],
        [30, "U", "111000101010111"],
        [31, "V", "100011101010111"],
        [32, "W", "111000111010101"],
        [33, "X", "100010111010111"],
        [34, "Y", "111000101110101"],
        [35, "Z", "100011101110101"],
        [36, "-", "100010101110111"],
        [37, ".", "111000101011101"],
        [38, " ", "100011101011101"],
        [39, "$", "100010001000101"],
        [40, "/", "100010001010001"],
        [41, "+", "100010100010001"],
        [42, "%", "101000100010001"]];

    barcode.valid = function (string) {
        return valid(string);
    };

    //The public encoding function
    barcode.encoded = function (string) {
        if (valid(string)) {
            return encode(string);
        }
        else {
            return "";
        }
    };

    //This regexp is used for validation
    var regexp = /^[0-9a-zA-Z\-\.\ \$\/\+\%]+$/;

    //Use the regexp variable for validation
    function valid(string) {
        if (string.search(regexp) == -1) {
            return false;
        }
        return true;
    }

    //Encode the characters
    function encode(string) {
        string = string.toUpperCase();

        var result = "";
        result += "1000101110111010";
        for (var i = 0; i < string.length; i++) {
            result += encodingByChar(string[i]) + "0";
        }
        result += "1000101110111010";
        return result;
    }

    //Get the encoded data of a character
    function encodingByChar(character) {
        for (var i = 0; i < code39.length; i++) {
            if (code39[i][1] == character) {
                return code39[i][2];
            }
        }
        return "";
    }

    return barcode;
}]);
angular.module("barcode").factory('EanService', [function () {
    'use strict';

    var barcode = {};

    barcode.valid = function (number) {
        return valid(number);
    };

    barcode.encoded = function (number) {
        if (valid(number)) {
            return createUPC(number);
        }
        return "";
    };

    //The L (left) type of encoding
    var Lbinary = {
        0: "0001101",
        1: "0011001",
        2: "0010011",
        3: "0111101",
        4: "0100011",
        5: "0110001",
        6: "0101111",
        7: "0111011",
        8: "0110111",
        9: "0001011"
    };

    //The G type of encoding
    var Gbinary = {
        0: "0100111",
        1: "0110011",
        2: "0011011",
        3: "0100001",
        4: "0011101",
        5: "0111001",
        6: "0000101",
        7: "0010001",
        8: "0001001",
        9: "0010111"
    };

    //The R (right) type of encoding
    var Rbinary = {
        0: "1110010",
        1: "1100110",
        2: "1101100",
        3: "1000010",
        4: "1011100",
        5: "1001110",
        6: "1010000",
        7: "1000100",
        8: "1001000",
        9: "1110100"
    };

    //The left side structure in EAN-13
    var EANstruct = {
        0: "LLLLLL",
        1: "LLGLGG",
        2: "LLGGLG",
        3: "LLGGGL",
        4: "LGLLGG",
        5: "LGGLLG",
        6: "LGGGLL",
        7: "LGLGLG",
        8: "LGLGGL",
        9: "LGGLGL"
    };

    //The start bits
    var startBin = "101";
    //The end bits
    var endBin = "101";
    //The middle bits
    var middleBin = "01010";

    //Regexp to test if the EAN code is correct formated
    var regexp = /^[0-9]{13}$/;

    //Create the binary representation of the EAN code
    //number needs to be a string
    function createUPC(number) {
        //Create the return variable
        var result = "";

        //Get the first digit (for later determination of the encoding type)
        var firstDigit = number[0];

        //Get the number to be encoded on the left side of the EAN code
        var leftSide = number.substr(1, 7);

        //Get the number to be encoded on the right side of the EAN code
        var rightSide = number.substr(7, 6);

        //Add the start bits
        result += startBin;

        //Add the left side
        result += encode(leftSide, EANstruct[firstDigit]);

        //Add the middle bits
        result += middleBin;

        //Add the right side
        result += encode(rightSide, "RRRRRR");

        //Add the end bits
        result += endBin;

        return result;
    }

    //Convert a numberarray to the representing
    function encode(number, struct) {
        //Create the variable that should be returned at the end of the function
        var result = "";

        //Loop all the numbers
        for (var i = 0; i < number.length; i++) {
            //Using the L, G or R encoding and add it to the returning variable
            if (struct[i] == "L") {
                result += Lbinary[number[i]];
            }
            else if (struct[i] == "G") {
                result += Gbinary[number[i]];
            }
            else if (struct[i] == "R") {
                result += Rbinary[number[i]];
            }
        }
        return result;
    }

    //Calulate the checksum digit
    function checksum(number) {
        var result = 0;

        for (var i = 0; i < 12; i += 2) {
            result += parseInt(number[i]);
        }
        for (var j = 1; j < 12; j += 2) {
            result += parseInt(number[j]) * 3;
        }

        return (10 - (result % 10)) % 10;
    }

    function valid(number) {
        if (number.search(regexp) == -1) {
            return false;
        }
        else {
            return number[12] == checksum(number);
        }
    }

    return barcode;
}]);
angular.module("barcode").factory('Itf14NumberService', [function () {
    'use strict';

    var barcode = {};

    barcode.valid = function (number) {
        return valid(number);
    };

    barcode.encoded = function (number) {
        if (valid(number)) {
            return encode(number);
        }
        return "";
    };

    //The structure for the all digits, 1 is wide and 0 is narrow
    var digitStructure = {
        "0": "00110",
        "1": "10001",
        "2": "01001",
        "3": "11000",
        "4": "00101",
        "5": "10100",
        "6": "01100",
        "7": "00011",
        "8": "10010",
        "9": "01010"
    };

    //The start bits
    var startBin = "1010";
    //The end bits
    var endBin = "11101";

    //Regexp for a valid ITF14 code
    var regexp = /^[0-9]{13,14}$/;

    //Convert a numberarray to the representing
    function encode(number) {
        //Create the variable that should be returned at the end of the function
        var result = "";

        //If checksum is not already calculated, do it
        if (number.length == 13) {
            number += checksum(number);
        }

        //Always add the same start bits
        result += startBin;

        //Calculate all the digit pairs
        for (var i = 0; i < 14; i += 2) {
            result += calculatePair(number.substr(i, 2));
        }

        //Always add the same end bits
        result += endBin;

        return result;
    }

    //Calculate the data of a number pair
    function calculatePair(twoNumbers) {
        var result = "";

        var number1Struct = digitStructure[twoNumbers[0]];
        var number2Struct = digitStructure[twoNumbers[1]];

        //Take every second bit and add to the result
        for (var i = 0; i < 5; i++) {
            result += (number1Struct[i] == "1") ? "111" : "1";
            result += (number2Struct[i] == "1") ? "000" : "0";
        }
        return result;
    }

    //Calulate the checksum digit
    function checksum(numberString) {
        var result = 0;

        for (var i = 0; i < 13; i++) {
            result += parseInt(numberString[i]) * (3 - (i % 2) * 2);
        }

        return 10 - (result % 10);
    }

    function valid(number) {
        if (number.search(regexp) == -1) {
            return false;
        }
        //Check checksum if it is already calculated
        else if (number.length == 14) {
            return number[13] == checksum(number);
        }
        return true;
    }

    return barcode;
}]);
angular.module("barcode").factory('ItfNumberService', [function () {
    'use strict';

    var barcode = {};

    barcode.valid = function (number) {
        return valid(number);
    };

    barcode.encoded = function (number) {
        if (valid(number)) {
            return encode(number);
        }
        return "";
    };

    //The structure for the all digits, 1 is wide and 0 is narrow
    var digitStructure = {
        "0": "00110",
        "1": "10001",
        "2": "01001",
        "3": "11000",
        "4": "00101",
        "5": "10100",
        "6": "01100",
        "7": "00011",
        "8": "10010",
        "9": "01010"
    };

    //The start bits
    var startBin = "1010";
    //The end bits
    var endBin = "11101";

    //Regexp for a valid Inter25 code
    var regexp = /^([0-9][0-9])+$/;

    //Convert a numberarray to the representing
    function encode(number) {
        //Create the variable that should be returned at the end of the function
        var result = "";

        //Always add the same start bits
        result += startBin;

        //Calculate all the digit pairs
        for (var i = 0; i < number.length; i += 2) {
            result += calculatePair(number.substr(i, 2));
        }

        //Always add the same end bits
        result += endBin;

        return result;
    }

    //Calculate the data of a number pair
    function calculatePair(twoNumbers) {
        var result = "";

        var number1Struct = digitStructure[twoNumbers[0]];
        var number2Struct = digitStructure[twoNumbers[1]];

        //Take every second bit and add to the result
        for (var i = 0; i < 5; i++) {
            result += (number1Struct[i] == "1") ? "111" : "1";
            result += (number2Struct[i] == "1") ? "000" : "0";
        }
        return result;
    }

    function valid(number) {
        return number.search(regexp) !== -1;
    }

    return barcode;
}]);

angular.module("barcode").factory('UpcService', [function () {
    'use strict';

    var barcode = {};

    barcode.valid = function (number) {
        return valid('0' + number);
    };

    barcode.encoded = function (number) {
        if (valid('0' + number)) {
            return createUPC('0' + number);
        }
        return "";
    };

    //The L (left) type of encoding
    var Lbinary = {
        0: "0001101",
        1: "0011001",
        2: "0010011",
        3: "0111101",
        4: "0100011",
        5: "0110001",
        6: "0101111",
        7: "0111011",
        8: "0110111",
        9: "0001011"
    };

    //The G type of encoding
    var Gbinary = {
        0: "0100111",
        1: "0110011",
        2: "0011011",
        3: "0100001",
        4: "0011101",
        5: "0111001",
        6: "0000101",
        7: "0010001",
        8: "0001001",
        9: "0010111"
    };

    //The R (right) type of encoding
    var Rbinary = {
        0: "1110010",
        1: "1100110",
        2: "1101100",
        3: "1000010",
        4: "1011100",
        5: "1001110",
        6: "1010000",
        7: "1000100",
        8: "1001000",
        9: "1110100"
    };

    //The left side structure in EAN-13
    var EANstruct = {
        0: "LLLLLL",
        1: "LLGLGG",
        2: "LLGGLG",
        3: "LLGGGL",
        4: "LGLLGG",
        5: "LGGLLG",
        6: "LGGGLL",
        7: "LGLGLG",
        8: "LGLGGL",
        9: "LGGLGL"
    };

    //The start bits
    var startBin = "101";
    //The end bits
    var endBin = "101";
    //The middle bits
    var middleBin = "01010";

    //Regexp to test if the EAN code is correct formated
    var regexp = /^[0-9]{13}$/;

    //Create the binary representation of the EAN code
    //number needs to be a string
    function createUPC(number) {
        //Create the return variable
        var result = "";

        //Get the first digit (for later determination of the encoding type)
        var firstDigit = number[0];

        //Get the number to be encoded on the left side of the EAN code
        var leftSide = number.substr(1, 7);

        //Get the number to be encoded on the right side of the EAN code
        var rightSide = number.substr(7, 6);

        //Add the start bits
        result += startBin;

        //Add the left side
        result += encode(leftSide, EANstruct[firstDigit]);

        //Add the middle bits
        result += middleBin;

        //Add the right side
        result += encode(rightSide, "RRRRRR");

        //Add the end bits
        result += endBin;

        return result;
    }

    //Convert a numberarray to the representing
    function encode(number, struct) {
        //Create the variable that should be returned at the end of the function
        var result = "";

        //Loop all the numbers
        for (var i = 0; i < number.length; i++) {
            //Using the L, G or R encoding and add it to the returning variable
            if (struct[i] == "L") {
                result += Lbinary[number[i]];
            }
            else if (struct[i] == "G") {
                result += Gbinary[number[i]];
            }
            else if (struct[i] == "R") {
                result += Rbinary[number[i]];
            }
        }
        return result;
    }

    //Calulate the checksum digit
    function checksum(number) {
        var result = 0;

        for (var i = 0; i < 12; i += 2) {
            result += parseInt(number[i]);
        }
        for (var j = 1; j < 12; j += 2) {
            result += parseInt(number[j]) * 3;
        }

        return (10 - (result % 10)) % 10;
    }

    function valid(number) {
        if (number.search(regexp) == -1) {
            return false;
        }
        else {
            return number[12] == checksum(number);
        }
    }

    return barcode;
}]);