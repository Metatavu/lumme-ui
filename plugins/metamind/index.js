/*jshint esversion: 6 */
/* global __dirname, Promise */

(() => {
  'use strict';

  const config = require('nconf');
  const MetamindClient = require('metamind-client');
  
  class Metamind {

    constructor(logger) {
      this.sessionsApi = new MetamindClient.SessionsApi();
      this.messagesApi = new MetamindClient.MessagesApi();
      this.apiUrl = config.get('metamind:apiUrl'); //options.apiUrl;
      this.apiKey = config.get('metamind:apiKey'); //options.apiKey;
      this.story = config.get('metamind:story');  //options.story;
      this.locale = config.get('metamind:locale'); // 'fi';
      this.timeZone = config.get('metamind:timeZone'); // 'Europe/Helsinki';
      this.logger = logger;
      this.initClient();
    }

    initClient() {
      MetamindClient.ApiClient.instance.basePath = this.apiUrl;
    }

    resolveSessionId(req) {
      return req.query.sessionId || null;
    }
    
    resolveVisitor(req) {
     return req.headers['x-forwarded-for'] || 
       req.connection.remoteAddress || 
       req.socket.remoteAddress ||
       (req.connection.socket ? req.connection.socket.remoteAddress : 'Unknown');
    }

    async sendMessage(req, res) {
      let sessionId = this.resolveSessionId(req);
      if (!sessionId) {
        sessionId = await this.getSessionId(req);
      }
      
      const message = MetamindClient.Message.constructFromObject({
        sessionId: sessionId,
        content: req.body.message
      });

      return this.messagesApi.createMessage(message);
    }

    getSessionId(req) {
      const payload = MetamindClient.Session.constructFromObject({
        story: this.story,
        locale: this.locale,
        timeZone: this.timeZone,
        visitor: this.resolveVisitor(req)
      });

      return this.sessionsApi.createSession(payload)
        .then((session) => {
          return session.id;
        });
    }
  }

  module.exports = (options, imports, register) => {
    const logger = imports['logger'];
    
    const metamind = new Metamind(logger);
    register(null, {
      'metamind-client': metamind
    });
  };

})();
