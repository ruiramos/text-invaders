module.exports = function(grunt) {
  var path = require('path');

  grunt.initConfig({
    express: {
    	options: {
    	},
    	dev: {
    		options: {
    			script: 'server.js'
    		}
    	}
    },
    less: {
    	development: {
    		files: {
    			"css/styles.css": "css/styles.less"
    		}
    	}

    },
	  watch: {
	    express: {
	      files:  [ '*.js' ],
	      tasks:  [ 'express:dev' ],
	      options: {
	        spawn: false // Without this option specified express won't be reloaded
	      }
	    },
	    less: {
	    	files: "./css/*.less",
	    	tasks: ["less:development"]
	    }
    }    
  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('server', ['express:dev', 'watch']);
};