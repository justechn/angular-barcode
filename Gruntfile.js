/**
 * this file could really use a good clean up
 */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({

        jshint: {
            all: {
                src: [ 'src/*.js' ],
                options: {
                    globals: [ 'require' ]
                }
            }
        },

        uglify: {
            prod: {
                files: {
                    'dist/barcode.min.js': [
                        'src/*.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('uglify', [ 'uglify' ]);

    grunt.registerTask('quality', [
        'jshint:all'
    ]);

    grunt.registerTask('build', [
        'quality',
        'uglify'
    ]);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
};
