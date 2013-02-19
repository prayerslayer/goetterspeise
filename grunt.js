/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks( "grunt-compass" );
  grunt.loadNpmTasks( "grunt-yui-compressor" );
  grunt.loadNpmTasks( "grunt-cleanx" );
  grunt.loadNpmTasks( "grunt-contrib-watch" );

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
        files: [ '/asssets/styles/**/*.scss' ],
        tasks: 'build'
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
        src: "assets/styles/*.css",
        dest: "public/styles/style.css"
      }
    },
    compass: {
      styles: {
        src: "assets/styles",
        dest: "assets/styles",
        linecomments: true,
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
        src: "public/styles/style.css",
        dest: "public/styles/style.min.css"
      }
    },
    clean: {
      css: {
        dirs: ["public/styles"]
      },
      js: {
        dirs: ["public/scripts"]
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'watch');
  grunt.registerTask( "build", "clean compass concat cssmin min" );
  grunt.registerTask( "css-dev", "clean:css compass:styles concat" );
};
