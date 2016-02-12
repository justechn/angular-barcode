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
