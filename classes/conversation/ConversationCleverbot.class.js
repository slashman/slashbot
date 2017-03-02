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
        projectId: projectId,
        credentials: {
            type: config.type,
            project_id: config.project_id,
            private_key_id: config.private_key_id,
            private_key: config.private_key,
            client_email: config.client_email,
            client_id: config.client_id,
            auth_uri: config.auth_uri,
            token_uri: config.token_uri,
            auth_provider_x509_cert_url: config.auth_provider_x509_cert_url,
            client_x509_cert_url: config.client_x509_cert_url
        }
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
        console.log("asking ", question);
        this.bot.askSkynet(question, callback, function (err, response) {
            if (err) throw err;
            console.log("asked ", question);
            language.detectEntities(question, function(err, entities) {
                if (err) throw err;
                for (var property in entities) {
                    if (object.hasOwnProperty(property)) {
                        response += "\rEntity: \r```\r" + property + "\r```";
                        console.log(response);
                    }
                }
                // Detects the sentiment of the text
                var doc = language.document(question);
                languageClient.detectSentiment(function(err, sentiment) {
                    if (err) throw err;
                    console.log("callback with: ", response);
                    callback(response += "\r```\r" + sentiment + "\r```");

                });
            });
            
        });        
    }

};

module.exports = ConversationCleverbot;