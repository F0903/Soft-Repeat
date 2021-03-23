const path = require("path");

module.exports = {
	entry: "./inter/out_tsc/program.js",
	output: {
		filename: "main.js",
		path: path.resolve("./dist/js/"),
	},
};