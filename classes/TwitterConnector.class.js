var Twitter = require('twitter');

function TwitterConnector(config) {
    // TODO: move this to config
    this.consumer_key = config.twt_consumer_key,
    this.consumer_secret = config.twt_consumer_secret    
}

TwitterConnector.prototype = {
    
    init: function(){},
    
    tweet: function (creds, who, tweet, callback){
        var this_ = this;
        var client = new Twitter({
            consumer_key: this_.consumer_key,
            consumer_secret: this_.consumer_secret,
            access_token_key: creds.access_token_key,
            access_token_secret: creds.access_token_secret            
        });
        client.post('statuses/update', {status: tweet}, function(error, tweet, response) {
            if (!error) {
                callback(tweet);
            }
        });
    }
};

module.exports = TwitterConnector;