function StoryManager(config){
    this.name = 'StoryManager';
    this.client = null;
    this.config = config;
    this.channel = config.channel;
    this.bot = null;
}

StoryManager.prototype = {

    init (slashbot) {
        this.bot = slashbot;
        this.currentStoryFragments = [];
        return this;
    },

    // This function determines which lines
    trigger: function(from, text) {
        if (text.indexOf('story:') === 0) {
            const storyText = text.substring('story:'.length);
            this.addStoryPart(from.name, storyText);
        } else if (text.indexOf('correct:') === 0) {
            const storyText = text.substring('correct:'.length);
            this.correctStoryPart(from.name, storyText);
        } else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteAcceptResponses, text)) {
            this.manageInvitation(true);
        } else if (this.invitationExtended && from.name === this.currentPlayer && contains(this.inviteDeclineResponses, text)) {
            this.manageInvitation(false);
        }
    },

    newStory: function(text){
        var storyName = text.substr(text.indexOf("new story")+"new story".length+1);
        if (!storyName || storyName.trim() === ''){
            this.bot.share('I need a name for the story');
            return;
        }
        var this_ = this;

        this.bot.persistence.createStory(storyName, function(story){
            if (!story) throw 'story was not created';

            this_.story = story;
            this_.bot.share('Let\'s create the story "'+this_.story.name+'"');
            this_.currentStoryFragments = this_.story.fragments;
        });
    },

    saveStory: function(){
        this.bot.persistence.saveStory(this.story);
    },

    setStory: function (text){
        var storyPIN = text.substr(text.indexOf("set story")+"set story".length+1);
        if (!storyPIN || storyPIN.trim() === ''){
            this.bot.share('I need a PIN for the story');
            return;
        }
        var this_ = this;
        this.bot.persistence.getStory(storyPIN,
            function (story){
                this_.story = story;
                if (!this_.story){
                    this_.bot.share('I don\'t know a story with PIN ('+storyPIN+')');
                    return;
                }
                this_.bot.share('Let\'s continue the story "'+this_.story.name+'"');
                this_.currentStoryFragments = this_.story.fragments;
            }
        );
    },

    addStoryPart: function (from, storyText){
        if (!this.story){
            this.bot.share("There's no story yet, you can ask me to create one using \"new story\"");
            this.listStories();
            return;
        }
        var storypart = {
            author: from,
            story: storyText
        };
        this.currentStoryFragments.push(storypart);
        this.saveStory();
        this.bot.share("Added " +  from + "'s contribution.");
    },

    correctStoryPart: function (from, storyText){
        if (this.currentStoryFragments.length == 0){
            this.bot.say(from, "The current story is empty.");
            return;
        }
        var storypart = this.currentStoryFragments[this.currentStoryFragments.length-1];
        if (storypart.author === from){
            storypart = {
                author: from,
                story: storyText
            };
            this.currentStoryFragments[this.currentStoryFragments.length-1] = storypart;
            this.saveStory();
            this.bot.say(from, "Corrected.");
        } else {
            this.bot.say(from, "Sorry, only "+storypart.author+" can correct his fragment.");
        }
    },

    listStories: function (text){
        var this_ = this;
        this.bot.persistence.getStoriesList(
            function(stories){
                if (!stories || stories.length == 0){
                    this_.bot.share('I know no stories. Create one with `bot new story` ');
                    return;
                }
                this_.bot.share('I know these stories, use `bot set story <PIN>` to choose one.');
                for (var i = 0; i < stories.length; i++){
                    var story = stories[i];
                    this_.bot.share(story.pin+" - "+story.name);
                }
            }
        );
    },

    fullStory: function(who){
        if (this.currentStoryFragments.length == 0){
            this.bot.share("The current story has not begun");
            return;
        }

        var frags = [];
        for (var i = 0; i < this.currentStoryFragments.length; i++){
            frags.push(this.currentStoryFragments[i].story);
        }

        var chunk_size = 10;
        var chunked_frags = []; //array of arrays
        while (frags.length > 0) {
            chunked_frags.push(frags.splice(0, chunk_size).join(" "));
        }

        if (!who){
            this.bot.share("This is the story so far: ");
        } else {
            this.bot.say(who, "This is the story so far: ");
        }
        for (var i = 0; i < chunked_frags.length; i++){
            if (!who){
                this.bot.share(chunked_frags[i]);
            } else {
                this.bot.say(who, chunked_frags[i]);
            }
        }
    },

    manageInvitation: function(accepted) {
        this.invitationExtended = false;

        if(!accepted) {
            this.bot.share("Well that sucks...");
            console.log(this.currentPlayer + " has declined the invitation to write. Moving on");

            if (this.turnModes[this.turnMode] === 'roundRobin' && this.lastTurn >= this.bot.players.length) {
                this.lastTurn = 0;
                this.bot.share("Round complete.");
            }
            else {
                this.nextTurn();
            }
        } else {
            this.bot.share("Alright! That's the spirit. Take it away, @" + this.currentPlayer + "!");
            console.log(this.bot.currentPlayer + " has accepted the invitation to write.");
        }

    },

    currentTurn: function(){
        this.bot.share("@" + this.currentPlayer + " is working on the story.");
    },

    changeTurnMode: function(){
        //Cancel any invitations
        var invitationMessage = "";

        if(this.invitationExtended) {
            this.invitationExtended = false;
            invitationMessage = "Invitation to @" + this.currentPlayer + " cancelled. ";
        }

        this.turnMode++;
        if(this.turnMode == this.turnModes.length)
            this.turnMode = 0;
        this.bot.share(invitationMessage + "New turn mode: " + this.turnModes[this.turnMode] + ".");
    },

    nextTurn: function(){
        if(this.invitationExtended) {
            this.bot.share("Still no word from @" + this.currentPlayer + "...");
            this.invitationExtended = false;
            return;
        }

        var playerIndex = 0;
        var turnMode = this.turnModes[this.turnMode];
        console.log("Choosing among " + this.bot.players.length + " players...");

        if(turnMode === 'roundRobin'){
            playerIndex = this.lastTurn;
            this.lastTurn++;
            this.bot.share(turnMode+": I suggest @"+this.bot.players[playerIndex]+" goes next. What say you?");
            this.invitationExtended = true;
        } else if (turnMode === 'random'){
            playerIndex = Math.floor(Math.random() * this.bot.players.length);
            this.bot.share(turnMode+": I suggest @"+this.bot.players[playerIndex]+" goes next. What say you?");
            this.invitationExtended = true;
        }
        console.log("Players " + this.bot.players);
        console.log("Chose player " + playerIndex);
        this.bot.currentPlayer = this.bot.players[playerIndex];
    },

    help: function (who){
        this.bot.say(who, "[story:] Adds a new fragment to the story");
        this.bot.say(who, "[correct:] Corrects the last fragment of the story");
        this.bot.say(who, "[bot latest] Gets the latest fragment");
        this.bot.say(who, "[bot story so far] Gets the complete story.");
        this.bot.say(who, "[bot next turn] Suggest who should do the next turn.");
        this.bot.say(who, "[bot current turn] Shows the player whose turn it is.");
        this.bot.say(who, "[bot list stories] Shows the stories known by the bot.");
        this.bot.say(who, "[bot new story] Creates a new story and sets it as current.");
        this.bot.say(who, "[bot set story] Sets a story as the current one..");
        this.bot.say(who, "[bot about] Gets some information about the slashbot.");
        this.bot.say(who, "[yes, accept, I'll go, alright, sure] to accept an invitation to write");
        this.bot.say(who, "[no, decline, pass, busy, meeting, working] to decline an invitation to write");
    }
}

module.exports = StoryManager;
