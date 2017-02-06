/* jshint esversion: 6 */
const fs = require('fs');
const child_process = require('child_process');
const async = require('async');
const request = require('request');
const config = require('./userContent.js');
const mappedRepos =   Object.keys(config.git).map(function (style) {
	return {
		repo: config.git[style].repo,
		path: ['resources'],
		dir: style
	};
});
var mappedEntries = [];
if (config.git) Object.keys(config.git).map(style => 'resources/' + style + '/' + config.git[style].entry);
if (config.git) mappedEntries.push(...config.userstyles.map(url => {
	return 'resources/' + /\/styles\/(\d+)\//.exec(url)[1] + '.css';
}));
if (fs.existSync('./userContent.css.d/')) mappedEntries.push(...fs.readdirSync('./userContent.css.d/').filter( file => /\.css$/.test(file) ).map(a => 'userContent.css.d/' + a));

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concurrent: {
			fetch: {
				tasks: ['gitPull', 'userstyles']
			},
			rebuild: {
				tasks: ['rebuild']
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
		concat: {
			target: {
				files: {
					'build/userContent.css': mappedEntries
				}
			}
		},
		postcss: {
			target: {
				options: {
					map: false, // inline sourcemaps
					failOnError: true,
					processors: [
						require('mahogany')(),
						require('cssnano')()
					]
				},
				files: {
					'build/userContent.css': 'build/userContent.css'
				}
			}
		},
		rebuild: {
			git: Object.keys(config.git).filter( a => config.git[a]['build.json'] )
		},
		fixes: {
			git: Object.keys(config.git).filter( a => config.git[a].fixes )
		}
	});
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-concat');
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

	grunt.registerMultiTask('fixes', 'Apply fixes to some files', function () {
		var done = this.async();
		async.forEach(this.data, (style, callback) => {
			const styledir = './resources/' + style + '/';
			const entry = config.git[style].entry;
			const fixes = config.git[style].fixes;
			if (fixes.header || fixes.footer) fs.writeFileSync(styledir + entry, (fixes.header || '') + fs.readFileSync(styledir + entry) + (fixes.footer || ''));
			return callback();
		}, done);
	});

	grunt.registerMultiTask('rebuild', 'Configure themes that can be configured with a build.json', function () {
		var done = this.async();
		async.forEach(this.data, (style, callback) => {
			grunt.log.writeln('building ' + style);
			const styledir = './resources/' + style + '/';
			fs.writeFileSync(styledir + 'build.json', JSON.stringify(config.git[style]['build.json']));
			child_process.execSync('git reset --hard HEAD && npm install && grunt ' + (config.git[style].grunt || ''), { cwd: styledir });
			const mostRecent = fs.readdirSync(styledir)
				.filter( file => /\.css$/.test(file) )
				.map( file => { return { name: file, mtime: fs.statSync(styledir + file).mtime}; } )
				.sort((a, b) => a.mtime - b.mtime)
				.pop();
			fs.writeFileSync(styledir + config.git[style].entry, fs.readFileSync(styledir + mostRecent.name));
			return callback();
		}, done);
	});

	grunt.registerTask('default', ['concurrent:fetch', 'concurrent:rebuild', 'fixes', 'concat', 'postcss']);
};
