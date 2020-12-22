var rawDataURL = 'crop/香蕉_avg.csv';
var xField = 'DateTime';
var yField = '平均價';
var vField = '交易量';

Plotly.d3.csv(rawDataURL, function(err, rawData) {
    if (err) throw err;

    var data = prepData(rawData);

    var traces = [];

    data.forEach((year, _) => {
        traces.push({
            r: year['y'],
            theta: year['x'],
            mode: 'lines',
            name: year['name'],
            type: 'scatterpolar',

        })
    })

    // for the angularaxis ticks
    // angular_data = {
    //     type: 'scatterpolar',
    //     r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //     theta: [...Array(12).keys()],
    //     subplot: "polar2"
    // };

    var layout = {
        title: '香蕉 各年平均價',
        showlegend: true,
        // orientation: -90,
        polar: {
            domain: {
                x: [0, 360]
            },
            radialaxis: {
                tickangle: 270,
                angle: 270
            },
            angularaxis: {
                tickmode: 'array',
                tickvals: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
                ticktext: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
                direction: "clockwise"
            },
        }
    };

    Plotly.newPlot('myDiv', traces, layout);
    // Plotly.plot('myDiv', data, layout);
});

function prepData(rawData) {
    let year_data = {};

    rawData.forEach(function(datum, i) {
        // sample interval
        if (i % 3) return;

        let full_date = new Date(datum[xField]);
        year = full_date.getFullYear().toString();

        let year_start = new Date(year + "-01-01");
        let offset = full_date.getTime() - year_start.getTime();

        // store data by each year
        if (!(year in year_data)) {
            year_data[year] = { 'x': new Array(), 'y': new Array(), 'mode': 'lines', 'name': year };
        }
        year_data[year]['x'].push(offset);
        year_data[year]['y'].push(datum[yField]);
    });

    function to_radius(min, max) {
        var delta = max - min;
        return function(val) {
            return ((val - min) / delta) * 360;
        };
    }

    // scale date to the radius
    // console.log(year_data)
    radius_year_data = {}
    Object.keys(year_data).forEach(key => {
        radius_year_data[key] = year_data[key];
        radius_year_data[key]['x'] = radius_year_data[key]['x'].map(to_radius(Math.min(...radius_year_data[key]['x']), Math.max(...radius_year_data[key]['x'])));
    });

    return Object.values(radius_year_data);
}