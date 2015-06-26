var bunyan = require('bunyan');

var logger = bunyan.createLogger({
  name: 'icon-retriever',
  streams: [
    {
      level: 'debug',
      stream: process.stdout
    },
    {
      level: 'error',
      path: __dirname + '/error.log'
    }
  ]
});

module.exports = logger;
