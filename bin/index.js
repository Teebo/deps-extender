#!/usr/bin/env node

const spawn = require('cross-spawn');
const path = require('path');
const commonUtils = require('../lib/utils/index').common;
const shell = require('shelljs');

const resolveScript = (scriptName) => require.resolve(`../lib/scripts/${scriptName}`);

const scriptNames = {
  preInstall: 'preinstall',
  postInstall: 'postinstall',
  installIFS: 'install-ifs',
  extendDependencies: 'extend-package-dependencies',
};

const spawnScriptProcess = ({ scriptName, commonDepsSourcePackageName = null, isShellScript = false }) => {
  const asterisks = '******************************';

  commonUtils.logger({
    string: `${asterisks}\n${scriptName}\n${asterisks}`,
    stringColor: 'cyan',
    stringStyle: 'bold'
  });

  if(!isShellScript) {
    commonUtils.logger({
      string: 'Node process',
      stringColor: 'magenta',
      stringStyle: 'underline'
    });

    const args = [resolveScript(scriptName), scriptName];

    commonDepsSourcePackageName && args.push(commonDepsSourcePackageName);

    const result = spawn.sync(
      'node',
      [resolveScript(scriptName), scriptName, commonDepsSourcePackageName],
      { stdio: 'inherit' }
    );

    process.exit(result.status);
  } else {
    commonUtils.logger({
      string: 'Bash process',
      stringColor: 'magenta',
      stringStyle: 'underline'
    });
    console.log('About to sparl teh bash script');
    shell.exec(`bash ${path.join(__dirname, `../lib/scripts/${scriptName}.sh`)}`);
    // spawn.sync(
    //   'bash',
    //   [path.join(__dirname, `../lib/scripts/${scriptName}.sh`)]
    // );
}
};

const processScriptName = process.argv[2];

switch(processScriptName) {
  case scriptNames.preInstall:
    console.log(process.argv);
    spawnScriptProcess({ scriptName: processScriptName, commonDepsSourcePackageName: process.argv[3] });
    break;
  case scriptNames.postInstall:
    spawnScriptProcess({ scriptName: processScriptName });
    break;
  case scriptNames.installIFS:
    console.log(process.argv, scriptNames.installIFS);
    spawnScriptProcess({ scriptName: processScriptName, isShellScript: true });
    break;
  case scriptNames.extendDependencies:
    spawnScriptProcess({ scriptName: processScriptName, commonDepsSourcePackageName: process.argv[3] });
    break;
  default:
    commonUtils.logger({
      string: `Script ${scriptName} was not found`,
      stringColor: 'red',
      stringStyle: 'bold'
    });
}

