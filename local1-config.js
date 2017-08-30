var IRCConnector = require("./classes/IRCConnector.class");
var SlackConnector = require("./classes/SlackConnector.class");
var JSONConnector = require("./classes/persistence/JSONConnector.class");
var MongoConnector = require("./classes/persistence/MongoConnector.class");
var ConversationConnector = require("./classes/conversation/ConversationCleverbot.class");
var TwitterConnector = require("./classes/TwitterConnector.class");
var AccountabilityManager = require("./classes/AccountabilityManager.class");

// Sample Slack-thru-IRC config
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
    googleProjectId: process.env.GOOGLE_PROJECT_ID || 'obibot-155602',
    type: process.env.type || '',
    project_id: process.env.project_id || 'obibot-155602',
    private_key_id: process.env.private_key_id || '0be3d60b224dcf99492932398eb1e3c8ee855752',
    private_key: process.env.private_key || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCXh7cXmqGQhJBs\nQDVn+aCfXER0q7vTeQb7Iwfi1wRBXAhqTP3Q4rKioA8fBgmxaads9OXxD0zycd9J\nKXsl8jhGkJIIsCkZCLeGve4Z0gXAny9M4QwqFTj8o2XDgXpS5EsC7AFjZZ+4zTFY\nwR23Rzj9UFZ/ukJRDZaHRzB6jLe3pz6uRcVgLm2COv3dqOyEXf3eq7v2EEg7wBEG\nSMNV0lUQGKUV4RugqkfVNJPICOTio/6VvAbHvsI6CpCgyyPfvUpYh/rgj7TCmV//\ndLLwlQpNBxVK7eWsvhDGrVApJGP8ssXkW0RCRHYc3NP14l9DSDZZT3YsBkIOD4Di\nrC/yX7SpAgMBAAECggEAMEQHWtpjOhAvnHt7R2oo8nnGSE9nXX3AboADBAsvDM6O\n06VAd6et9MT87AnVTpBzxu3ezEDuZo9E6x3uXvDfYgKssV3DSXkQVDftPoY6VNef\njmJkqIboBvjY8kQsvXiAOCcKbimxjYC2hinFGFr0WSOc2cRvWTf1yZMwauiloDaE\n8uXinvcy1lfhF9cqwDikyIDW4gYPZyVo/WLa/f30l9ZZSK6GDY3cxQ5auguPex8S\nddHkiC+tlHmJPjQD3/pYYZx1Hg0PbXaE7S/+zJ/JbEMYA6Wov0lvAZMPgJkQ3O+j\nOMwBpgPZyiNPEeUGsVvym4/X6120RlWJ8dAR+7xXMQKBgQDHKCbUeQYJ5NPM9X/P\nc4uhOgWwBXei/B7ToI/yLsbtx6yxqZB1lL9MazfG9goidtgv+mkOpoR+ZPfBqsrE\nuGcb68MMMNAzx7XcjfApDjf0Wteg0M4PyHBBudnKRinVL5xSCsAGC4XGzkzZItQl\nV2lpGVun2ZDDYL2tfefrgtcHfQKBgQDCx5wexSpnGnHnalJo361ZxY5flzVhNVGM\n1JLIiH2hag+kaL+sT+6h8/ZaJuRDjzGpC4fSDP2DvENWpa9PJmCc9+Z9EkuPICub\nCr0PpYeT/UoseBe2Vqu+T3Pwx31EvfLM+cIpbU+qfMtkzYksMZ36OdoVYuitgsFi\nFkrizv0hnQKBgDmouEU/nK30oBVw5kYLb9uHzum9S3vWfp5KmCJHxLRG4Qq2yuof\n3JqlWAq0ZQ7BVaneV9g0AZwOY2Sgq//0W3XL9jZrU3wKT+7A8U0RnsWSH2ehzGbp\nYwbEZfeYBLiCBkICdsHJSDvcsocS/FSrUAtrmguog67tLT0zfJfE07iJAoGBAIc5\nw4aNRcn8zxVleD89AwGvKQ/uT23kcXB/aER2lhnJI4D2BBQiDj87u02NcK4CrOx6\nh9npkNuziWCPeK1PrIVtigRM/k4ofH2QL/+74Ot6TtOesH+znlpqmMiSBsMByJ5L\ny2Otc0CekSqzk0cuT0oYffKZD4ben1l0tprOL2j1AoGAbpI6VieXAtc1gBKruMRa\nD52Do7YTOpWyeHscWnVi86uAXgUQmvCNBQSmBlRGNA87tXAxmC5Do6wQNLFqfmfE\n2AXkyNDsWsaxkUbg6z6uR2LXRYosaSADoScdSgDzs6hUOGP5NMMzGS470gt/p/AM\n6qhLGWE0vDlDVo7Q/IZMFS4=\n-----END PRIVATE KEY-----\n',
    client_email: process.env.client_email || '917574368028-compute@developer.gserviceaccount.com',
    client_id: process.env.client_id || '114839260413643647983',
    auth_uri: process.env.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.token_uri || 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.client_x509_cert_url || 'https://www.googleapis.com/robot/v1/metadata/x509/917574368028-compute%40developer.gserviceaccount.com',
    accountability: AccountabilityManager,
    aqiToken: '30ba56606e67af7b9e9993df62e8071864ef9b4e'
};
