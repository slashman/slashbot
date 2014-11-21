var config = {
	channels: ["#fantasy-stories"],
	server: "irc.freenode.net",
	botName: "slashbot5"
};

var irc = require("irc");

var story = new Array();

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

bot.addListener("join", function(channel, who) {
	if (who.indexOf("slash") > -1)
		return;
	bot.say(channel, who + ", welcome to the channel. I am the slashbot, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
});

bot.addListener("message", function(from, to, text, message) {
	if (!text)
		return;
	if (text.indexOf("story:") == 0){
		var storyText = text.substring("story:".length);
		var storypart = {
			author: from,
			story: storyText
		};
		story.push(storypart);
		return;
	} else if (text.indexOf("slashbot") == 0){
		if (text.indexOf("introduce yourself") > -1){
			bot.say(config.channels[0], "I am the slashbot, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
		} else if (text.indexOf("joke") > -1){
			bot.say(config.channels[0], "I am not a joker, I am an historian.");	
		} else	if (text.indexOf("Who is your creator?") > -1){
			bot.say(config.channels[0], "The almighty Slash, of course.");	
		} else if (text.indexOf("latest") > -1){
			if (story.length == 0){
				bot.say(config.channels[0], "There's no story yet.");
				return;
			}
			var storypart = story[story.length-1];
			bot.say(config.channels[0], "Latest part of the story was from "+storypart.author+", he added: \""+storypart.story+"\"");
		} else if (text.indexOf("story so far") > -1){
			if (story.length == 0){
				bot.say(config.channels[0], "There's no story yet.");
				return;
			}
			var fullStory = "";
			for (var i = 0; i < story.length; i++){
				var storypart = story[i];
				fullStory += storypart.story + ".\n";
			}
			bot.say(config.channels[0], "The story so far:\n"+fullStory);
		} else {
			bot.say(config.channels[0], "I am a primitive bot, unable to honor your complex request.");
		}
	}
});
