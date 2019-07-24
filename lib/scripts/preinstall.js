/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");

if (!shell.which("npm") && !shell.which("yarn")) {
  shell.echo("Package manager required");
  shell.exit(1);
} else {
  const ifsPackageName = process.argv[2];
  const matchedPackages = shell.exec(`ls ./node_modules | grep -w ${ifsPackageName}`).stdout.split("\n");
  const matchedPackage = matchedPackages.find((matchedPackage) => matchedPackage === ifsPackageName);

  // IF-branch 1. Check if the IFS is in the node_modules
  // IF-branch 2. Because we want to extend th package.json file of the consuming project before install anything else
  // we need to have the IFS installed first via the remote/local(For dev/testing) repo url before continuing the install
  // process.
  // Add IFS manual from remote repository, if that fails install it via the package.json
  // entry in the install-ifs shell script
  // ignore-scripts is required to avoid the infinite-loop caused by the install-ifs script when trying to ls
  // the none existing node_modules folder

  if (!matchedPackage) {
    if (
      shell.exec(
        "yarn add -D http://bitbucket.development.local/scm/frl/internalfrontendscripts.git#feature/ET-2678 --ignore-scripts"
      ).code === 0
    ) {
      shell.exec(`yarn install-ifs ${ifsPackageName}`);
    } else {
      console.log("Failed to install the IFS");
      shell.exit(1);
    }
  } else {
    console.log("Has IFS");
    console.log("Continue...");
  }
}
