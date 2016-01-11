/**
 * this file could really use a good clean up
 */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: [
                '/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>' +
                ' * @link <%= pkg.homepage %>',
                ' * @author <%= pkg.author %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */',
                ' '
            ].join('\n')
        },
        dirs: {
            dest: 'dist'
        },
        jshint: {
            all: {
                src: [ 'src/*.js' ],
                options: {
                    globals: [ 'require' ]
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
            }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['src/*.js'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
            }
        },
        bower: {
            install: {
            }
        }
    });

    grunt.registerTask('uglify', [ 'uglify' ]);

    grunt.registerTask('quality', [
        'jshint:all'
    ]);

    grunt.registerTask('build', [
        'bower',
        'quality',
        'concat',
        'uglify'
    ]);

    grunt.registerTask('test', ['build']);

    // Provides the "bump" task.
    grunt.registerTask('bump', 'Increment version number', function() {
        var versionType = grunt.option('type');
        function bumpVersion(version, versionType) {
            var type = {patch: 2, minor: 1, major: 0},
                parts = version.split('.'),
                idx = type[versionType || 'patch'];
            parts[idx] = parseInt(parts[idx], 10) + 1;
            while(++idx < parts.length) { parts[idx] = 0; }
            return parts.join('.');
        }
        var version;
        function updateFile(file) {
            var json = grunt.file.readJSON(file);
            version = json.version = bumpVersion(json.version, versionType || 'patch');
            grunt.file.write(file, JSON.stringify(json, null, '  '));
        }
        updateFile('package.json');
        updateFile('bower.json');
        grunt.log.ok('Version bumped to ' + version);
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-task');
};
