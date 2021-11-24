import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
	input: "out/tsc/program.js",
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
		nodeResolve(),
	],
};
