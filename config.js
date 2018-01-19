const config = require('nconf');

const architectConfig = [
  {
    "packagePath": "architect-logger",
    "exitOnError": false,
    "transports": {
      "console": {
        "colorize": true,
        "level": "verbose"
      }
    }
  },
  "./plugins/metamind",
  "./plugins/routes"
];

if (!config.get('standalone')) {
  architectConfig.unshift({
    "packagePath": "shady-messages",
    "amqpUrl": config.get('amqp:url')
  }, "shady-worker");
}

module.exports = architectConfig;