const path = require("path");

module.exports = {
	entry: "./out_tsc/program.js",
	output: {
		filename: "main.js",
		path: path.resolve("./out/"),
	},
};