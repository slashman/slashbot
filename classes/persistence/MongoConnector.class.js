var MongoSkin = require('mongoskin');
var Language = require('@google-cloud/language');

function MongoConnector(config){
	this.name = 'MongoConnector';
	this.db = MongoSkin.db(config.dbURL, {nativeParser: true});
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
}

MongoConnector.prototype = {
	init: function(){},
	createStory: function (storyName, callback){
		var PIN = Math.round(Math.random()*20000);
		var connector = this;
		this.getStory(PIN, function(story){
			if (story){
				var newPIN = Math.round(Math.random()*20000);
				connector.getStory(newPIN, this);
			} else {
				var newStory = {
					name: storyName,
					pin: PIN,
					fragments: []
				}
				connector.db.collection('stories').insert(newStory, 
					function(err, result){
						if (err) {
							console.log(err);
					    } else {
					    	console.log(result);
					    	callback(result.ops[0]);
					    }
					}
				);
			}
		})
	},
	getStory: function (storyPIN, callback){
		storyPIN = parseInt(storyPIN);
	    this.db.collection('stories').find({pin: storyPIN}).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result[0]);
			    }
		    }
	    );
	},
	getTwitterCredentials: function (user_id, callback){
		this.db.collection('creds').find({user_id: user_id}).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result[0]);
			    }
		    }
	    );
	},
	getStoriesList: function(callback){
		this.db.collection('stories').find({},{name: 1, pin: 1}).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result);
			    }
		    }
	    ); 
	},
	getMessageList: function(callback){
		var now = new Date();
		var start_of_day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		var start_of_day_timestamp = start_of_day / 1000;

		var end_of_day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
		var end_of_day_timestamp = end_of_day / 1000;
		this.db.collection('messages').find({
			ts: {
		        $gte: '' + start_of_day_timestamp,
		        $lte: '' + end_of_day_timestamp
		    }
		}).sort({
			ts: 1
		}).limit(5).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result);
			    }
		    }
	    ); 
	},
	saveStory: function(story){
		this.db.collection('stories').update({_id: story._id}, {$set:{fragments:story.fragments}}, function(err, result) {
			if (err) {
				console.log(err);
		    }
		});
	},
	saveMessage: function(message){
		this.languageClient = new Language({
            projectId: projectId,
            credentials: creds
        });
        var that = this;
        // Detects the sentiment of the text
        console.log(message);
        var doc = that.languageClient.document(message.text);
    	doc.detectSentiment(function(err, sentiment) {
            if (err) {
                console.log(err);
                return;
            };
            that.db.collection('messages').insert(message, 
				function(err, result){
					if (err) {
						console.log(err);
				    } else {
				    	message.sentiment = sentiment;
				    	console.log('[PERSISTENCE] Inserted message: ', message.text);
				    }
				}
			);
            
        });		
	},
	saveOrUpdateUser: function(user){
		this.db.collection('users').update(
			{id: user.id},
			user,
			{upsert:true}, 
			function(err, result){
				if (err) {
					console.log(err);
			    } else {
			    	console.log('[PERSISTENCE] Inserted or updated user with name: ', user.name);
			    }
			}
		);
	},
	get_user_by_id: function(id, options) {
		this.db.collection('users').find({
			id: id
		},
		function(err, result){
			if (err) {
				options.err(err);
		    } else {
		    	options.success(result)
		    }
		});	
	}
}

module.exports = MongoConnector;
