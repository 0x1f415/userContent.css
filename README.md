# userContent.css

grunt build process to combine and minify userstyles into one file. currently does not support theme options.

## usage

create a `userContent.json` in the project root that looks like this:

```json
{
	"git": {
		"github-dark": {
			"repo": "https://github.com/StylishThemes/GitHub-Dark.git",
			"entry": "github-dark.css"
		},
		"stackexchange-dark": {
			"repo": "https://github.com/StylishThemes/StackOverflow-Dark",
			"entry": "stackoverflow-dark.css"
		}
	},
	"userstyles": [
		"https://userstyles.org/styles/115066/searx-me-dark"
	]
}
```

then run `grunt` in the project root. it will create `build/userContent.css`.
