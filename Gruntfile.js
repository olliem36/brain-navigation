module.exports = function ( grunt ) {

	require('load-grunt-tasks')(grunt); 

	grunt.initConfig( {

		pkg: grunt.file.readJSON( 'package.json' ),

		browserify: {
			build: {
				files: {
					'js/build/deploy.js': [ 'js/build/app.js' ]
				}
			}
		},
		concat: {
			options: {
				// banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				// footer: ''
			},
			build: {
				src: [ 'js/neuron.js', 'js/signal.js', 'js/particlePool.js', 'js/particle.js', 'js/axon.js', 'js/neuralnet.js',
						 'js/loaders.js', 'js/scene.js', 'js/main.js', 'js/gui.js', 'js/run.js', 'js/events.js' ],
				dest: 'js/build/app.js'
			},
			vendor: {
				src: [ 'js/vendor/underscore.js', 'js/vendor/jquery.min.js', 'js/vendor/Detector.js', 'js/vendor/dat.gui.min.js',
						'js/vendor/stats.min.js', 'js/vendor/three.js', 'js/vendor/OrbitControls.js', 'js/vendor/OBJLoader.js',
						'node_modules/tween.js/src/Tween.js'
					 ],
				dest: 'js/vendor/vendor-merge.js'
			}
		},
		// Ruby and SASS gem needs ot be installed
		// sudo apt-get install ruby-full 
		// sudo gem install sass           
		sass: {
			dist: {
			  options: {
			    style: 'expanded',
			  },
			  files: {
			    'css/app.css': ['css/app.scss'],
			  }
			}
		},
		uglify: {
			options: {},
			build: {
				src: [ 'js/build/app.js' ],
				dest: 'js/build/app.min.js',
				sourceMap: true
			},
			vendor: {
				src: [ 'js/vendor/vendor-merge.js' ],
				dest: 'js/vendor/vendor-merge.min.js',
				sourceMap: false
			}
		},
		watch: {
			options: { // global opptions for all watchers
				livereload: true
			},
			js: {
				files: 'js/*.js',
				tasks: [ 'concat' ]
			},
			css: {
				files: 'css/*.scss',
				tasks: [ 'sass' ]
			},
			html: {
				files: '*.html'
			}
		},
		connect: {
			server: {
				options: {
					port: 9001,
					base: '.',
				}
			}
		}
	} );

	// Load the plugin that provides the tasks.
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks('grunt-contrib-sass');

	// tasks
	grunt.registerTask( 'default', [ 'watch' ] );
	grunt.registerTask( 'serve', [ 'connect:server', 'watch', 'sass', 'build'] );
	grunt.registerTask( 'build', [ 'concat:build', 'uglify:build' ] );
	grunt.registerTask( 'vendor', [ 'concat:vendor', 'uglify:vendor' ] );
};
