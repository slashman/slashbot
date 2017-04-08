var Language = require('@google-cloud/language');

function ConversationCleverbot(config) {
    // TODO: move this to config
    this.name = 'ConversationCleverbot';
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
    },
    askSkynet: function (question, callback){
        // Instantiates a client
        this.languageClient = new Language({
            projectId: projectId,
            credentials: creds
        });
        var that = this;
        // Detects the sentiment of the text
        var doc = that.languageClient.document(question);
        doc.detectSentiment(function(err, sentiment) {
            if (err) {
                console.log(err);
                return;
            };
            callback("\r```\r" + JSON.stringify(sentiment, null, 4) + "\r```");
        });        
   
    }

};

module.exports = ConversationCleverbot;