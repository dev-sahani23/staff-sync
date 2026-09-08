const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to the project directory.
  // This ensures the chromium binary is cached by Render during deployment.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
