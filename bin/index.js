#!/usr/bin/env node

const spawn = require('cross-spawn');
const colors = require('colors');
const shelljs = require('shelljs');
const path = require('path');

const resolveScript = (scriptName) => require.resolve(`../lib/scripts/${scriptName}`);

const scriptNames = {
  preInstall: 'preinstall',
  postInstall: 'postinstall',
  installIFS: 'install-ifs',
  extendDependencies: 'extend-package-dependencies',
};

const spawnScriptProcess = ({scriptName, commonDepsSourcePackageName = null, isShellScript = false}) => {
  console.log(
    `${colors.cyan.bold(`******************************\n${scriptName}\n*******************************`)}`
  );

  if(!isShellScript) {
    console.log('NODE');
    const args = [resolveScript(scriptName), scriptName];

    commonDepsSourcePackageName && args.push(commonDepsSourcePackageName);

    const result = spawn.sync(
      'node',
      [resolveScript(scriptName), scriptName, commonDepsSourcePackageName],
      { stdio: 'inherit'}
    );

    process.exit(result.status);
  } else {
    console.log('BASH');

    console.log(require.resolve(`../lib/scripts/${scriptName}.sh`));
    console.log(require.resolve(`../lib/scripts/${scriptName}.sh`));
    console.log(path.join(__dirname, `../lib/scripts/${scriptName}.sh`));

    // const result = spawn.sync(
    //   'bash',
    //   [resolveScript(scriptName), scriptName, commonDepsSourcePackage],
    //   { stdio: 'inherit'}
    // );

    const result = spawn.sync(
      'bash',
      [path.join(__dirname, `../lib/scripts/${scriptName}.sh`)],
      { stdio: 'inherit'}
    );

    console.log(result);
  }
};

const processScriptName = process.argv[2];

switch(processScriptName) {
  case scriptNames.preInstall:
    spawnScriptProcess({scriptName: processScriptName, commonDepsSourcePackageName: process.argv[3]});
    break;
  case scriptNames.postInstall:
    spawnScriptProcess({scriptName: processScriptName});
    break;
  case scriptNames.installIFS:
    spawnScriptProcess({scriptName: processScriptName, isShellScript: true});
    break;
  case scriptNames.extendDependencies:
    spawnScriptProcess({scriptName: processScriptName, commonDepsSourcePackageName: process.argv[3]});
    break;
  default:
    console.log('THAT SCRIPT WAS NOT FOUND');
}

