const colors = require("colors");

const commonUtils = {
  logger: ({string, stringColor, stringBackgroundColor, stringStyle}) => {
    let output = colors[stringColor];

    if(stringBackgroundColor) {
      output = output[stringBackgroundColor]
    }

    if(stringStyle) {
      output = output[stringStyle]
    }

    if(string) {
      output = output(string);
    } else {
      throw Error(colors.red.bold('No string was provided'));
    }

    console.log(output);
  }
};

module.exports = commonUtils;