var rawDataURL = 'crop/香蕉_avg.csv';
var xField = 'DateTime';
var yField = '平均價';
var vField = '交易量';

Plotly.d3.csv(rawDataURL, function(err, rawData) {
    if (err) throw err;

    var data = prepData(rawData);
    var layout = {
        title: '香蕉 - 各年平均價',
        xaxis: {
            tickformat: '%m/%d'
        },
        yaxis: {
            title: '平均價 (元)',
        }
    };

    Plotly.plot('graph', data, layout, { showSendToCloud: true });
});



function prepData(rawData) {
    let year_data = {};

    rawData.forEach(function(datum, i) {
        // sample interval
        if (i % 3) return;

        let full_date = new Date(datum[xField]);
        year = full_date.getFullYear().toString();
        date = '2012-' + String(full_date.getMonth() + 1).padStart(2, '0') + '-' + String(full_date.getDate()).padStart(2, '0')

        // store data by each year
        if (!(year in year_data)) {
            year_data[year] = { 'x': new Array(date), 'y': new Array(datum[yField]), 'mode': 'lines', 'name': year };
        } else {
            year_data[year]['x'].push(date);
            year_data[year]['y'].push(datum[yField]);
        }
    });

    // console.log(year_data)

    return Object.values(year_data);
}