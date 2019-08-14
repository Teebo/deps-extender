/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const fs = require("fs");
const path = require('path');
const utils = require('../utils/index');

const commonUtils = utils.common;
const extenderUtils = utils.extenderUtils;

const commonDepsSourcePackageName = process.argv[3];
// const matchedPackagesNames = extenderUtils.searchForPackageInNodeModules(commonDepsSourcePackageName)
// .stdout
// .split("\n");
// const matchedPackage = matchedPackagesNames.find((matchedPackage) => matchedPackage === commonDepsSourcePackageName);

if(extenderUtils.doesPackageExistInNodeModules(commonDepsSourcePackageName)) {
  commonUtils.logger({
    string: `Found ${commonDepsSourcePackageName} - Now extending package.json dependencies`,
    stringStyle: 'bold',
    stringColor: 'green'
  });

  const cwd = shell.pwd().stdout;
  const pathToPackagesExtensionSource = path.join(cwd, '/node_modules/internal-frontend-scripts');

  const ifsPackageJSON = require(`${pathToPackagesExtensionSource}/package.json`);
  const localPackageJSON = require(`${cwd}/package.json`);
  const { dependencies, devDependencies, unCommonDependencies } = ifsPackageJSON;
  const localPackageDependencies = localPackageJSON.dependencies;
  const localPackageDevDependencies = localPackageJSON.devDependencies;
  const localPeerDependencies = localPackageJSON.peerDependencies || {};
  const ifsDependenciesKeys = Object.keys(dependencies);
  const ifsDevDependenciesKeys = Object.keys(devDependencies);
  const iflPeerDependencies = ["mobx", "mobx-utils", "mobx-react"];

  ifsDependenciesKeys.forEach((packageKey) => {
    if(!unCommonDependencies.includes(packageKey)) {
      if(
        !localPackageDependencies.hasOwnProperty(packageKey) &&
        localPackageJSON.name !== "internal-frontend-library"
      ) {
        // We don't want to add the existing deps, the uncommon_deps and the IFL's peerDependencties to the
        // dependencies object
        localPackageDependencies[`${packageKey}`] = `${dependencies[packageKey]}`;
      } else {
        if(localPackageJSON.name !== "internal-frontend-library") {
          extenderUtils.updateDependencyVersion({
            localDependencies: localPackageDependencies,
            ifsDependencies: dependencies,
            packageKey,
            unCommonDependencies,
            commonDepsSourcePackageName
          });
        }
      }

      // If the package from the IFS is a peerDependency in the IFL, add it to the peerDependencies of the IFL

      if(localPackageJSON.name === "internal-frontend-library") {
        if(iflPeerDependencies.includes(packageKey)) {
          localPeerDependencies[`${packageKey}`] = `${dependencies[packageKey]}`;
        } else {
          localPackageDependencies[`${packageKey}`] = `${dependencies[packageKey]}`;
        }
      }
    }
  });

  ifsDevDependenciesKeys.forEach((packageKey) => {
    if(!localPackageDevDependencies.hasOwnProperty(packageKey) && !unCommonDependencies.includes(packageKey)) {
      localPackageDevDependencies[`${packageKey}`] = `${devDependencies[packageKey]}`;
    } else {
      extenderUtils.updateDependencyVersion({
        localDependencies: localPackageDevDependencies,
        ifsDependencies: devDependencies,
        packageKey,
        unCommonDependencies,
        commonDepsSourcePackageName
      });
    }
  });

  localPackageJSON.dependencies = localPackageDependencies;
  localPackageJSON.devDependencies = localPackageDevDependencies;
  localPackageJSON.peerDependencies = localPeerDependencies;

  shell.exec(`truncate -s 0 ./package.json`); // removes everything in the local package.json file
  // "localPackageJSON" has reference to old content

  // writes to the package.json file, "localPackageJSON" has reference to old content

  fs.writeFileSync("./package.json", JSON.stringify(localPackageJSON, null, 4), "utf8");

  commonUtils.logger({
    string: `********************** CONTINUE INSTALLATION PROCESS **********************`,
    stringStyle: 'bold',
    stringColor: 'cyan'
  });
}
