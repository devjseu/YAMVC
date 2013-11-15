module.exports = function (grunt) {
    var name, latest, bannerContent, devRelease, minRelease,
        sourceMapMin, sourceMapUrl, lDevRelease, lMinRelease,
        lSourceMapMin;

    latest = '<%= pkg.name %>';
    name = '<%= pkg.name %>-v<%= pkg.version%>';
    bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
        ' *  License: <%= pkg.license %> */\n';
    devRelease = 'distrib/' + name + '.js';
    minRelease = 'distrib/' + name + '.min.js';
    sourceMapMin = 'distrib/' + name + '.min.js.map';
    sourceMapUrl = name + '.min.js.map';

    lDevRelease = 'distrib/' + latest + '.js';
    lMinRelease = 'distrib/' + latest + '.min.js';
    lSourceMapMin = 'distrib/' + latest + '.min.js.map';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        qunit: {
            target: {
                src: ['test/**/*.html']
            }
        },
        copy: {
            development: {
                src: devRelease,
                dest: lDevRelease
            },
            minified: {
                src: minRelease,
                dest: lMinRelease
            },
            smMinified: {
                src: sourceMapMin,
                dest: lSourceMapMin
            }
        },
        uglify: {
            options: {
                banner: bannerContent,
                sourceMapRoot: '../',
                sourceMap: sourceMapMin,
                sourceMappingURL: sourceMapUrl
            },
            target: {
                src: ['src/**/*.js'],
                dest: minRelease
            }
        },
        concat: {
            options: {
                banner: bannerContent
            },
            target: {
                src: ['src/**/*.js'],
                dest: devRelease
            }
        },
        jshint: {
            options: {
                trailing: true,
                eqeqeq: true
            },
            target: {
                src: ['src/**/*.js', 'test/**/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy', 'qunit']);
};