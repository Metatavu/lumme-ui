/*jshint esversion: 6 */
/* global __dirname, Promise */

(() => {
  'use strict';
  
  const _ = require('lodash');
  const fs = require('fs');
  const moment = require('moment');
  const config = require('nconf');
  const request = require('request');
  
  class Routes {
    
    constructor (logger) {
      this.logger = logger;
    }
    
    getIndex(req, res) {
      const svgData = fs.readFileSync('lumme2.svg', { encoding: 'utf8' });
      
      res.render('index', {
        svgData: svgData
      });
    }
    
    register(app) {
      // Navigation     
      
      app.get("/", this.getIndex.bind(this));
    }
    
  };

  module.exports = (options, imports, register) => {
    const logger = imports['logger'];
    
    const routes = new Routes(logger);
    register(null, {
      'lumme-ui-routes': routes
    });
  };

})();
