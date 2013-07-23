module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Move out to config.json or .yml
    pkg: grunt.file.readJSON('package.json'),
    meta: {
    },
    connect: {
      server: {
        options: {
          base: '.',
          hostname: '127.0.0.1',
          port: 8089,
          keepalive: false,
          middleware: function(connect, options) {
            return [
              // Serve static files.
              connect.static(options.base),
              // Make empty directories browsable.
              connect.directory(options.base),
            ];
          }
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        },
      },
      all: ['Gruntfile.js', 'static/js/**/*.js']
    },
    qunit: {
      all: {
        options: {
          verbose: true,
          urls: [
            'http://127.0.0.1:8089/test/'
          ]
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      jsmin: {
        files: {
          'static/build/js/mango.min.js': ['static/js/mango.js'] 
        }
      }
    },
    watch: {
      js: {
        files: 'static/js/**/*.js',
        tasks: ['jshint:all', 'uglify:jsmin'],
        options: {
          nospawn: true
        }
      }
    }
  });

  // ////////////////// //
  // LOAD GRUNT MODULES //
  // ////////////////// //
  // A basic server for testing the app - this server only runs while grunt is running. Use keepalive: true for use as a development server
  grunt.loadNpmTasks('grunt-contrib-connect');

  // JSHint - Check Yoscript Before U Wreck Yoscript
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Use QUnit by the jQuery team to run client-side/front-end unit tests, test driven development is t3h s3x.
  grunt.loadNpmTasks('grunt-contrib-qunit');

  // Uglify for minification
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Watch files and do specified tasks when they change
  grunt.loadNpmTasks('grunt-contrib-watch');

  // //////////////////// //
  // REGISTER GRUNT TASKS //
  // //////////////////// //
  // Default task(s).
  grunt.registerTask('default', ['connect:server:keepalive']); 

  // Lint JS files
  grunt.registerTask('jslint', ['jshint:all']);
  grunt.registerTask('jsmin', ['uglify:jsmin']);

  // Run QUnit tests
  // -- if you're already running a server.
  grunt.registerTask('test', ['connect:server', 'qunit:all']);

  // Have regard watch for file changes in the file system
  grunt.registerTask('auto', ['watch:js']);
  
  // //////
  // Custom Event listeners for PhantomJS/QUnit tests.
  grunt.event.on('qunit.moduleStart', function(name){
    console.log("\n-> Starting " + name + " module...");
  });
  grunt.event.on('qunit.testStart', function(name){
    console.log("--> Starting " + name + " test...");
  });
  grunt.event.on('qunit.log', function(result, actual, expected, message, source){
    console.log("---> " + message);
  });
  grunt.event.on('qunit.testDone', function(name, failed, passed, total){
    var result = failed ? 'failed' : 'passed';
    console.log(".. ... ...\n--> " + name + " test " + result + "...");
  });
  grunt.event.on('qunit.moduleDone', function(name, failed, passed, total){
    var result = failed ? 'failed' : 'passed';
    console.log("-> " + name + " module " + result + "...");
  });
};