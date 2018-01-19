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
    
    constructor (logger, metamind) {
      this.logger = logger;
      this.metamind = metamind;
    }
    
    getIndex(req, res) {
      const svgData = fs.readFileSync('lumme2.svg', { encoding: 'utf8' });
      
      res.render('index', {
        svgData: svgData
      });
    }
    
    async getAjaxMessage(req, res) {
      try {
        res.send(await this.metamind.sendMessage(req, res));
      } catch(err) {
        this.logger.error(err);
        res.status(500).send(err);
      }
    }
    
    register(app) {

      // Navigation     
      
      app.get("/", this.getIndex.bind(this));
 
      // Ajax    
      
      app.post("/ajax/message", this.getAjaxMessage.bind(this));
    }
    
  };

  module.exports = (options, imports, register) => {
    const logger = imports['logger'];
    const metamind = imports['metamind-client'];
    
    const routes = new Routes(logger, metamind);
    register(null, {
      'lumme-ui-routes': routes
    });
  };

})();
