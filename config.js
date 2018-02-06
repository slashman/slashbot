const SlackConnector = require('./classes/SlackConnector.class');
const MongoConnector = require('./classes/persistence/MongoConnector.class');
const ConversationConnector = require('./classes/conversation/ConversationCleverbot.class');
const TwitterConnector = require('./classes/TwitterConnector.class');
const AccountabilityManager = require('./classes/AccountabilityManager.class');
const StoryManager = require('./classes/StoryManager.class');

// var localConfig = require('.local-config')

// Sample Slack-thru-IRC config
module.exports = {
    environment: 'gusMachine',
    channel: 'slashbottest',
    server: 'ffoundry.irc.slack.com',
    botName: 'lulz',
    password: 'ffoundry.MUr0IDVbPois5VgPtbYY',
    Connector: SlackConnector,
    Conversation: ConversationConnector,
    twitter: TwitterConnector,
    storyManager: StoryManager,
    twt_consumer_secret: process.env.TWT_CONSUMER_SECRET,
    twt_consumer_key: process.env.TWT_CONSUMER_KEY,
    token: process.env.FOUNDRYBOT_TOKEN, // obibot or lulzbot
    webapiTestToken: process.env.SLACK_WEB_API_TEST_TOKEN || '',
    autoReconnect: true,
    autoMark: true,
    Persistence: MongoConnector,
    dbURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/slashbot',
    cseId: process.env.CSE_ID,
    cseKey: process.env.CSE_KEY,
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
    aqiToken: process.env.aqiToken,

};
