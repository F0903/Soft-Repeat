const path = require('path');

module.exports = {
  entry: "./out/int/tsc/program.js",
  output: {
    path: path.resolve("./out/dist/js/"),
    filename: "main.js",
  },
};