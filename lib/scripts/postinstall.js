/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const colors = require("colors");

console.log(
  `${colors.green.bold(`Done installing\n**************************`)}\n${colors.cyan.bold(`Rebuild Node-Sass`)}`
);

shell.exec("npm rebuild node-sass");
