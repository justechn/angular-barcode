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