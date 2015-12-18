module.exports=function(grunt){
	grunt.initConfig({
		// pkg:grunt.file.readJSON('package.json'),
		connect:{
			livereload:{
				options:{
					port:8000,
					hostname:'192.168.1.39',
					base:'.',
					open:true
				}
			}
		},
		watch:{
			client:{
				files:['dev/*.html','dev/**/*'],
				options:{
					livereload:true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('live',['connect','watch']);
}