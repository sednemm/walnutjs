
const fs = require('fs-plus');
const path = require('path');
const Cucumber = require('cucumber');
const program = require('commander');
const { version, description } = require('../package.json');

// set default configuration
const config = {
  walnut: {
    parametersPath: '',
    locatorsPath: '/Users/mmendesas/Documents/mdocs/walnutjs/example/locators'
  },
  cucumber: {
    steps: './steps',
    timeout: 15000,
    features: '/Users/mmendesas/Documents/mdocs/walnutjs/example/features/sample.feature',
  },
  selenium: {
    browser: 'chrome',
    browserTeardownStrategy: 'always',
    remoteURL: 'http://localhost:4444/wd/hub',
    caps: {
      browserName: 'chrome',
      chromeOptions: {
        // args: ['--headless', '--disable-gpu'] //headless
        args: ['start-maximized', 'disable-extensions']
      },
    }
  },
  reports: './reports',
  noScreenshot: false,

};

// start the CLI options
program
  .version(version)
  .description(description)
  .option('-c, --config <path>', 'path to JSON config file')
  .parse(process.argv);

// read config from file
const configFileName = path.resolve(process.cwd(), 'walnutjs.json');
const configPath = program.config || configFileName

if (fs.isFileSync(configPath)) {
  config = Object.assign(config, require(configPath));
}

// set config globally
global['config'] = config;

// browser name globally
global.browser = config.selenium.browser;
global.browserTeardownStrategy = config.selenium.browserTeardownStrategy;

// used within world.js to output reports
global.reportsPath = path.resolve(config.reports);
if (!fs.existsSync(config.reports)) {
  fs.makeTreeSync(config.reports);
}

// set the default timeout
global.DEFAULT_TIMEOUT = global.DEFAULT_TIMEOUT || config.cucumber.timeout;

// rewrite command line switches for cucumber
process.argv.splice(2, 100);

// 1 define cucumber output format
// add switch to tell cucumber to produce json report files
process.argv.push('-f');
process.argv.push('progress');
process.argv.push('-f');
process.argv.push('json:' + path.resolve(__dirname, global.reportsPath, 'cucumber-report.json'));

// 2 define the required scripts
// add cucumber world as first required script (this sets up the globals)

process.argv.push('-r');
process.argv.push(path.resolve(__dirname, './support/world.js'));

process.argv.push('-r');
process.argv.push(path.resolve(__dirname, './step_defs'));

// add path to import custom step definitions
process.argv.push('-r');
process.argv.push(path.resolve(config.cucumber.steps));

// process.argv.push(path.resolve(__dirname, '../example/features/**/*.feature'));
// add path to import custom features
process.argv.push(config.cucumber.features)

// console.log('my-args: ', process.argv)

//
// execute cucumber
//
const cucumberInfo = {
  argv: process.argv,
  cwd: process.cwd(),
  stdout: process.stdout
}

const cucumberCli = new Cucumber.Cli(cucumberInfo);

cucumberCli.run()
  .then((succeeded) => {
    const code = succeeded.success ? 0 : 1;
    exitNow = () => {
      process.exit(code);
    }

    if (process.stdout.write('')) {
      exitNow();
    }
    else {
      // write() returned false, kernel buffer is not empty yet...
      process.stdout.on('drain', exitNow);
    }
  })
  .catch((error) => {
    console.error(`\n[ walnutjs ] -> ${error.stack}`)
  })
