/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks( "grunt-contrib-compass" );
  grunt.loadNpmTasks( "grunt-contrib-clean" );
  grunt.loadNpmTasks( "grunt-contrib-concat" );
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
        files: 'assets/styles/**/*.scss',
        tasks: [ "css-dev" ]
      }
    },
    concat: {
      js: {
        src: "public/scripts/**/*.js",
        dest: "public/scripts/code.js"
      },
      css: {
        src: ["assets/styles/*.css", "public/styles/*.css"],
        dest: "public/styles/style.css"
      }
    },
    compass: {
      styles: {
        options: {
          sassDir: "assets/styles",
          cssDir: "public/styles",
          noLineComments: false,
          quiet: false,
          relativeAssets: true,
          imagesDir: "public/images"
        }
      }
    },
    clean: {
      css: ["public/styles"],
      js: ["public/scripts"]
    }
  });

  // Default task.
  grunt.registerTask('default', 'watch');
  grunt.registerTask( "build", [ "clean", "compass", "concat" ] );
  grunt.registerTask( "css-dev", [ "clean:css", "compass:styles", "concat:css" ] );
  grunt.registerTask( "test-task", "test", function() {
    grunt.log.writeln( "executed task" );
  });
};
