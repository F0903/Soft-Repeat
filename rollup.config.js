import copy from "rollup-plugin-copy";

export default {
	input: "out/tsc/ts/program.js",
	output: {
		file: "out/dist/main.js",
		format: "iife",
	},
	plugins: [
		copy({
			targets: [
				{ src: "src/css/**/*", dest: "out/dist/css" },
				{ src: "src/html/**/*", dest: "out/dist/html" },
				{ src: "media/**/*", dest: "out/dist/media" },
				{ src: "manifest.json", dest: "out/dist" },
			],
		}),
	],
};
