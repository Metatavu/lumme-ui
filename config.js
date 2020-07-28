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

module.exports = architectConfig;