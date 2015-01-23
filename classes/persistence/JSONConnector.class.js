var fs = require("fs");

function JSONConnector(){
	
}

JSONConnector.prototype = {
	init: function(){
		if (fs.existsSync("data.json")) {
			fs.readFile("data.json", "utf8", function (err, data) {
				if (err) throw err;
				this.masterData = JSON.parse(data);
			});
		} else {
			this.masterData = {
				currentPIN: 1,
				stories: new Array()
			}
			this._saveAll();
		}
	},
	createStory: function (storyName){
		var newStory = {
			name: storyName,
			pin: this.masterData.currentPIN++,
			fragments: []
		}
		this.masterData.stories.push(newStory);
		this._saveAll();
		return newStory;
	},
	getStory: function (storyPIN){
		for (var i = 0; i < this.masterData.stories.length; i++){
			var story = this.masterData.stories[i];
			if (story.pin == storyPIN)
				return story;
		}
		return false;
	},
	getStoriesList: function(){
		var ret = [];
		for (var i = 0; i < this.masterData.stories.length; i++){
			var story = this.masterData.stories[i];
			var storyData = {
				name: story.name,
				pin: story.pin
			};
			ret[i] = storyData
		}
		return ret;
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