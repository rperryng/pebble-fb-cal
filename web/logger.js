var fs = require('fs');
var winston = require('winston');

var logDirectory = __dirname + '/logs';
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

winston.emitErrs = true;

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: 'logs/all-logs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5000000, // 5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

logger.morganStream = {
  write: function (message, encoding) {
    // slice out the newline character morgan appends to its logs
    logger.info('morgan', message.slice(0, -1));
  }
};

module.exports = logger;
