/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks( "grunt-compass" );
  grunt.loadNpmTasks( "grunt-yui-compressor" );
  grunt.loadNpmTasks( "grunt-clean" );

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'YOUR_NAME; Licensed MIT */'
    },
    watch: {
      css: {
        files: [ 'public/styles/sass/**/*.scss', "public/styles/sass/**/*.sass" ],
        tasks: [ 'compass:styles']
      },
      js: {
        files: [ "public/scripts/**/!(code).js" ],
        tasks: [ "concat:js" ]
      }
    },
    concat: {
      js: {
        src: "public/scripts/**/*.js",
        dest: "public/scripts/code.js"
      },
      css: {
        src: "public/styles/stylesheets/**/*.css",
        dest: "public/styles/stylesheets/style.css"
      }
    },
    compass: {
      styles: {
        src: "public/styles/sass",
        dest: "public/styles/stylesheets",
        linecomments: false,
        relativeassets: true,
        images: "public/images"
      }
    },
    min: {
      js: {
        src: "public/scripts/code.js",
        dest: "public/scripts/code.min.js"
      }
    },
    cssmin: {
      css: {
        src: "public/styles/stylesheets/style.css",
        dest: "public/styles/stylesheets/style.min.css"
      }
    },
    clean: {
      css: "public/styles/stylesheets",
      js: "public/scripts/code*.js"
    }
  });

  // Default task.
  grunt.registerTask('default', 'watch');
  grunt.registerTask( "build", "clean compass concat cssmin min" );
};
