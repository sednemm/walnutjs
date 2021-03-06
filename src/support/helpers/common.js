/* eslint-disable no-undef */
const fs = require('fs-plus');
const path = require('path');
const interpreter = require('../expressions/interpreter');
const string = require('./string');
const vars = require('./variables');
const params = require('./params');
const logger = require('./logger');

module.exports = {
  /**
   * Process expressions and vars in a text with walnut marks '${text}'
   */
  getTreatedValue: (text) => {
    let content = string.removeQuotationMark(text);
    const list = text.match(/\${(.*?)}/g);

    if (list === null) {
      return content;
    }

    for (let i = 0; i < list.length; i += 1) {
      const word = list[i];
      let newWord = word;

      // get only text content
      while (string.hasBracketsMark(newWord) || string.hasQuotationMark(newWord)) {
        newWord = string.removeBracketsMark(newWord);
        newWord = string.removeQuotationMark(newWord);
      }

      // parse vars and params
      newWord = vars.nutParseVars(newWord);
      newWord = params.nutParseParams(newWord);

      // solve expressions
      newWord = interpreter.resolveExpression(newWord);

      // replacement
      content = content.replace(word, newWord);
    }

    return content;
  },

  compare: (mcurrent, mtype, mreceived) => {
    const type = mtype.trim().toLowerCase().replace(/\s/gi, '');
    const current = mcurrent.toString();
    const received = mreceived.toString();

    switch (type) {
      case 'whichcontains':
        assert(current.includes(received), `Current value [$${current}] not contains [${received}]`);
        break;

      case 'whichnotcontains':
        assert(!current.includes(received), `Current value [${current}] contains [${received}]`);
        break;

      case 'equalsto':
        assert.equal(current, received, `Current value [${current}] not equals to [${received}]`);
        break;

      case 'notequalsto':
        assert.notEqual(current, received, `Current value [${current}] is equals to [${received}]`);
        break;

      case 'whichstartswith':
        assert(current.startsWith(received), `Current value [${current}] does not start with [${received}]`);
        break;

      case 'whichendswith':
        assert(current.endsWith(received), `Current value [${current}] does not end with [${received}]`);
        break;

      default:
        break;
    }
  },

  saveScreenshot: (folderPath, name) => driver.takeScreenshot().then((screenshot, err) => {
    if (err) {
      throw new Error(err.stack);
    }
    fs.writeFile(path.join(folderPath, `${name}.png`), screenshot, 'base64', (writeErr) => {
      logger.error(writeErr);
    });
  }),

};
