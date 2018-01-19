/* global moment */

(() => {
  'use strict';
  
  $.widget("custom.metamind", {
    
    options: {
      sessionId: null
    },
    
    _create : function() {
      this.element.on('click', '.send-message-btn', this._onSendMessageClick.bind(this));
      this.element.on('click', '.quick-message-btn', this._onQuickMessageClick.bind(this));
      $(document).on('keydown', this._onKeydown.bind(this));
      
      this.element.find('.bot-typing').hide();
      this.element.find('.user-date-input').flatpickr({
        "locale": "fi",
        "dateFormat": "d.m.Y",
        "allowInput": false
      });

      this.element.find('.send-message-btn').attr('disabled', 'disabled');
      this._postMessage('INIT');
    },
    
    sendMessage: function(text) {
      const disabled = this.element.find('.send-message-btn').attr('disabled');
      const message = text || this.element.find('.user-text-input').val() || this.element.find('.user-date-input').val();

      if (!message.trim()) {
        return;
      }

      if (typeof disabled !== typeof undefined && disabled !== false) {
        return;
      }

      this.element.find('.bot-typing').show();
      this.element.find('.user-text-input').val('');
      this.element.find('.send-message-btn').attr('disabled', 'disabled');
      this.element.find('.bot-hint-text').text('');
      this.element.find('.quick-responses').empty();
      this.element.find('.discussion-container').append(
        `<div class="user-response">
          ${message}
        </div>`  
      );

      this.element.find('.chat-container')[0].scrollTop = this.element.find('.chat-container')[0].scrollHeight;
      this._postMessage(message);
    },
    
    _postMessage: function(message) {
       $.ajax({
         method: 'POST',
         url: this._createUrl(),
         dataType: 'json',
         data: { message: message },
         success: this._onBotResponse.bind(this),
         error: this._onBotError.bind(this)
       });
    },
    
    _createUrl() {
      return this.options.sessionId ? `/ajax/message?sessionId=${encodeURIComponent(this.options.sessionId)}` : '/ajax/message';
    },
    
    _onBotError: function(jqXHR, textStatus, errorThrown) {
      alert('Error communicating with bot');
    },
    
    _onBotResponse: function(data) {
      this.options.sessionId = data.sessionId;

      this.element.find('.bot-typing').hide();
      this.element.find('.send-message-btn').removeAttr('disabled');
      this.element.find('.user-text-input').val('');
      this.element.find('.user-text-input').hide();
      this.element.find('.user-date-input').hide();

      for (var i = 0; i < data.quickResponses.length; i++) {
        this.element.find('.quick-responses').append(`<button class="btn btn-lumme btn-sm quick-message-btn">${data.quickResponses[i]}</button>`);
      }

      const parsedResponse = $('<pre>').html(data.response);
      const type = parsedResponse.find('input[name="metamind-hint-type"]').val() || 'text';

      if (type === 'date') {
        const dateAfterParam = parsedResponse.find('input[name="metamind-hint-date-after"]').val();
        let dateAfter = null;
        if (dateAfterParam) {
          const dateAfterParts = dateAfterParam.split(' ');
          if (dateAfterParts.length === 3) {       
            if (dateAfterParts[0] === 'add') {
              dateAfter = moment().add(dateAfterParts[1], dateAfterParts[2]).toDate();
            } else if (dateAfterParam[0] === 'subtract') {
              dateAfter = moment().subtract(dateAfterParts[1], dateAfterParts[2]).toDate();
            }
          }
        }

        const flatpickrInstance = this.element.find('.user-date-input')[0]._flatpickr;
        flatpickrInstance.set('minDate', dateAfter ? dateAfter : null);
      };

      switch (type) {
        case 'text':
          this.element.find('.user-text-input').show();
        break;
        case 'date':
          this.element.find('.user-date-input').show();
        break;
      }

      this.element.find('.bot-hint-text').text(data.hint || '');

      this.element.find('.discussion-container').append(
        `<div class="bot-response">
          ${data.response}
        </div>`  
      );

      this.element.find('.chat-container')[0].scrollTop = this.element.find('.chat-container')[0].scrollHeight;
    },
    
    _onSendMessageClick: function(event) {
      this.sendMessage();
    },
    
    _onQuickMessageClick: function(event) {
      const message = $(event.target).closest('.quick-message-btn').text();
      this.sendMessage(message);
    },
    
    _onKeydown: function(event) {
      if (event.keyCode === 13) {
        this.sendMessage();
      }
    }
  });
  
  $(document).ready(() => {
    $(document).metamind();  
  });
  
})();