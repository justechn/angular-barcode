angular.module("barcodeGenerator").factory('BarcodeService', [function () {
    'use strict';

    var barcode = {};

    barcode.merge = function (m1, m2) {
        var newMerge = {};
        for (var k in m1) {
            newMerge[k] = m1[k];
        }
        for (var k in m2) {
            newMerge[k] = m2[k];
        }
        return newMerge;
    };
    return barcode;
}]);