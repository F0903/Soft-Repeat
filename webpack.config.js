const path = require('path');

module.exports = {
  entry: "./inter/out_tsc/program.js",
  output: {
    path: path.resolve("./dist/js/"),
    filename: "main.js",
  },
};