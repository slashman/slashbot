const SlackConnector = require('./classes/SlackConnector.class');
const MongoConnector = require('./classes/persistence/MongoConnector.class');
const ConversationConnector = require('./classes/conversation/ConversationCleverbot.class');
const TwitterConnector = require('./classes/TwitterConnector.class');
const AccountabilityManager = require('./classes/AccountabilityManager.class');
const StoryManager = require('./classes/StoryManager.class');

localConfig = null;
try {
    var localConfig = require('./local-config');
    console.log('{INFO} Loaded LOCAL configuration file.');
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        // This is an expected error, log it and move on.
        console.log('Local config not available.');
    } else {
        throw e;
    }

}

if (localConfig != null) {
    config = localConfig;
} else {
    config = {
        environment: 'production',
        channel: 'bot_test',

        // Slack API settings
        token: process.env.FOUNDRYBOT_TOKEN, // obibot or lulzbot
        webapiTestToken: process.env.SLACK_WEB_API_TEST_TOKEN,
        botName: 'lulz',
        password: 'ffoundry.MUr0IDVbPois5VgPtbYY',
        Connector: SlackConnector,

        // Bot settings
        autoReconnect: true,
        autoMark: true,
        Persistence: MongoConnector,
        dbURL: process.env.MONGODB_URI,

        // Bot manager settings
        // @todo: make this a dynamic setting found by the manager registry
        Accountability: AccountabilityManager,
        Conversation: ConversationConnector,
        storyManager: StoryManager,

        // Twitter settings

        Twitter: TwitterConnector,
        twt_consumer_secret: process.env.TWT_CONSUMER_SECRET,
        twt_consumer_key: process.env.TWT_CONSUMER_KEY,

        // Air Quality Index API settings
        aqiToken: process.env.aqiToken,

        // Google API settings
        cseId: process.env.CSE_ID,
        cseKey: process.env.CSE_KEY,
        googleProjectId: process.env.GOOGLE_PROJECT_ID,
        type: process.env.type,
        project_id: process.env.project_id,
        private_key_id: process.env.private_key_id,
        private_key: process.env.private_key || '',
        client_email: process.env.client_email,
        client_id: process.env.client_id,
        auth_uri: process.env.auth_uri,
        token_uri: process.env.token_uri,
        auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
        client_x509_cert_url: process.env.client_x509_cert_url
    }
}

module.exports = config;
