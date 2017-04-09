function AccountabilityManager(config) {
    // TODO: move this to config
    this.aqiToken = config.aqiToken;
}

AccountabilityManager.prototype = {
    init: function(){
    },
    retrieveAqi: function (who, city, callback){
        var this_ = this;
        var request = require('request');
        request('https://api.waqi.info/search/?keyword=' + city + '&token=' + this_.aqiToken, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                bodyObj = JSON.parse(body);
                if (Boolean(bodyObj.data.length)) {                    
                    callback(this_._handle_aqi_response_body(bodyObj));
                } else {
                    var curl = require('curlrequest');

                    curl.request({ 
                        url: 'https://api.waqi.info/search/?keyword=' + city + '&token=' + this_.aqiToken, 
                        verbose: true, 
                        stderr: true 
                    }, function (err, stdout, meta) {
                        console.log(stdout);
                        bodyObj = JSON.parse(stdout);
                        callback(this_._handle_aqi_response_body(bodyObj));
                    });
                }               
            }
        });
    },
    _handle_aqi_response_body: function(body) {
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
        // this_.share("```\n" + JSON.stringify(bodyObj, null, '\t') + "\n```");
        // this.share("min = " + min + " max = " + max + " avg = " + sumAqi/count);
        // this.share("minStation = " + minStation + "\nmaxStation = " + maxStation);
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