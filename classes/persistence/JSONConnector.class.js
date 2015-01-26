var fs = require("fs");

function JSONConnector(){
	this.name = 'JSONConnector';
}

JSONConnector.prototype = {
	init: function(){
		var connector = this;
		if (fs.existsSync("data.json")) {
			fs.readFile("data.json", "utf8", function (err, data) {
				if (err) 
					throw err;
				connector.masterData = JSON.parse(data);
			});
		} else {
			this.masterData = {
				currentPIN: 1,
				stories: new Array()
			}
			this._saveAll();
		}
	},
	createStory: function (storyName, callback){
		var newStory = {
			name: storyName,
			pin: this.masterData.currentPIN++,
			fragments: []
		}
		this.masterData.stories.push(newStory);
		this._saveAll();
		callback(newStory);
	},
	getStory: function (storyPIN, callback){
		for (var i = 0; i < this.masterData.stories.length; i++){
			var story = this.masterData.stories[i];
			if (story.pin == storyPIN){
				callback(story);
				return;
			}
		}
		callback(false);
	},
	getStoriesList: function(callback){
		var ret = [];
		for (var i = 0; i < this.masterData.stories.length; i++){
			var story = this.masterData.stories[i];
			var storyData = {
				name: story.name,
				pin: story.pin
			};
			ret[i] = storyData
		}
		callback(ret);
	},
	saveStory: function(story){
		this._saveAll();
	},
	_saveAll: function(){
		var serializedData = JSON.stringify(this.masterData);
		console.log(serializedData);
		fs.writeFile('data.json', serializedData, function (err) {
	        if (err) throw err;
	        console.log('It seems as if the file was saved, we shall see.');
	    });
	}
}

module.exports = JSONConnector;