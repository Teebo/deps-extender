const shell = require("shelljs");
const semver = require("semver");
const commonUtils = require('./common');

const specialCharacters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;
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

const packageExtenderUtils = {
  getPackageNamesMatchingString: (packageName) => {
    return shell.exec(`ls ./node_modules | grep -w ${packageName}`).stdout
    .split("\n");
  },
  doesPackageExistInNodeModules: (packageName) => {
    const matchedPackagesNames = packageExtenderUtils.getPackageNamesMatchingString(packageName);

    return (matchedPackagesNames.find((matchedPackage) => matchedPackage === packageName) !== undefined)
  },
  updateDependencyVersion: ({ localDependencies, ifsDependencies, packageKey, unCommonDependencies, commonDepsSourcePackageName }) => {
    if(!unCommonDependencies.includes(packageKey)) {
      let localPackageVersion = localDependencies[packageKey];
      let ifsPackageVersion = ifsDependencies[packageKey];

      localPackageVersion = getPackageVersionNumber(localPackageVersion);
      ifsPackageVersion = getPackageVersionNumber(ifsPackageVersion);

      const canCompareVersions =
        arePackageVersionsValid(ifsPackageVersion, localPackageVersion) &&
        isFirstCharacterANumber(ifsPackageVersion) &&
        isFirstCharacterANumber(localPackageVersion);

      if(canCompareVersions) {
        if(semver.gt(ifsPackageVersion, localPackageVersion)) {
          localDependencies[packageKey] = ifsPackageVersion;

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
  }
};

module.exports = packageExtenderUtils;