const _ = require('lodash');

/**
 * converts values of options object listed in fields array
 * to brand new object with regular expressions
 *
 * @param {array} fieldsArray
 * @param {object} optionsObj
 * @returns {object}
 */
exports.convertToRegex = (fieldsArray, optionsObj) => {
  const result = {};
  fieldsArray.forEach(field => {
    if (_.has(optionsObj, field)) {
      result[field] = {
        $regex: optionsObj[field],
        $options: 'ig',
      };
    }
  });

  return result;
};
