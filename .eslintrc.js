module.exports = {
  "extends": "airbnb",
  "installedESLint": true,
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "globals": {
  	"window": true,
  	"localStorage": true,
  	"document": true,
	},
	"rules": {
		"no-new": 1,
		"no-param-reassign": 1,
		"no-continue": 0,
		"consistent-return": 0,
		"import/prefer-default-export": 1,
	}
};