/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const chalk = require("chalk");

console.log(
  `${chalk.green.bold(`Done installing\n**************************`)}\n${chalk.cyan.bold(`Rebuild Node-Sass`)}`
);

shell.exec("npm rebuild node-sass");
