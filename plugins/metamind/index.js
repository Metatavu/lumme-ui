/*jshint esversion: 6 */
/* global __dirname, Promise */

(() => {
  'use strict';

  const MetamindClient = require('metamind-client');
  const _ = require('lodash');
  
  class Metamind {

    constructor(logger) {
      this.sessionsApi = new MetamindClient.SessionsApi();
      this.messagesApi = new MetamindClient.MessagesApi();
      this.apiUrl = process.env.METAMIND_APIURL;
      this.story = process.env.METAMIND_STORY;
      this.locale = process.env.METAMIND_LOCALE;
      this.timeZone = process.env.METAMIND_TIMEZONE;
      this.logger = logger;
      this.initClient();
    }

    initClient() {
      MetamindClient.ApiClient.instance.basePath = this.apiUrl;
      MetamindClient.ApiClient.instance.authentications = {
        'basicAuth': {
          type: 'basic',
          username: process.env.METAMIND_CLIENTID,
          password: process.env.METAMIND_CLIENTSECRET
        }
      };
    }

    resolveSessionId(req) {
      return req.query.sessionId || null;
    }
    
    resolveVisitor(req) {
     return _.truncate(`${req.headers['x-forwarded-for'] || 
       req.connection.remoteAddress || 
       req.socket.remoteAddress ||
       (req.connection.socket ? req.connection.socket.remoteAddress : 'Unknown')} / ${req.headers['user-agent']}`, {'length': 180 });
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
