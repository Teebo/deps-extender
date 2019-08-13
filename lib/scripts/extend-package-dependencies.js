/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const fs = require("fs");
const semver = require("semver");
const path = require('path');
const commonUtils = require('../utils/index').common;

const commonDepsSourcePackageName = process.argv[3];
const matchedPackagesNames = shell.exec(`ls ./node_modules | grep -w ${commonDepsSourcePackageName}`)
.stdout
.split("\n");
const matchedPackage = matchedPackagesNames.find((matchedPackage) => matchedPackage === commonDepsSourcePackageName);

if(matchedPackage) {
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

  const updateDependencyVersion = (localDependecies, ifsDependencies, packageKey) => {
    if(!unCommonDependencies.includes(packageKey)) {
      const specialCharacters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;
      let localPackageVersion = localDependecies[packageKey];
      let ifsPackageVersion = ifsDependencies[packageKey];


      const isFirstCharacterANumber = (string) => !isNaN(string.substr(0, 1));
      const isFirstCharacterSpecial = (string) => specialCharacters.test(string.substr(0, 1));
      const stripAwayFirstSpecialCharacter = (string) => string.substr(1, string.length);
      const isValidPackageVersion = (string) => semver.valid(string) !== null;
      const arePackageVersionsValid = (ifsPackageVersion, localPackageVersion) => {
        return isValidPackageVersion(ifsPackageVersion) && isValidPackageVersion(localPackageVersion);
      };
      const getPackageVersionNumber = (rawPackageVersion) => {
        return isFirstCharacterSpecial(rawPackageVersion)
          ? stripAwayFirstSpecialCharacter(rawPackageVersion)
          : rawPackageVersion;
      };

      localPackageVersion = getPackageVersionNumber(localPackageVersion);
      ifsPackageVersion = getPackageVersionNumber(ifsPackageVersion);

      const canCompareVersions =
        arePackageVersionsValid(ifsPackageVersion, localPackageVersion) &&
        isFirstCharacterANumber(ifsPackageVersion) &&
        isFirstCharacterANumber(localPackageVersion);

      if(canCompareVersions) {
        if(semver.gt(ifsPackageVersion, localPackageVersion)) {
          localDependecies[packageKey] = ifsPackageVersion;
          commonUtils.logger({
            string: `Package version of ${packageKey} is Greater in ${commonDepsSourcePackageName}`,
            stringStyle: 'bold',
            stringColor: 'yellow'
          });
        } else if(semver.lt(ifsPackageVersion, localPackageVersion)) {
          commonUtils.logger({
            string: `***************** WARNING *****************`,
            stringStyle: 'bold',
            stringColor: 'red'
          });

          commonUtils.logger({
            string: `Package version of ${packageKey} is Lesser in ${commonDepsSourcePackageName}`,
            stringStyle: 'bold',
            stringColor: 'yellow'
          });
        } else {
          // console.log("Package versions are the same");
        }
      }
    }
  };

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
          updateDependencyVersion(localPackageDependencies, dependencies, packageKey);
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
    console.log(packageKey, localPackageJSON.name);
    if(!localPackageDevDependencies.hasOwnProperty(packageKey) && !unCommonDependencies.includes(packageKey)) {
      localPackageDevDependencies[`${packageKey}`] = `${devDependencies[packageKey]}`;
    } else {
      updateDependencyVersion(localPackageDevDependencies, devDependencies, packageKey);
    }
  });

  console.log(localPackageJSON.devDependencies);

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
