var d3 = require('d3');
var jsdom = require('jsdom');

function D3Visualizations(){
    this.name = 'D3Visualizations';
}

D3Visualizations.prototype = {
    getBarChart: function (params) {

        var chart = barChart()
            .data(params.data)
            .width(params.width)
            .height(params.height)
            .xAxisLabel(params.xAxisLabel)
            .yAxisLabel(params.yAxisLabel);

        // append to jsdom
        d3.select('body').append('div').attr('id', params.containerId).call(chart);

        var selector = '#' + params.containerId;

        // get html string "<div id="bar-chart-small"><svg class="svg-chart"> ..."
        var svg = d3.select(selector).node().outerHTML;

        // remove from jsdom
        d3.select(selector).remove();

        return svg;

    },
}

module.exports = D3Visualizations;