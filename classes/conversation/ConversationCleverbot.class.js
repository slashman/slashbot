var Cleverbot = require("cleverbot.io");
var Language = require('@google-cloud/language');

function ConversationCleverbot(config) {
    // TODO: move this to config
    this.name = 'ConversationCleverbot';
    this.cleverbot = new Cleverbot("FzKyfsrPXRNJa36w", "vBoxMNdPkQkoaiwKnchIzZ0fgFt0LMqU");
    // Your Google Cloud Platform project ID
    projectId = config.googleProjectId;
    creds = {
        "type": config.type,
        "project_id": config.project_id,
        "private_key_id": config.private_key_id,
        "private_key": config.private_key.replace(/\\n/g, '\n'),
        "client_email": config.client_email,
        "client_id": config.client_id,
        "auth_uri": config.auth_uri,
        "token_uri": config.token_uri,
        "auth_provider_x509_cert_url": config.auth_provider_x509_cert_url,
        "client_x509_cert_url": config.client_x509_cert_url
    }
    // Instantiates a client
    this.languageClient = new Language({
        projectId: projectId,
        credentials: creds
    });
}

ConversationCleverbot.prototype = {
    init: function(){
        this.cleverbot.setNick("cleverfoundry");
        this.cleverbot.create(function (err, session) {
          // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you

          // Woo, you initialized cleverbot.io.  Insert further code here
        });
    },
    askSkynet: function (question, callback){
        // Instantiates a client
        this.languageClient = new Language({
            projectId: projectId,
            credentials: creds
        });
        var that = this;
        this.cleverbot.ask(question, function (err, response) {
            if (err) throw err;
            callback(response);
        });     

        // Detects the sentiment of the text
        var doc = that.languageClient.document(question);
        doc.detectSentiment(function(err, sentiment) {
            if (err) {
                console.log(err);
                return;
            };
            callback("\r```\r" + JSON.stringify(sentiment, null, 4) + "\r```");
        });

        // Parse the syntax of the document. 
        // doc.annotate(function(err, annotations) {
        //     if (err) throw err;
        //     callback("\r```\r" + JSON.stringify(annotations, null, 4) + "\r```\r")
        // });

        // that.languageClient.detectEntities(question, function(err, entities) {
        //     if (err) throw err;
        //     callback("\r```\r" + JSON.stringify(entities, null, 4) + "\r```\r")
        // });
   
    }

};

module.exports = ConversationCleverbot;