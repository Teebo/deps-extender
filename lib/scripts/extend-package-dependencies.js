/* eslint-disable padding-line-between-statements, no-console */
const shell = require("shelljs");
const fs = require("fs");
const semver = require("semver");

const packageToInstall = "internal-frontend-scripts";
const matchedPackages = shell.exec(`ls ./node_modules | grep -w ${packageToInstall}`).stdout.split("\n");
const matchedPackage = matchedPackages.find((matchedPackage) => matchedPackage === packageToInstall);

if (matchedPackage) {
  console.log("Found IFS - Now extending package.json dependencies");
  const ifsPackageJSON = require("../node_modules/internal-frontend-scripts/package");
  const localPackageJSON = require("../package");
  const { dependencies, devDependencies, unCommonDependencies } = ifsPackageJSON;
  const localPackageDependencies = localPackageJSON.dependencies;
  const localPackageDevDependencies = localPackageJSON.devDependencies;
  const localPeerDependencies = localPackageJSON.peerDependencies || {};
  const ifsDependenciesKeys = Object.keys(dependencies);
  const ifsDevDependenciesKeys = Object.keys(devDependencies);
  const iflPeerDependencies = ["mobx", "mobx-utils", "mobx-react"];

  const updateDependencyVersion = (localDependecies, ifsDependencies, packageKey) => {
    if (!unCommonDependencies.includes(packageKey)) {
      const specialCharacters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;
      let localPackageVersion = localDependecies[packageKey];
      let ifsPackageVersion = ifsDependencies[packageKey];
      console.log(ifsPackageVersion, localPackageVersion);

      const isFirstCharacterANumber = (string) => !isNaN(string.substr(0, 1));
      const isFirstCharacterSpecial = (string) => specialCharacters.test(string.substr(0, 1));
      const stripAwayFirstSpecialCharacter = (string) => string.substr(1, string.length);
      const isValidPackageVersion = (string) => semver.valid(string) !== null;
      const arePackageVersionsValid = (ifsPackageVersion, localPackageVersion) => {
        return isValidPackageVersion(ifsPackageVersion) && isValidPackageVersion(localPackageVersion);
      };

      localPackageVersion = isFirstCharacterSpecial(localPackageVersion)
        ? stripAwayFirstSpecialCharacter(localPackageVersion)
        : localPackageVersion;

      ifsPackageVersion = isFirstCharacterSpecial(ifsPackageVersion)
        ? stripAwayFirstSpecialCharacter(ifsPackageVersion)
        : ifsPackageVersion;

      const canCompareVersions =
        arePackageVersionsValid(ifsPackageVersion, localPackageVersion) &&
        isFirstCharacterANumber(ifsPackageVersion) &&
        isFirstCharacterANumber(localPackageVersion);

      if (canCompareVersions) {
        if (semver.gt(ifsPackageVersion, localPackageVersion)) {
          console.log("BEFORE", localDependecies[packageKey], ifsPackageVersion);
          localDependecies[packageKey] = ifsPackageVersion;
          console.log("AFTER", localDependecies[packageKey], ifsPackageVersion);
          console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
          console.log("Package version of", packageKey, "is Greater in the IFS");
        } else if (semver.lt(ifsPackageVersion, localPackageVersion)) {
          console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
          console.log("Package version of", packageKey, "is Lesser in the IFS");
          console.log("****************WARN THE USER***************************");
        } else {
          // console.log("Package versions are the same");
        }
      }
    }
  };

  ifsDependenciesKeys.forEach((packageKey) => {
    if (
      !localPackageDependencies.hasOwnProperty(packageKey) &&
      !unCommonDependencies.includes(packageKey) &&
      !iflPeerDependencies.includes(packageKey)
    ) {
      // We don't want to add the existing deps, the uncommon_deps and the IFL's peerDependencties to the
      // dependencies object
      localPackageDependencies[`${packageKey}`] = `${dependencies[packageKey]}`;
    } else {
      if (!iflPeerDependencies.includes(packageKey)) {
        updateDependencyVersion(localPackageDependencies, dependencies, packageKey);
      }
    }

    // If the package from the IFS is a peerDependency in the IFL, add it to the peerDependencies of the IFL
    if (localPackageJSON.name === "internal-frontend-library" && iflPeerDependencies.includes(packageKey)) {
      localPeerDependencies[`${packageKey}`] = `${dependencies[packageKey]}`;
    }
  });

  ifsDevDependenciesKeys.forEach((packageKey) => {
    if (!localPackageDevDependencies.hasOwnProperty(packageKey) && !unCommonDependencies.includes(packageKey)) {
      localPackageDevDependencies[`${packageKey}`] = `${devDependencies[packageKey]}`;
    } else {
      updateDependencyVersion(localPackageDevDependencies, devDependencies, packageKey);
    }
  });

  localPackageJSON.dependencies = localPackageDependencies;
  localPackageJSON.devDependencies = localPackageDevDependencies;
  localPackageJSON.peerDependencies = localPeerDependencies;

  shell.exec(`truncate -s 0 ./package.json`);
  fs.writeFileSync("./package.json", JSON.stringify(localPackageJSON, null, 4), "utf8");
  console.log("D*******************************************************************************************");
  console.log("D*******************************************************************************************");
  console.log("D*******************************************************************************************");
  console.log("D*******************************************************************************************");
  console.log(
    "D********************************BEFORE CONDITNUING*********************************************************"
  );
}
