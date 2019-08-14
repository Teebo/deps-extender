/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const colors = require("colors");
const utils = require('../utils/index');

const commonUtils = utils.common;
const extenderUtils = utils.extenderUtils;

console.log(process.env);

if(!shell.which("npm") && !shell.which("yarn")) {
  shell.echo("Package manager required");
  shell.exit(1);
} else {
  const commonDepsSourcePackageName = process.argv[3];
  // const matchedPackages = shell.exec(`ls ./node_modules | grep -w ${commonDepsSourcePackageName}`).stdout.split("\n");
  // const matchedPackage = matchedPackages.find((matchedPackage) => matchedPackage === commonDepsSourcePackageName);

  // IF-branch 1. Check if the IFS is in the node_modules
  // IF-branch 2. Because we want to extend th package.json file of the consuming project before install anything else
  // we need to have the IFS installed first via the remote/local(For dev/testing) repo url before continuing the install
  // process.
  // Add IFS manual from remote repository, if that fails install it via the package.json
  // entry in the install-ifs shell script
  // ignore-scripts is required to avoid the infinite-loop caused by the install-ifs script when trying to ls
  // the none existing node_modules folder

  if(!extenderUtils.doesPackageExistInNodeModules(commonDepsSourcePackageName)) {
    commonUtils.logger({
      string: `No common dependencies source package was found\n ${colors.cyan.bold('Now trying to install it.')}`,
      stringColor: 'yellow',
      stringStyle: 'bold'
    });

    if(
      // TODO: Do check if the common deps source package is on a private(Bitbucket/Github) or public(NPM) repository
      shell.exec(
        "yarn add -D http://bitbucket.development.local/scm/frl/internalfrontendscripts.git#feature/ET-2678 --ignore-scripts"
      ).code === 0
    ) {
      shell.exec(`yarn install-ifs ${commonDepsSourcePackageName}`);
    } else {
      commonUtils.logger({
        string: `Failed to install the ${commonDepsSourcePackageName} package.\nExiting...`,
        stringColor: 'red',
        stringStyle: 'bold'
      });

      shell.exit(1);
    }
  } else {
    commonUtils.logger({
      string: `${commonDepsSourcePackageName} is already installed.\nContinue...`,
      stringColor: 'yellow',
      stringStyle: 'bold'
    });
  }
}
