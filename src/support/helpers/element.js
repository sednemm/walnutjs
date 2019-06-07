'use strict';

var _ = require('lodash');
var context = require('../context');
var helperString = require('./string');
var helperInfo = require('./info');
var lastStyleValue = '';

function isEmptyObject(o) {
  return Object.keys(o).every(function (x) {
    return o[x] === '' || o[x] === null;
  });
}

function applyFilterInList(list, option) {
  switch (option.toLowerCase()) {
    case 'first':
      return list.first();
    case 'last':
      return list.last();
    case 'enabled':
      return list.filter(function (elem) {
        return elem.isEnabled();
      });
    case 'displayed':
      return list.filter(function (elem) {
        return elem.isDisplayed();
      });
    default:
      return list;
  }
}

const Element = {

  /**
   * Stores last style (highlight)
   */
  lastStyleElement: null,

  /**
   * Stores last container|name
   */
  lastUsedLocator: null,

  /**
   * Returns the elementFinder object to interact with in protractor
  */
  getElementFinder: function (container, name) {
    // save current used container/name
    this.lastUsedLocator = [container, name];

    const locator = this.getLocator(container, name);

    if (isEmptyObject(locator)) {
      throw 'Locator element incorrect, please use {key, type, value}';
    }

    // get Element By
    const { type, value } = locator
    const elementBy = this.getElementBy(type, value)

    // wait element displayed
    return helpers.page.waitUntilElementIsPresent(elementBy)

    // return the element based on type/value
    // return this.getElements(locator.type, locator.value);

    // return myList

    // // apply filter options if included
    // if (locator.options) {
    //   var options = locator.options.split('|');

    //   _.forEach(options, function (option) {
    //     myList = applyFilterInList(myList, option);
    //   });

    //   // return filtered list
    //   return myList;
    // }

    // // default: return first element of list
    // return myList[0];
  },

  /**
   * Returns a list of elementFinders based in current findOptions
   */
  getElementFinderAll: function (container, name) {
    // save current used container/name
    this.lastUsedLocator = [container, name];

    var locator = this.getLocator(container, name);

    if (isEmptyObject(locator)) {
      throw 'Locator element incorrect, please use {key, type, value}';
    }

    // get list of elements based on type/value
    var myList = this.getElements(locator.type, locator.value);

    // apply filter options if included
    if (locator.options) {
      var options = locator.options.split('|');

      _.forEach(options, function (option) {
        myList = applyFilterInList(myList, option);
      });

      // return filtered list
      return myList;
    }

    // default: return all elements
    return myList;
  },


  /**
   * Return the element By based on locator
   */
  getElementBy: function (type, content) {
    switch (type.toLowerCase()) {
      case 'classname':
        return by.className(content);
      case 'css':
        return by.css(content);
      case 'id':
        return by.id(content);
      case 'linktext':
        return by.linkText(content);
      case 'js':
        return by.js(content);
      case 'name':
        return by.name(content);
      case 'partiallinktext':
        return by.partialLinkText(content);
      case 'tagname':
        return by.tagName(content);
      case 'xpath':
        return by.xpath(content);

      default:
        throw Error('Locator Type not found.');
    }
  },

  /**
   * Find the locator in json by container name and locator key
   */
  getLocator: function (container, name) {
    var container_list = locators.containers;
    var result = {};
    var params;

    if (name.includes(':')) {
      params = this.getParams(name);
      name = name.substring(0, name.indexOf(':'));
    }

    // search a specific locator inside containers list
    for (var i = 0; i < container_list.length; i++) {
      const { name: cname, locators } = container_list[i];

      if (cname == container) {
        for (var j = 0; j < locators.length; j++) {
          const { key } = locators[j]

          // return locator info if exists
          if (key === name) {
            const { type, value, options } = locators[j];

            if (type.toLowerCase().startsWith('p:')) {
              value = helperString.formatString(value, params);
              type = type.substring(type.indexOf(':') + 1);
            }

            // mount founded locator
            result = {
              key, type, value, options
            }

            helperInfo.logDebug(helperString.formatString('Current Locator --> using [{0}] value [{1}] options[{2}]', [result.type, result.value, result.options]));

            break;
          }
        }
        break;
      }
    }

    return result;
  },

  /**
   * Mount the paramenters list from simple text
   */
  getParams: function (text) {
    var params;

    if (text.includes(':')) {
      params = text.substring(text.indexOf(':') + 1);
      params = params.match(/([^\[\]]+)/g).toString();
      params = params.split('|');
    }

    return params;
  },

  /**
   * Highlight Element
   */
  nutHighlightElement: function (elementFinder) {
    var pattern = 'border: 3px solid red;';

    elementFinder.getAttribute('style').then(function getAttr(attribute) {
      var newStyle = attribute + pattern;

      if (this.lastStyleElement) {
        this.lastStyleElement.getAttribute('style').then(function getOldStyle(oldStyle) {
          oldStyle = oldStyle.replace(pattern, '');
          if (lastStyleValue === '') {
            console.log('entrou aqui');
            browser.executeScript('arguments[0].removeAttribute(\'style\');', this.lastStyleElement);
          } else {
            browser.executeScript('arguments[0].setAttribute(\'style\', \'{0}\');'.format(oldStyle), this.lastStyleElement);
          }
        });
      }
      browser.executeScript('arguments[0].setAttribute(\'style\', \'{0}\');'.format(newStyle), elementFinder);
      lastStyleValue = attribute;
      lastStyleElement = elementFinder;
    });
  }

};

module.exports = Element;