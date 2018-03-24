const googleFinance = require('google-finance');
const moment = require('moment');

function FinanceDataManager(config) {
    this.name = 'FinanceDataManager';
    this.client = null;
    this.config = config;
    this.channel = config.channel;
    this.bot = null;
}

FinanceDataManager.prototype = {

    init: function (slashbot) {
        this.bot = slashbot;
        return this;
    },

    postTodays: (SYMBOL) => {

        const _this = this;

        const FROM = moment().startOf('week').format();
        const TO = moment().format();

        googleFinance.historical(
            {
                symbol: SYMBOL,
                from: FROM,
                to: TO
            },
            (err, results) => {
                if (results && results.length > 0) {
                    const q = results[0];
                    const m = `Last week's quote from ${SYMBOL}: open: ${q.open}, high: ${q.high}, low: ${q.low}, close: ${q.close}, volume: ${q.volume}`;
                    _this.bot.share(m);
                }
            }
        );
    }
};

module.exports = FinanceDataManager;
