/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! Simple Cache - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Landon Bass; Licensed MIT */'
    },
    lint: {
      files: ['src/*.js','test/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
   concat: {
      dist: {
        src: [''],
        dest: ''
      }
    },
    min: {
      dist: {
        src: ['src/*.js'],
        dest: 'dist/simplecache.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit min');

};
