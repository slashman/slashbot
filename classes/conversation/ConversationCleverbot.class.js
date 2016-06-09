var cleverbot = require("cleverbot.io");

function ConversationCleverbot(config){
    // TODO: move this to config
    this.name = 'ConversationCleverbot';
    this.bot = new cleverbot("FzKyfsrPXRNJa36w", "vBoxMNdPkQkoaiwKnchIzZ0fgFt0LMqU");
}

ConversationCleverbot.prototype = {
    init: function(){
        this.bot.setNick("cleverfoundry");
        this.bot.create(function (err, session) {
          // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you

          // Woo, you initialized cleverbot.io.  Insert further code here
        });
    },
    ask: function (question, callback){
        var that = this;
        this.bot.ask(question, callback, function (err, response) {
            if (err) throw err;
            callback(response);
        });        
    }

};

module.exports = ConversationCleverbot;