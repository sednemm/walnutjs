// eslint-disable-next-line no-undef
const { logger } = helpers;
const { Given } = require('cucumber');
const api = require('../../support/api/client');

/**
 * User prints the current body content (Req|Res)
 */
Given(/^\(api\) user prints the current (REQUEST|RESPONSE) body content$/, (type) => {
  const content = type === 'REQUEST' ? api.requestContent : api.response.raw_body;
  logger.info(`[${type}] content:\n${content}\n`);
});

/**
 * Define a value for request headers [Accept, Content-Type]
 */
Given(/^\(api\) user will send and accept (XML|JSON|HTML)$/, (type) => {
  let accept = 'application/json';
  let contentType = 'application/json';

  switch (type) {
    case 'XML':
      accept = 'application/xml';
      contentType = 'application/xml';
      break;

    case 'HTML':
      accept = 'text/html';
      contentType = 'application/x-www-form-urlencoded';
      break;

    default:
      break;
  }
  api.addHeader('Accept', accept);
  api.addHeader('Content-Type', contentType);
});
