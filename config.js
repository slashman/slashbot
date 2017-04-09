var IRCConnector = require("./classes/IRCConnector.class");
var SlackConnector = require("./classes/SlackConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");
var MongoConnector = require("./classes/persistence/MongoConnector.class");
var ConversationConnector = require("./classes/conversation/ConversationCleverbot.class");
var TwitterConnector = require("./classes/TwitterConnector.class");
var AccountabilityManager = require("./classes/AccountabilityManager.class");

// Sample Slack-thru-IRC config
// module.exports = {
// 	environment: "gusMachine",
// 	channel: "slashbottest",
// 	server: "ffoundry.irc.slack.com",
// 	botName: "lulz",
// 	password: "ffoundry.MUr0IDVbPois5VgPtbYY",
// 	connector: SlackConnector,
// 	conversation: ConversationConnector,
//     twitter: TwitterConnector,
//     twt_consumer_secret: process.env.TWT_CONSUMER_SECRET,
//     twt_consumer_key: process.env.TWT_CONSUMER_KEY,	
// 	token: process.env.FOUNDRYBOT_TOKEN, //obibot or lulzbot
// 	webapiTestToken: process.env.SLACK_WEB_API_TEST_TOKEN || '',
// 	autoReconnect: true,
// 	autoMark: true,
// 	persistence: MongoConnector,
// 	dbURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/slashbot',
//     cseId: process.env.CSE_ID,
//     cseKey: process.env.CSE_KEY,
// 	googleProjectId: process.env.GOOGLE_PROJECT_ID || '',
// 	type: process.env.type || '',
//     project_id: process.env.project_id || '',
//     private_key_id: process.env.private_key_id || '',
//     private_key: process.env.private_key || '',
//     client_email: process.env.client_email || '',
//     client_id: process.env.client_id || '',
//     auth_uri: process.env.auth_uri || '',
//     token_uri: process.env.token_uri || '',
//     auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url || '',
//     client_x509_cert_url: process.env.client_x509_cert_url || '',
// };

module.exports = {
    environment: "gusMachine",
    channel: "slashbottest",
    server: "ffoundry.irc.slack.com",
    botName: "lulz",
    password: "ffoundry.MUr0IDVbPois5VgPtbYY",
    connector: SlackConnector,
    conversation: ConversationConnector,
    twitter: TwitterConnector,
    twt_consumer_key: 'tiQdfGBs1YmWHnZNgASt9fyHA',
    twt_consumer_secret: 'Dq3tokegwau6MSH8wozltXJ8GgBZt1tc6uS9RcHvmzOyy8OmwR',
    token: 'xoxb-47967087845-iMA1zwp2jHK5geu9emPyppM6', //lulz
    // token: process.env.FOUNDRYBOT_TOKEN, //obibot or lulzbot
    webapiTestToken: process.env.SLACK_WEB_API_TEST_TOKEN || '',
    autoReconnect: true,
    autoMark: true,
    persistence: MongoConnector,
    dbURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/slashbot',
    cseId: '011337662962854559802:ylvzn8erz5g',
    // cseId: process.env.CSE_ID,
    cseKey: 'AIzaSyDpzRlGEn6im4SIHy1nAejcbB9rD9SqhHA',
    // cseKey: process.env.CSE_KEY,
    googleProjectId: process.env.GOOGLE_PROJECT_ID || '',
    type: process.env.type || '',
    project_id: process.env.project_id || '',
    private_key_id: process.env.private_key_id || '',
    private_key: process.env.private_key || '',
    client_email: process.env.client_email || '',
    client_id: process.env.client_id || '',
    auth_uri: process.env.auth_uri || '',
    token_uri: process.env.token_uri || '',
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url || '',
    client_x509_cert_url: process.env.client_x509_cert_url || '',


    accountability: AccountabilityManager,
    aqiToken: '30ba56606e67af7b9e9993df62e8071864ef9b4e'
};