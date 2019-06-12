function AccountabilityManager(config) {
    this.name = 'AccountabilityManager';
    this.config = config;
}

AccountabilityManager.prototype = {

    init: function(obibot) {
        this.bot = obibot;
        return this;
    },

    trigger: function(from, text) {
        if (text.toLowerCase().indexOf('aqi') === 0) {
            const conversationPiece = text.substring('aqi '.length);
            this._aqi(from, conversationPiece);
        }
    },

    retrieveAqi: function (who, city, callback){
        var this_ = this;
        var request = require('request');
        request('https://api.waqi.info/search/?keyword=' + city + '&token=' + this_.config.aqiToken, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                bodyObj = JSON.parse(body);
                if (Boolean(bodyObj.data.length)) {
                    callback(this_.handleAqiResponseBody(bodyObj));
                } else {
                    var curl = require('curlrequest');

                    curl.request({
                        url: 'https://api.waqi.info/search/?keyword=' + city + '&token=' + this_.config.aqiToken,
                        verbose: true,
                        stderr: true
                    }, function (err, stdout, meta) {
                        console.log(stdout);
                        bodyObj = JSON.parse(stdout);
                        callback(this_.handleAqiResponseBody(bodyObj));
                    });
                }
            }
        });
    },

    _aqi(who, city) {
        const this_ = this;
        this.retrieveAqi(who, city, (result) => {
            if (!result) {
                this_.share('The stations are not transmitting data.');
                return;
            }
            this_.bot.share(`min = ${result.min} max = ${result.max} avg = ${result.avg}`);
            this_.bot.share(`minStation = ${result.minStation}\nmaxStation = ${result.maxStation}`);
            if (city === 'bogota') {
                this_.bot._tweet(who, `Qué está haciendo @EnriquePenalosa? #Polución Bogotana en ${result.max} AQI! http://aqicn.org/map/bogota/#@g/4.6187/-74.1907/11z`);
            }
            if (city === 'medellín') {
                this_.bot._tweet(who, `Qué pasa en #Medellín y el #ValleDeAburrá @FicoGutierrez? la #Polución esta en ${result.max} AQI! http://aqicn.org/map/colombia/medellin/#@g/6.208/-75.5957/12z`);
            }
        });
    },

    handleAqiResponseBody: function(body) {
        var count = 0;
        var sumAqi = 0;
        var max = 0;
        var maxStation = '';
        var min = 500;
        var minStation = '';
        for (var i = 0; i < bodyObj.data.length; i++) {
            if (!isNaN(bodyObj.data[i].aqi) && bodyObj.data[i].aqi) {
                var aqi = parseInt(bodyObj.data[i].aqi);
                sumAqi += aqi;
                if ( aqi > max ) {
                    max = aqi;
                    maxStation = bodyObj.data[i].station.name;
                }
                if ( aqi < min ) {
                    min = aqi;
                    minStation = bodyObj.data[i].station.name;
                }
                count++;
            }
        }
        if (count == 0) {
            return null;
        }
        return {
            "min": min,
            "minStation": minStation,
            "max": max,
            "maxStation": maxStation,
            "avg": sumAqi/count
        }
    }
};

module.exports = AccountabilityManager;
