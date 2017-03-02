var Cleverbot = require("cleverbot.io");
var Language = require('@google-cloud/language');

function ConversationCleverbot(config) {
    // TODO: move this to config
    this.name = 'ConversationCleverbot';
    this.bot = new Cleverbot("FzKyfsrPXRNJa36w", "vBoxMNdPkQkoaiwKnchIzZ0fgFt0LMqU");
    // Your Google Cloud Platform project ID
    projectId = config.googleProjectId;

    // Instantiates a client
    this.languageClient = new Language({
        projectId: projectId
    });   
    
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
            language.detectEntities(question, function(err, entities) {
                for (var property in entities) {
                    if (object.hasOwnProperty(property)) {
                        response += "\rEntity: \r```\r" + property + "\r```";
                    }
                }
                // Detects the sentiment of the text
                var doc = language.document(question);
                languageClient.detectSentiment(function(err, sentiment) {
                    callback(response += "\r```\r" + sentiment + "\r```");
                });
            });
            
        });        
    }

};

module.exports = ConversationCleverbot;