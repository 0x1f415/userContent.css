# userContent.css

grunt build process to retrieve, update, combine, and minify userstyles into one file. currently does not support theme options for userstyles.org themes.

## usage

create a `userContent.js` in the project root that looks like this:

```js
const font = 'Menlo';
const fg = '#4183C4' ;
const theme = 'monokai';
module.exports = {
	'git': { // put styles hosted on github or any other git repo here
		'wikipedia-dark': { // this can be any filesystyem-legal string
			'repo': 'https://github.com/StylishThemes/Wikipedia-Dark',
			'entry': 'wikipedia-dark.css', // location of the main css file (relative to its repo's root)
			'build.json': { // values that will be written to build.json for the style. any js is legal, it'll be serialized with JSON.stringify by the build system
				// note that most of the styles at github.com/StylishThemes need you to define all of the options even if you intend to use the default
				"color"   : fg,
				"visited" :	fg,
				"image"   : 'none',
				"tiled"   : false,
				"attach"  : "scroll",
				"webkit"  : false
			},
			// any arguments you want to pass to grunt. this is passed to the shell, so be careful
			'grunt': 'user'
		}
		'github-dark': {
			'repo': 'https://github.com/StylishThemes/GitHub-Dark.git',
			'entry': 'github-dark.css',
			'build.json': {
				'theme'    : theme,
				'color'    : fg,
				'font'     : font,
				'image'    : 'none',
				'tiled'    : true,
				'codeWrap' : false,
				'attach'   : 'scroll',
				'tab'      : 4,
				'webkit'   : false
			}
		},
	},
	'userstyles': [ // any styles hosted on userstyles.org. these can't be configured... yet
		'https://userstyles.org/styles/115066/searx-me-dark',
		'https://userstyles.org/styles/117673/darktube'
	]
};
```

you can also throw arbitrary files in the `userContent.css.d` directory and any css file in that directory (and subdirectories) will be included as well.

then run `grunt` in the project root. it will create `build/userContent.css`. this can then be copied or symlinked into your firefox profile ([more info](http://kb.mozillazine.org/UserContent.css)).
