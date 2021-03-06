/*jshint esversion: 6 */
/* global __dirname, Promise */

(() => {
  'use strict';
  
  const _ = require('lodash');
  const fs = require('fs');
  const moment = require('moment');
  const request = require('request');
  const uaParser = require('ua-parser-js');

  class Routes {
    
    constructor (logger, metamind) {
      this.logger = logger;
      this.metamind = metamind;
    }
    
    getIndex(req, res) {
      fs.readFile(__dirname+'/../../lumme.svg', 'utf8', (err, svgData) => {
        if (err) {
          this.logger.error(err);
          res.status(500).send(err);
          return;
        }
        
        const googleAnalytics = process.env.GOOGLE_ANALYTICS || null; 
        const ua = uaParser(req.headers['user-agent']);
        const useSvg = req.query.useSvg !== 'false' && ua && ua.browser && ua.browser.name !== "Edge" && ua.browser.name !== "IE";
        const frameless = req.query.frameless ? req.query.frameless === 'true' : false;
        const noHeader = req.query.noHeader ? req.query.noHeader === 'true' : false;
        res.render('index', {
          svgData: svgData,
          frameless: frameless,
          noHeader: noHeader,
          useSvg: useSvg,
          googleAnalytics: googleAnalytics
        });
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
