/* jshint esversion: 6 */
const fs = require('fs');
const async = require('async');
const request = require('request');
const config = require('./userContent.json');
const mappedRepos =   Object.keys(config.git).map(function (style) {
	return {
		repo: config.git[style].repo,
		path: ['resources'],
		dir: style
	};
});
var mappedEntries = Object.keys(config.git).map(style => 'resources/' + style + '/' + config.git[style].entry);
mappedEntries.push(...config.userstyles.map(url => {
	return 'resources/' + /\/styles\/(\d+)\//.exec(url)[1] + '.css';
}));

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concurrent: {
			target: {
				tasks: ['gitPull', 'userstyles']
			}
		},
		gitPull: {
			resources: {
				repos: mappedRepos
			}
		},
		userstyles: {
			styles: {
				urls: config.userstyles
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'build/userContent.css': mappedEntries
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-gitPull');

	grunt.registerMultiTask('userstyles', 'Retrieve css from userstyle.org', function () {
		var done = this.async();
		async.map(this.data.urls, (url, callback) => {
			var id = /\/styles\/(\d+)\//.exec(url)[1];
			request('https://userstyles.org/styles/' + id + '.css')
				.pipe(fs.createWriteStream('resources/' + id + '.css'))
				.on('finish', callback);
		}, done);
	});

	grunt.registerTask('default', ['concurrent', 'cssmin']);
};
