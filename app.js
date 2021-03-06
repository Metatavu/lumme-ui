/* jshint esversion: 6 */
/* global __dirname */
(() => {
  'use strict';
  
  const architect = require('architect');
  const http = require('http');
  const path = require('path');
  const express = require('express');
  
  const i18n = require('i18n-x');
  const bodyParser = require('body-parser');

  const options = require(__dirname + '/options');
  const architectConfig = architect.loadConfig(__dirname + '/config.js');
  
  if (!options.isOk()) {
    options.printUsage();
    process.exitCode = 1;
    return;
  }
  
  process.on('unhandledRejection', function(error, promise) {
    console.error("UNHANDLED REJECTION", error.stack);
  });
  
  architect.createApp(architectConfig, (err, architectApp) => {
    if (err) {
      console.error(err);
      process.exitCode = 1;
      return;
    }
    
    const routes = architectApp.getService('lumme-ui-routes');
    const logger = architectApp.getService('logger');
    const port = options.getOption('port');

    const app = express();
    const httpServer = http.createServer(app);
    
    httpServer.listen(port, () => {
      logger.info(`Http server listening to port: ${port}`);
    });
    
    if (process.env.GOOGLE_ANALYTICS) {
      app.locals.googleAnalytics = process.env.GOOGLE_ANALYTICS;
    }
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended : true
    }));
    
    app.use(i18n({
      locales: ['fi', 'en']
    }));
    
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
    
    routes.register(app);
  });

})();